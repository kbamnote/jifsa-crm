import React, { useState, useEffect } from "react";
import { getDetail, sendGroupMail } from "../../utils/Api";
import { FaEnvelope, FaPaperPlane, FaUser, FaCheckSquare, FaSquare, FaSearch } from "react-icons/fa";
import Cookies from "js-cookie";

const Mail = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

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
      // Prepare mail data
      const dataToSend = {
        leadIds: selectedLeads,
        to: ["ceo@mail.eliteassociate.in"], // As specified in requirements
        subject: mailData.subject,
        message: mailData.message
      };
      
      await sendGroupMail(dataToSend);
      
      // Reset form
      setMailData({
        subject: "",
        message: ""
      });
      setSelectedLeads([]);
      setSelectAll(false);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error sending mail:", error);
      setErrorMessage(error.response?.data?.message || "Failed to send mail. Please try again.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading leads...</p>
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