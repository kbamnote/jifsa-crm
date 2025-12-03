import React, { useState, useEffect } from "react";
import { getDetail, shareImage, sendGroupMail } from "../utils/Api";
import { FaEnvelope, FaPaperPlane, FaUser, FaCheckSquare, FaSquare, FaSearch, FaPaperclip, FaTimes } from "react-icons/fa";
import Cookies from "js-cookie";

const MailModal = ({ showModal, setShowModal, attachmentFile, imageToShare, selectedLeads: propSelectedLeads, onAttachmentClick, mode = 'share' }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  // Fetch leads
  const fetchLeads = async () => {
    // Only fetch leads if we don't have pre-selected leads
    if (!propSelectedLeads || propSelectedLeads.length === 0) {
      try {
        setLoading(true);
        const response = await getDetail();
        const allLeads = response.data || [];
        
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
        setErrorMessage("Failed to load leads. Please try again.");
        setShowError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      // If selectedLeads prop is provided, use it directly
      if (propSelectedLeads && propSelectedLeads.length > 0) {
        // Set the provided leads as both the full list and filtered list
        setLeads(propSelectedLeads);
        setFilteredLeads(propSelectedLeads);
        // Pre-select the leads
        setSelectedLeads(propSelectedLeads.map(lead => lead._id || lead.id));
        // No need to show loading since we already have the leads
        setLoading(false);
      } else {
        // Otherwise, fetch all leads as before
        fetchLeads();
      }
      
      // Initialize with the attachment file if provided
      if (attachmentFile) {
        // For URL-based files, we just store the reference
        // The backend will handle downloading the file
        setAttachments([attachmentFile]);
      }
    }
  }, [showModal, attachmentFile, propSelectedLeads]);

  // Filter leads based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredLeads(leads);
    } else {
      const filtered = leads.filter(lead => 
        (lead.fullName && lead.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phoneNo && lead.phoneNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.productCompany && lead.productCompany.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLeads(filtered);
    }
  }, [searchTerm, leads]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle lead selection
  const toggleLeadSelection = (leadId) => {
    // If we have pre-selected leads from props, don't allow deselection
    if (propSelectedLeads && propSelectedLeads.length > 0) {
      // Only allow selection, not deselection
      if (!selectedLeads.includes(leadId)) {
        setSelectedLeads([...selectedLeads, leadId]);
      }
    } else {
      // Normal behavior for multi-selection
      if (selectedLeads.includes(leadId)) {
        setSelectedLeads(selectedLeads.filter(id => id !== leadId));
      } else {
        setSelectedLeads([...selectedLeads, leadId]);
      }
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    // Only allow select all if we don't have pre-selected leads
    if (!propSelectedLeads || propSelectedLeads.length === 0) {
      if (selectAll) {
        setSelectedLeads([]);
      } else {
        setSelectedLeads(filteredLeads.map(lead => lead._id));
      }
      setSelectAll(!selectAll);
    }
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
    
    // Use the appropriate API based on mode
    if (mode === 'share' && imageToShare) {
      await handleShareImage();
    } else {
      await handleSendGroupMail();
    }
  };

  // Handle image sharing
  const handleShareImage = async () => {
    setSending(true);
    setShowError(false);
    
    try {
      const shareData = {
        leadIds: selectedLeads,
        subject: mailData.subject,
        message: mailData.message
      };
      
      await shareImage(imageToShare._id, shareData);
      
      // Reset form
      setMailData({
        subject: "",
        message: ""
      });
      setSelectedLeads([]);
      setSelectAll(false);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error sharing image:", error);
      setErrorMessage(error.response?.data?.message || "Failed to share image. Please try again.");
      setShowError(true);
    } finally {
      setSending(false);
    }
  };
  
  // Handle sending group mail
  const handleSendGroupMail = async () => {
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
      
      // If we have an attachment file, we need to handle it
      // For URL-based attachments, we'll pass the URL in the request
      if (attachments.length > 0) {
        if (attachments[0].url && !attachments[0].file) {
          // This is a URL-based attachment
          formData.append('attachmentUrls[]', attachments[0].url);
          formData.append('attachmentNames[]', attachments[0].name);
        } else if (attachments[0].file) {
          // This is a file attachment
          formData.append('attachments', attachments[0].file);
        } else if (attachments[0] instanceof File) {
          // This is a file attachment (fallback)
          formData.append('attachments', attachments[0]);
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
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending group mail:", error);
      setErrorMessage(error.response?.data?.message || "Failed to send mail. Please try again.");
      setShowError(true);
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

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaEnvelope className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">
              Share File via Email
            </h3>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mail Composition Panel */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Compose Email</h2>
                  
                  <form onSubmit={handleSendMail}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={mailData.subject}
                          onChange={handleInputChange}
                          placeholder="Enter email subject"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={mailData.message}
                          onChange={handleInputChange}
                          placeholder="Enter your message here..."
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                          required
                        />
                      </div>
                      
                      {/* Attachment Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Attachment
                        </label>
                        <div className="flex items-center space-x-2">
                          {attachments.length > 0 ? (
                            <div className="flex items-center justify-between bg-gray-100 p-2 rounded w-full">
                              <div className="flex items-center space-x-2">
                                <FaPaperclip className="text-gray-500" />
                                <span className="text-sm truncate">{attachments[0].name || "Attached File"}</span>
                              </div>
                              <button 
                                onClick={() => setAttachments([])}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                              onClick={onAttachmentClick}
                            >
                              <div className="flex items-center space-x-1">
                                <FaPaperclip className="w-4 h-4" />
                                <span>Select Attachment</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Attachment Preview */}
                      {attachments.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Attachment
                          </label>
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <FaPaperclip className="text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {attachments[0].name || "Attached File"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {attachments[0].url ? "URL: " + attachments[0].url.substring(0, 30) + "..." : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={sending || selectedLeads.length === 0}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          sending || selectedLeads.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                        }`}
                      >
                        {sending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              
              {/* Leads Selection Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200">
                  {/* Panel Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">
                          {propSelectedLeads && propSelectedLeads.length > 0 ? 'Lead Selected' : 'Select Leads'}
                        </h2>
                        <p className="text-gray-600 text-sm">
                          {propSelectedLeads && propSelectedLeads.length > 0 
                            ? `${selectedLeads.length} of 1 lead selected`
                            : `${selectedLeads.length} of ${filteredLeads.length} leads selected`
                          }
                        </p>
                      </div>
                      
                      {/* Search Bar */}
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search leads..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Select All */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <button
                      onClick={toggleSelectAll}
                      className={`flex items-center gap-2 text-sm font-medium hover:text-blue-800 ${
                        propSelectedLeads && propSelectedLeads.length > 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                      disabled={propSelectedLeads && propSelectedLeads.length > 0}
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
                  <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading leads...</p>
                      </div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="text-center py-8">
                        <FaUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-md font-medium text-gray-900 mb-1">No leads found</h3>
                        <p className="text-gray-500 text-sm">
                          {searchTerm ? 'No leads match your search' : 'No leads available'}
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {filteredLeads.map((lead) => (
                          <li 
                            key={lead._id} 
                            className="px-4 py-3 hover:bg-gray-50 transition-colors"
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
                                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-8 h-8 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">
                                      {getLeadName(lead).charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{getLeadName(lead)}</p>
                                  <p className="text-xs text-gray-500">{getLeadEmail(lead)}</p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500">
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
      </div>
    </div>
  );
};

export default MailModal;