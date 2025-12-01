import React, { useState, useEffect } from "react";
import { getMailTrackingData } from "../../utils/Api";
import { FaEnvelope, FaSearch, FaSync, FaCheckCircle, FaClock, FaTimesCircle, FaPaperclip, FaEye, FaTimes } from "react-icons/fa";

const MailTracking = () => {
  const [mails, setMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [selectedMail, setSelectedMail] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch mail tracking data
  const fetchMailTrackingData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMailTrackingData();
      // Extract mails from the response (response.data.mails)
      const data = response.data?.mails || [];
      setMails(data);
      setFilteredMails(data);
    } catch (err) {
      console.error("Error fetching mail tracking data:", err);
      setError("Failed to load mail tracking data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMailTrackingData();
  }, []);

  // Filter mails based on search term and status
  useEffect(() => {
    let result = mails;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(mail => 
        (mail.subject && mail.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mail.recipients && mail.recipients.some(recipient => recipient.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (mail.leadIds && mail.leadIds.some(lead => 
          (lead.fullName && lead.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ))
      );
    }
    
    // Apply status filter (in this case, we'll consider all mails as "sent" since that's the only status we have)
    if (statusFilter !== "all") {
      // For now, we don't have different statuses in the API response, so we'll just filter by "sent"
      // In a real implementation, this would filter based on actual status fields
    }
    
    setFilteredMails(result);
  }, [searchTerm, statusFilter, mails]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRecipientCount = (mail) => {
    return mail.recipients ? mail.recipients.length : 0;
  };

  const getLeadCount = (mail) => {
    return mail.leadIds ? mail.leadIds.length : 0;
  };

  const hasAttachments = (mail) => {
    return mail.attachments && mail.attachments.length > 0;
  };

  const handleViewDetails = (mail) => {
    setSelectedMail(mail);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMail(null);
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
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          
          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
          
          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-red-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchMailTrackingData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
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
              <h1 className="text-3xl font-bold text-gray-800">Mail Tracking</h1>
              <p className="text-gray-600">Monitor the status of your sent emails</p>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject, recipient, or lead name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaSync className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <FaEnvelope className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sent</p>
                <p className="text-2xl font-bold text-gray-800">{mails.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <FaEnvelope className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-800">
                  {mails.reduce((total, mail) => total + getRecipientCount(mail), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <FaEnvelope className="text-purple-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-gray-800">
                  {mails.reduce((total, mail) => total + getLeadCount(mail), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                <FaPaperclip className="text-yellow-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">With Attachments</p>
                <p className="text-2xl font-bold text-gray-800">
                  {mails.filter(mail => hasAttachments(mail)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mail Tracking Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Recipients
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Leads
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Sent Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Attachments
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMails.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No emails found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredMails.map((mail) => (
                    <tr key={mail._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{mail.subject || 'No Subject'}</div>
                        <div className="text-xs text-gray-500">From: {mail.senderEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getRecipientCount(mail)} recipient{getRecipientCount(mail) !== 1 ? 's' : ''}
                        </div>
                        {mail.recipients && mail.recipients.length > 0 && (
                          <div className="text-xs text-gray-500 truncate">
                            {mail.recipients[0]}
                            {mail.recipients.length > 1 && ` +${mail.recipients.length - 1} more`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getLeadCount(mail)} lead{getLeadCount(mail) !== 1 ? 's' : ''}
                        </div>
                        {mail.leadIds && mail.leadIds.length > 0 && (
                          <div className="text-xs text-gray-500 truncate">
                            {mail.leadIds[0].fullName || mail.leadIds[0].email}
                            {mail.leadIds.length > 1 && ` +${mail.leadIds.length - 1} more`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(mail.sentAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasAttachments(mail) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FaPaperclip className="mr-1" />
                            {mail.attachments.length}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewDetails(mail)}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mail Details Modal */}
      {showModal && selectedMail && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Mail Details</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
                      <p className="text-gray-900 font-medium">{selectedMail.subject || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Sender Email</label>
                      <p className="text-blue-600">{selectedMail.senderEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Sender Role</label>
                      <p className="text-gray-900">{selectedMail.senderRole || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Recipient Type</label>
                      <p className="text-gray-900">{selectedMail.recipientType || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Message ID</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedMail.messageId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Sent Date</label>
                      <p className="text-gray-900">{formatDate(selectedMail.sentAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Recipients Email ({getRecipientCount(selectedMail)})</h4>
                  <div className="space-y-2">
                    {selectedMail.recipients && selectedMail.recipients.length > 0 ? (
                      selectedMail.recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-medium text-sm">{index + 1}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-900">{recipient}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No recipients found</p>
                    )}
                  </div>
                </div>

                {/* Leads */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Leads ({getLeadCount(selectedMail)})</h4>
                  <div className="space-y-2">
                    {selectedMail.leadIds && selectedMail.leadIds.length > 0 ? (
                      selectedMail.leadIds.map((lead, index) => (
                        <div key={lead._id} className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-800 font-medium text-sm">
                              {lead.fullName ? lead.fullName.charAt(0).toUpperCase() : '#'}
                            </span>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-gray-900 font-medium">{lead.fullName || 'N/A'}</p>
                            <p className="text-gray-600 text-sm">{lead.email || 'N/A'}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {lead._id}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No leads found</p>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Attachments ({hasAttachments(selectedMail) ? selectedMail.attachments.length : 0})</h4>
                  <div className="space-y-2">
                    {hasAttachments(selectedMail) ? (
                      selectedMail.attachments.map((attachment, index) => (
                        <div key={attachment._id} className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <FaPaperclip className="text-yellow-600 w-5 h-5" />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-gray-900 font-medium">{attachment.filename || 'N/A'}</p>
                            <p className="text-gray-600 text-sm">
                              {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : 'Size unknown'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {attachment._id}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No attachments found</p>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Sent At</label>
                      <p className="text-gray-900">{formatDate(selectedMail.sentAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
                      <p className="text-gray-900">{formatDate(selectedMail.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Updated At</label>
                      <p className="text-gray-900">{formatDate(selectedMail.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailTracking;