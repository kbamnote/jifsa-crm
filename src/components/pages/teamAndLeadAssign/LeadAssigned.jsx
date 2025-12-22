import React, { useState, useEffect } from 'react';
import { Users, Calendar, Phone, Mail, MapPin, Eye, UserCheck, TrendingUp, Clock, Plus, Edit, Filter, Search } from 'lucide-react';
import { getDetail } from '../../utils/Api';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import AddLeadModal from '../../modal/AddLeadModal';
import UpdateLeadModal from '../../modal/UpdateLeadModal';
import MailModal from '../../modal/MailModal';
import FileSelectionModal from '../../modal/FileSelectionModal';

const LeadAssigned = () => {
  const navigate = useNavigate();
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [showFileSelectionModal, setShowFileSelectionModal] = useState(false);
  const [mailAttachments, setMailAttachments] = useState([]);
  const [leadToUpdate, setLeadToUpdate] = useState(null);
  const [leadToShare, setLeadToShare] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [callStatusFilter, setCallStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  useEffect(() => {
    fetchLeads();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [assignedLeads, searchTerm, statusFilter, productFilter, callStatusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all leads
      const allLeadsResponse = await getDetail();
      const allLeads = allLeadsResponse.data || [];
      
      // Filter assigned leads for current user
      const userAssignedLeads = allLeads.filter(lead => {
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
      
      setAssignedLeads(userAssignedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...assignedLeads];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lead => 
        (lead.fullName && lead.fullName.toLowerCase().includes(term)) ||
        (lead.email && lead.email.toLowerCase().includes(term)) ||
        (lead.phoneNo && lead.phoneNo.includes(term)) ||
        (lead.productCompany && lead.productCompany.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    // Apply product filter
    if (productFilter !== 'all') {
      result = result.filter(lead => lead.productCompany?.toLowerCase().replace(/\s+/g, '-') === productFilter);
    }
    
    // Apply call status filter
    if (callStatusFilter !== 'all') {
      result = result.filter(lead => lead.callStatus === callStatusFilter);
    }
    
    setFilteredLeads(result);
  };
  
  const handleAddLead = () => {
    setShowAddModal(true);
  };
  
  const handleEditLead = (lead) => {
    setLeadToUpdate(lead);
    setShowUpdateModal(true);
  };
  
  const handleMailAction = (lead) => {
    setLeadToShare(lead);
    setShowMailModal(true);
  };
  
  const handleViewLead = (lead) => {
    navigate(`/lead/${lead._id}`);
  };
  
  // Function to handle attachment selection
  const handleSelectAttachment = () => {
    setShowFileSelectionModal(true);
  };
  
  // Function to handle file selection from gallery
  const handleFileSelectFromGallery = (file) => {
    // Create attachment object similar to ImgAndFiles.jsx
    const attachment = {
      name: file.name,
      url: file.imageUrl,
      isImage: isImageFile(file.imageUrl)
    };
    setMailAttachments([attachment]);
    setShowFileSelectionModal(false);
  };
  
  // Helper function to determine if a file is an image (copied from ImgAndFiles.jsx)
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };
  
  // Helper function to get file icon based on type (copied from ImgAndFiles.jsx)
  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      'pdf': '📑',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📽️',
      'pptx': '📽️',
      'zip': '📦',
      'rar': '📦',
    };
    
    return iconMap[extension] || '📄';
  };
  
  // Helper function to format file size (copied from ImgAndFiles.jsx)
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Helper function to format date (copied from ImgAndFiles.jsx)
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Helper function to truncate filename (copied from ImgAndFiles.jsx)
  const truncateFileName = (fileName, maxLength = 20) => {
    if (!fileName) return '';
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength - 3) + '...';
  };
  
  // Helper function to format file type display (copied from ImgAndFiles.jsx)
  const formatFileType = (fileName) => {
    if (!fileName) return 'Unknown';
    return fileName.split('.').pop().toUpperCase();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };
  
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'interested':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'not_interested':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'read':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'unread':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  


  // Get assigned by information
  const getAssignedByInfo = (lead) => {
    if (lead.assignedByName) {
      return lead.assignedByName;
    }
    
    if (lead.assignedBy) {
      if (typeof lead.assignedBy === 'string') {
        return lead.assignedBy;
      } else if (typeof lead.assignedBy === 'object') {
        if (lead.assignedBy.name && lead.assignedBy.email) {
          return `${lead.assignedBy.name} (${lead.assignedBy.email})`;
        } else if (lead.assignedBy.name) {
          return lead.assignedBy.name;
        } else if (lead.assignedBy.email) {
          return lead.assignedBy.email;
        }
      }
    }
    
    return 'N/A';
  };

  // Calculate statistics
  const interestedLeads = assignedLeads.filter(lead => lead.status?.toLowerCase() === 'interested').length;
  const notInterestedLeads = assignedLeads.filter(lead => lead.status?.toLowerCase() === 'not_interested').length;
  const recentLeads = assignedLeads.filter(lead => {
    const createdDate = new Date(lead.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Assigned Leads</h1>
                <p className="text-blue-100 text-lg">View and manage your assigned leads</p>
                <p className="text-sm text-blue-100 mt-1">Total Leads: {filteredLeads.length}</p>
              </div>
              <button
                onClick={handleAddLead}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add New Lead
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <Users className="w-4 h-4" /> Total Leads
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{assignedLeads.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Interested
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">{interestedLeads}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Recent (7 days)
                </p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{recentLeads}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filter Leads
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          {showFilters && (
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Leads
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </div>
                
                {/* Product Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="jifsa">JIFSA</option>
                    <option value="elite-bim">Elite BIM</option>
                    <option value="eee-technologies">EEE Technologies</option>
                  </select>
                </div>
                
                {/* Call Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Status
                  </label>
                  <select
                    value={callStatusFilter}
                    onChange={(e) => setCallStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Call Status</option>
                    <option value="not_called">Not Called</option>
                    <option value="called">Called</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Assigned Leads Section with enhanced styling */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Leads Assigned to You
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No assigned leads</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' || productFilter !== 'all' || callStatusFilter !== 'all'
                    ? 'No leads match your current filters. Try adjusting your search or filters.'
                    : "You don't have any leads assigned to you yet. Your manager will assign leads to you soon."}
                </p>
                {!searchTerm && statusFilter === 'all' && productFilter === 'all' && callStatusFilter === 'all' && (
                  <button
                    onClick={handleAddLead}
                    className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Lead
                  </button>
                )
              }</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned By</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {lead.fullName?.charAt(0) || 'U'}
                          </div>
                          <div className="ml-3">
                            <div className="font-semibold text-gray-800">{lead.fullName || 'Unnamed Lead'}</div>
                            <div className="text-sm text-gray-500">{lead.productCompany || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800">{lead.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{lead.phoneNo || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(lead.status)}`}>
                          {lead.status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800">{getAssignedByInfo(lead)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateShort(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLead(lead)}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="View Lead Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleMailAction(lead)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                            title="Send Mail"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* Modals */}
        <AddLeadModal
          showModal={showAddModal}
          setShowModal={setShowAddModal}
          onSuccess={fetchLeads}
        />
        
        <UpdateLeadModal
          showModal={showUpdateModal}
          setShowModal={setShowUpdateModal}
          selectedRecord={leadToUpdate}
          onSuccess={fetchLeads}
        />
        
        <MailModal
          showModal={showMailModal}
          setShowModal={setShowMailModal}
          attachmentFile={mailAttachments.length > 0 ? mailAttachments[0] : null}
          imageToShare={leadToShare}
          selectedLeads={[leadToShare]}
          onAttachmentClick={handleSelectAttachment}
          mode="send"
        />
        
        {/* File Selection Modal */}
        <FileSelectionModal
          isOpen={showFileSelectionModal}
          onClose={() => setShowFileSelectionModal(false)}
          onFileSelect={handleFileSelectFromGallery}
        />
      </div>
    </div>
  );
};

export default LeadAssigned;  