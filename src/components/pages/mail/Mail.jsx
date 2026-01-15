import React, { useState, useEffect } from "react";
import { getDetail, sendGroupMail } from "../../utils/Api";
import { FaEnvelope, FaPaperPlane, FaUser, FaCheckSquare, FaSquare, FaSearch, FaPaperclip, FaTimes, FaImages } from "react-icons/fa";
import Cookies from "js-cookie";
import FileSelectionModal from "../../modal/FileSelectionModal.jsx";

const Mail = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productCompanyFilter, setProductCompanyFilter] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  const [mailData, setMailData] = useState({
    subject: "",
    message: ""
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);

  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getDetail();
      const allLeads = response.data || [];
      console.log(response, "Mail");
      
      // For sales persons, only show leads assigned to them
      let filteredLeads = allLeads;
      if (userRole.toLowerCase() === 'sales') {
        filteredLeads = allLeads.filter(lead => {
          // Check if lead is assigned to current user
          if (!lead.assignedTo) return false;
          
          // Handle both string and object formats for assignedTo
          if (typeof lead.assignedTo === 'string') {
            return lead.assignedTo.toLowerCase() === userEmail.toLowerCase();
          } else if (typeof lead.assignedTo === 'object' && lead.assignedTo.email) {
            return lead.assignedTo.email.toLowerCase() === userEmail.toLowerCase();
          }
          
          return false;
        });
      }
      
      setLeads(filteredLeads);
      setFilteredLeads(filteredLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Format product company names
  const formatCompanyName = (companyValue) => {
    const companyMap = {
      'eee-technologies': 'EEE Technologies',
      'bim': 'Elite BIM',
      'bifs': 'Elite BIFS',
      'jifsa': 'JIFSA',
      'jobs': 'Elite Jobs',
      'cards': 'Elite Cards',
      'management': 'Elite Management',
      'associate': 'Elite Associate'
    };
    return companyMap[companyValue] || companyValue;
  };

  // Extract unique product companies for filter dropdown
  const uniqueProductCompanies = [...new Set(leads.map(lead => lead.productCompany).filter(company => company))];

  // Filter leads based on search term and product company
  useEffect(() => {
    let filtered = leads;
    
    // Apply product company filter first
    if (productCompanyFilter) {
      filtered = filtered.filter(lead => 
        lead.productCompany && lead.productCompany.toLowerCase().includes(productCompanyFilter.toLowerCase())
      );
    }
    
    // Then apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        (lead.fullName && lead.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phoneNo && lead.phoneNo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredLeads(filtered);
  }, [searchTerm, productCompanyFilter, leads]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (PDF and images only)
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        setErrorMessage(`File "${file.name}" is not a valid PDF or image file`);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
      return isValid;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset input
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle lead selection
  const toggleLeadSelection = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead._id));
    }
    setSelectAll(!selectAll);
  };

  // Send mail
  const handleSendMail = async (e) => {
    e.preventDefault();
    
    if (selectedLeads.length === 0) {
      setErrorMessage("Please select at least one lead to send mail");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    if (!mailData.subject.trim() || !mailData.message.trim()) {
      setErrorMessage("Please fill in both subject and message");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    setSending(true);
    setShowError(false);
    
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append leadIds as array
      selectedLeads.forEach(id => {
        formData.append('leadIds[]', id);
      });
      
      // Append subject and message
      formData.append('subject', mailData.subject);
      formData.append('message', mailData.message);
      
      // Process attachments - handle both local files and gallery files
      for (const file of attachments) {
        if (file.galleryUrl) {
          // This is a gallery file, need to fetch it first
          try {
            const response = await fetch(file.galleryUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch gallery file: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();
            
            // Create a new File object with the actual content
            const fileWithContent = new File([blob], file.name, { type: file.type });
            formData.append('attachments', fileWithContent);
          } catch (error) {
            console.error('Error fetching gallery file:', error);
            throw new Error(`Could not process gallery file: ${file.name}`);
          }
        } else {
          // This is a local file
          formData.append('attachments', file);
        }
      }
      
      await sendGroupMail(formData);
      
      // Reset form
      setMailData({
        subject: "",
        message: ""
      });
      setSelectedLeads([]);
      setSelectAll(false);
      setAttachments([]);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error sending mail:", error);
      setErrorMessage(error.response?.data?.message || error.message || "Failed to send mail. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSending(false);
    }
  };

  // Get lead name
  const getLeadName = (lead) => {
    return lead.fullName || lead.email || 'Unnamed Lead';
  };

  // Get lead email
  const getLeadEmail = (lead) => {
    return lead.email || 'No email';
  };

  // Handle file selection from gallery
  const handleFileSelectFromGallery = async (selectedFile) => {
    try {
      // Create a temporary file object using the URL
      // First, get the file extension to determine the type
      const mimeType = getMimeType(selectedFile.name);
      
      // For gallery files, we'll create a placeholder File object
      // We'll handle the actual file retrieval during form submission
      const file = new File([], selectedFile.name, { type: mimeType });
      
      // Add a custom property to identify this as a gallery file
      file.galleryUrl = selectedFile.imageUrl;
      
      // Validate file type
      if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
        setAttachments(prev => [...prev, file]);
      } else {
        setErrorMessage(`File "${selectedFile.name}" is not a valid PDF or image file`);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        return; // Don't close modal if validation fails
      }
      
      setShowFileModal(false);
    } catch (error) {
      console.error('Error processing file from gallery:', error);
      setErrorMessage('Failed to process the selected file: ' + error.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      setShowFileModal(false); // Close modal even on error
    }
  };
  
  // Helper function to get mime type based on file extension
  const getMimeType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };
  

  // Helper function to determine if a file is an image
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().includes(ext));
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse">
          {/* Header Section */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-96">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Leads Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <FaEnvelope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Email Campaign</h1>
              <p className="text-gray-600">Send emails to your leads</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Email sent successfully to {selectedLeads.length} lead(s)!
          </div>
        )}
        
        {showError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mail Composition Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaPaperPlane className="text-blue-600" />
                Compose Email
              </h2>
              
              <form onSubmit={handleSendMail}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={mailData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter email subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={mailData.message}
                      onChange={handleInputChange}
                      placeholder="Enter your message here..."
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      required
                    />
                  </div>
                  
                  {/* Attachments Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments (PDF & Images)
                    </label>
                                        
                    <div className="flex gap-2">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex-1">
                        <FaPaperclip className="text-gray-500" />
                        <span className="text-sm text-gray-600">Choose files</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                                          
                      <button
                        type="button"
                        onClick={() => setShowFileModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <FaImages className="text-gray-500" />
                        <span className="text-sm text-gray-600">Gallery</span>
                      </button>
                    </div>
                    
                    {/* Attachment List */}
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FaPaperclip className="text-gray-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-700 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Note:</span> Email will be sent to "ceo@mail.eliteassociate.in" with selected leads' information.
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={sending || selectedLeads.length === 0}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      sending || selectedLeads.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-4 h-4" />
                        Send Email to {selectedLeads.length} Lead(s)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* File Selection Modal */}
          <FileSelectionModal 
            isOpen={showFileModal} 
            onClose={() => setShowFileModal(false)} 
            onFileSelect={handleFileSelectFromGallery}
          />
          
          {/* Leads Selection Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Panel Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Select Leads</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {selectedLeads.length} of {filteredLeads.length} leads selected
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Product Company Filter */}
                    <div className="relative">
                      <select
                        value={productCompanyFilter}
                        onChange={(e) => setProductCompanyFilter(e.target.value)}
                        className="pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">All Companies</option>
                        {uniqueProductCompanies.map((company, index) => (
                          <option key={index} value={company}>{formatCompanyName(company)}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative flex-grow">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Select All */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {selectAll ? (
                    <FaCheckSquare className="w-4 h-4" />
                  ) : (
                    <FaSquare className="w-4 h-4" />
                  )}
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {/* Leads List */}
              <div className="max-h-[500px] overflow-y-auto">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No leads found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'No leads match your search' : 'No leads available'}
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <li 
                        key={lead._id} 
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleLeadSelection(lead._id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {selectedLeads.includes(lead._id) ? (
                                <FaCheckSquare className="w-5 h-5" />
                              ) : (
                                <FaSquare className="w-5 h-5" />
                              )}
                            </button>
                            
                            <div className="flex-shrink-0">
                              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {getLeadName(lead).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-900">{getLeadName(lead)}</p>
                              <p className="text-sm text-gray-500">{getLeadEmail(lead)}</p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            {lead.productCompany}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mail;