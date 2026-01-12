import React, { useState, useEffect } from 'react';

// Custom scrollbar CSS
const scrollbarCSS = `
  /* Custom Scrollbar Styles */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #c5c5c5;
    border-radius: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  .hover\\:scrollbar-thumb-gray-400:hover::-webkit-scrollbar-thumb {
    background: #9ca3af;
  }
`;
import { Users, Calendar, Phone, Mail, MapPin, Eye, UserCheck, TrendingUp, Clock, Plus, Edit, Filter, Search, X, CheckSquare, Square } from 'lucide-react';
import { getDetail, updateEducation as updateEducationApi, addRemark } from '../../utils/Api';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import AddLeadModal from '../../modal/AddLeadModal';
import UpdateLeadModal from '../../modal/UpdateLeadModal';
import MailModal from '../../modal/MailModal';
import FileSelectionModal from '../../modal/FileSelectionModal';
import RemarkModal from '../../modal/RemarkModal';
import AllRemarksModal from '../../modal/AllRemarksModal';

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
  const [remarkStatusFilter, setRemarkStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  useEffect(() => {
    fetchLeads();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [assignedLeads, searchTerm, statusFilter, productFilter, callStatusFilter]);
  
  // Calculate statistics
  const interestedLeads = assignedLeads.filter(lead => lead.status?.toLowerCase() === 'interested').length;
  const notInterestedLeads = assignedLeads.filter(lead => lead.status?.toLowerCase() === 'not_interested').length;
  const recentLeads = assignedLeads.filter(lead => {
    const createdDate = new Date(lead.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;

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
    
    // Apply remark status filter
    if (remarkStatusFilter !== 'all') {
      result = result.filter(lead => {
        if (!lead.remarks || lead.remarks.length === 0) {
          return remarkStatusFilter === 'no_remarks';
        }
        return lead.remarks.some(remark => remark.status === remarkStatusFilter);
      });
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        // Compare dates only (ignore time)
        return leadDate.toDateString() === filterDate.toDateString();
      });
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
  
  // Format date in the same format as used in the created column (e.g., 10 Jan 2026)
  const formatDateDDMMMYYYY = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };
  
  // Get assigned by information
  const getAssignedByInfo = (lead) => {
    // First check if assignedByName exists (formatted string)
    if (lead.assignedByName) {
      return lead.assignedByName;
    }
    
    // Check assignedBy object
    if (lead.assignedBy && typeof lead.assignedBy === 'object') {
      if (lead.assignedBy.name && lead.assignedBy.email) {
        return `${lead.assignedBy.name} (${lead.assignedBy.email})`;
      } else if (lead.assignedBy.name) {
        return lead.assignedBy.name;
      } else if (lead.assignedBy.email) {
        return lead.assignedBy.email;
      }
    }
    
    // Check assignedTo object
    if (lead.assignedTo && typeof lead.assignedTo === 'object') {
      if (lead.assignedTo.name && lead.assignedTo.email) {
        return `${lead.assignedTo.name} (${lead.assignedTo.email})`;
      } else if (lead.assignedTo.name) {
        return lead.assignedTo.name;
      } else if (lead.assignedTo.email) {
        return lead.assignedTo.email;
      }
    }
    
    // Fallback to name if available in other formats
    if (lead.assignedBy && typeof lead.assignedBy === 'string') {
      return lead.assignedBy;
    }
    
    if (lead.assignedTo && typeof lead.assignedTo === 'string') {
      return lead.assignedTo;
    }
    
    return 'Self-Assigned';
  };
  

  
  const updateEducation = async (leadId, educationField) => {
    try {
      // Call the API function
      await updateEducationApi(leadId, educationField);
      
      // Update the local state
      setAssignedLeads(prev => prev.map(lead => {
        if (lead._id === leadId) {
          const updatedEducation = { ...lead.education, [educationField]: !lead.education?.[educationField] };
          return { ...lead, education: updatedEducation };
        }
        return lead;
      }));
    } catch (error) {
      console.error('Error updating education:', error);
      setError(error.message || 'Failed to update education');
    }
  };
  
  const toggleEducation = (leadId, educationField) => {
    updateEducation(leadId, educationField);
  };
  

  // State for managing remark modals
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [showAllRemarksModal, setShowAllRemarksModal] = useState(false);
  const [currentLeadForRemark, setCurrentLeadForRemark] = useState(null);
  
  // State for reminders
  const [showReminders, setShowReminders] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  
  // State for group mail

  
  // Function to handle remark status change
  const handleRemarkStatusChange = (lead) => {
    setCurrentLeadForRemark(lead);
    setShowRemarkModal(true);
  };
  
  // Function to get upcoming reminders
  const getUpcomingReminders = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reminders = [];
    
    assignedLeads.forEach(lead => {
      if (lead.remarks && lead.remarks.length > 0) {
        lead.remarks.forEach(remark => {
          if (remark.reminderDate) {
            const reminderDate = new Date(remark.reminderDate);
            // Check if reminder is today or tomorrow
            if (reminderDate >= now && reminderDate <= tomorrow) {
              reminders.push({
                ...remark,
                leadName: lead.fullName,
                leadId: lead._id,
                reminderDate: reminderDate
              });
            }
          }
        });
      }
    });
    
    // Sort by date
    reminders.sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
    setUpcomingReminders(reminders);
    setShowReminders(true);
  };
  
  // Function to format reminder date
  const formatReminderDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  

  
  // Function to add a remark
  const addRemarkToLead = async (remarkData) => {
    try {
      // Combine date and time if both are provided
      let fullReminderDate = null;
      if (remarkData.reminderDate && remarkData.reminderTime) {
        // Create a new Date object combining the date and time
        fullReminderDate = new Date(`${remarkData.reminderDate}T${remarkData.reminderTime}`);
      } else if (remarkData.reminderDate) {
        // If only date is provided, use the date at midnight
        fullReminderDate = new Date(remarkData.reminderDate);
      }
      
      const response = await addRemark(remarkData.leadId, {
        message: remarkData.message,
        status: remarkData.status,
        reminderDate: fullReminderDate
      });
      
      // Update the local state
      setAssignedLeads(prev => prev.map(lead => {
        if (lead._id === remarkData.leadId) {
          return { ...response.data.updatedForm };
        }
        return lead;
      }));
      
      // Close the modal
      setShowRemarkModal(false);
      setCurrentLeadForRemark(null);
      setShowAllRemarksModal(false);
    } catch (error) {
      console.error('Error adding remark:', error);
      setError(error.message || 'Failed to add remark');
    }
  };

  const handleRemarkSubmit = async (remarkData) => {
    await addRemarkToLead(remarkData);
  };

  // Adding custom styles for better UI
  const tableStyle = {
    style: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 4px',
    },
    cellStyle: {
      padding: '16px',
      verticalAlign: 'top',
    }
  };
  
  return (
    <>
      <style>{scrollbarCSS}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with enhanced styling */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-white">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Assigned Leads</h1>
                    <p className="text-blue-100 text-base">View and manage your assigned leads</p>
                    <p className="text-xs sm:text-sm text-blue-100 mt-1">Total Leads: {filteredLeads.length}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <button
                      onClick={getUpcomingReminders}
                      className="flex items-center justify-center sm:justify-start gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="hidden sm:inline">Reminders</span>
                      <span>({upcomingReminders.filter(r => {
                        const now = new Date();
                        const reminderDate = new Date(r.reminderDate);
                        return reminderDate >= now && reminderDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
                      }).length})</span>
                    </button>
                    <button
                      onClick={handleAddLead}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Add New Lead</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        {/* Reminders Modal */}
        {showReminders && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" /> Upcoming Reminders
                </h3>
                <button
                  onClick={() => setShowReminders(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6">
                {upcomingReminders.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingReminders.map((reminder, index) => {
                      const now = new Date();
                      const reminderDate = new Date(reminder.reminderDate);
                      const isToday = reminderDate.toDateString() === now.toDateString();
                      const isTomorrow = new Date(reminderDate).setHours(0,0,0,0) === new Date(now.setDate(now.getDate() + 1)).setHours(0,0,0,0);
                      
                      return (
                        <div 
                          key={index} 
                          className="border border-gray-200 rounded-lg p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => {
                            // Find the full lead object
                            const fullLead = assignedLeads.find(l => l._id === reminder.leadId);
                            if (fullLead) {
                              setCurrentLeadForRemark(fullLead);
                              setShowAllRemarksModal(true);
                            }
                            setShowReminders(false);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-800">{reminder.leadName}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isToday ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 'Upcoming'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{reminder.message}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatReminderDate(reminder.reminderDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No upcoming reminders</p>
                    <p className="text-gray-400 text-sm mt-1">Set reminders in remarks to track follow-ups</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" /> Total Leads
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1">{assignedLeads.length}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <UserCheck className="w-4 sm:w-6 h-4 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> Interested
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-1">{interestedLeads}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <TrendingUp className="w-4 sm:w-6 h-4 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> Recent (7 days)
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 mt-1">{recentLeads}</p>
              </div>
              <div className="bg-indigo-100 p-2 sm:p-3 rounded-lg">
                <Clock className="w-4 sm:w-6 h-4 sm:h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8 border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Filter Leads
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          {showFilters && (
            <div className="p-4 sm:p-6 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Search Input */}
                <div className="lg:col-span-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Search Leads
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                
                {/* Remark Status Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Remark Status
                  </label>
                  <select
                    value={remarkStatusFilter}
                    onChange={(e) => setRemarkStatusFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Remark Status</option>
                    <option value="no_remarks">No Remarks</option>
                    <option value="pending">Pending</option>
                    <option value="interested">Interested</option>
                    <option value="rejected">Rejected</option>
                    <option value="confirm_selected">Confirm Selected</option>
                    <option value="need_more_info">Need More Info</option>
                    <option value="callback_scheduled">Callback Scheduled</option>
                    <option value="not_reachable">Not Reachable</option>
                    <option value="meeting_scheduled">Meeting Scheduled</option>
                    <option value="quote_sent">Quote Sent</option>
                  </select>
                </div>
                
                {/* Product Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="jifsa">JIFSA</option>
                    <option value="elite-bim">Elite BIM</option>
                    <option value="eee-technologies">EEE Technologies</option>
                  </select>
                </div>
                
                {/* Call Status Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Call Status
                  </label>
                  <select
                    value={callStatusFilter}
                    onChange={(e) => setCallStatusFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Call Status</option>
                    <option value="not_called">Not Called</option>
                    <option value="called">Called</option>
                  </select>
                </div>
                
                {/* Date Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
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
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Leads Assigned to You
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <UserCheck className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No assigned leads</h3>
                <p className="text-gray-500 max-w-xs sm:max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' || productFilter !== 'all' || callStatusFilter !== 'all'
                    ? 'No leads match your current filters. Try adjusting your search or filters.'
                    : "You don't have any leads assigned to you yet. Your manager will assign leads to you soon."}
                </p>
                {!searchTerm && statusFilter === 'all' && productFilter === 'all' && callStatusFilter === 'all' && (
                  <button
                    onClick={handleAddLead}
                    className="mt-4 sm:mt-6 bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Lead
                  </button>
                )
              }</div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                        Lead Info
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                        Contact
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                        Education
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                        Remarks
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                        Assigned By
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                        Created
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredLeads.map((lead, index) => (
                      <tr 
                        key={lead._id} 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 hover:shadow-sm hover:z-10 relative`}
                      >
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md">
                              {lead.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-2 sm:ml-3">
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{lead.fullName || 'Unnamed Lead'}</div>
                              <div className="text-xs sm:text-sm text-blue-600 font-semibold uppercase mt-0.5">{lead.productCompany || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-800 mb-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            {lead.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            {lead.phoneNo || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1 max-w-[120px] sm:max-w-xs">
                            <label className="flex items-center gap-1 text-[10px] sm:text-xs">
                              <input
                                type="checkbox"
                                checked={lead.education?.tenth || false}
                                onChange={() => toggleEducation(lead._id, 'tenth')}
                                className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">10th</span>
                            </label>
                            <label className="flex items-center gap-1 text-[10px] sm:text-xs">
                              <input
                                type="checkbox"
                                checked={lead.education?.twelfth || false}
                                onChange={() => toggleEducation(lead._id, 'twelfth')}
                                className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">12th</span>
                            </label>
                            <label className="flex items-center gap-1 text-[10px] sm:text-xs">
                              <input
                                type="checkbox"
                                checked={lead.education?.undergraduate || false}
                                onChange={() => toggleEducation(lead._id, 'undergraduate')}
                                className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">UG</span>
                            </label>
                            <label className="flex items-center gap-1 text-[10px] sm:text-xs">
                              <input
                                type="checkbox"
                                checked={lead.education?.postgraduate || false}
                                onChange={() => toggleEducation(lead._id, 'postgraduate')}
                                className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">PG</span>
                            </label>
                            <label className="flex items-center gap-1 text-[10px] sm:text-xs">
                              <input
                                type="checkbox"
                                checked={lead.education?.phd || false}
                                onChange={() => toggleEducation(lead._id, 'phd')}
                                className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">PhD</span>
                            </label>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {(!lead.remarks || lead.remarks.length === 0) ? (
                              <button
                                onClick={() => handleRemarkStatusChange(lead)}
                                className="px-2 sm:px-3 py-1 cursor-pointer bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-[10px] sm:text-xs font-semibold hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 shadow-sm whitespace-nowrap"
                              >
                                Add Remark
                              </button>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-[10px] sm:text-xs text-gray-600">
                                  <span className="cursor-pointer px-2 sm:px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-[10px] sm:text-xs font-semibold hover:from-green-200 hover:to-emerald-200 transition-all duration-200 shadow-sm" onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentLeadForRemark(lead);
                                    setShowAllRemarksModal(true);
                                  }}>
                                    All Remarks <span className="px-1 sm:px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium ml-1 text-[8px] sm:text-xs">
                                      {lead.remarks.length}
                                    </span>
                                  </span>
                                </div>
                                {/* Show conversation status */}
                                {lead.remarks.length > 0 && (
                                  <div className="text-[10px] sm:text-xs">
                                    {(() => {
                                      const lastRemark = lead.remarks[lead.remarks.length - 1];
                                      const isClosed = lastRemark.status === 'rejected' || lastRemark.status === 'confirm_selected';
                                      
                                      return isClosed ? (
                                        <span className="px-1 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-800 font-medium text-[10px] sm:text-xs">
                                          Closed
                                        </span>
                                      ) : (
                                        <span className="px-1 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-green-100 to-teal-100 text-green-800 font-medium text-[10px] sm:text-xs">
                                          Active
                                        </span>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            <div className="text-xs sm:text-sm text-gray-800 font-medium">{getAssignedByInfo(lead)}</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-gray-700 font-medium">{formatDateDDMMMYYYY(lead.createdAt)}</span>
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            {new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewLead(lead)}
                              className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm"
                              title="View Lead Details"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleMailAction(lead)}
                              className="p-1.5 sm:p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors shadow-sm"
                              title="Send Mail"
                            >
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleEditLead(lead)}
                              className="p-1.5 sm:p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors shadow-sm"
                              title="Edit Lead"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <div className="relative group">
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Actions
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        
        {/* Remark Modal */}
        {showRemarkModal && currentLeadForRemark && (
          <RemarkModal
            showModal={showRemarkModal}
            setShowModal={setShowRemarkModal}
            lead={currentLeadForRemark}
            onSubmit={handleRemarkSubmit}
            onCancel={() => {
              setShowRemarkModal(false);
              setCurrentLeadForRemark(null);
            }}
          />
        )}
        
        {/* All Remarks Modal */}
        {showAllRemarksModal && currentLeadForRemark && (
          <AllRemarksModal
            showModal={showAllRemarksModal}
            setShowModal={setShowAllRemarksModal}
            lead={currentLeadForRemark}
            allRemarks={currentLeadForRemark.remarks || []}
            onSubmit={handleRemarkSubmit}
            onCancel={() => {
              setShowAllRemarksModal(false);
              setCurrentLeadForRemark(null);
            }}
          />
        )}
      </div>
    </div>
  </>);
};

export default LeadAssigned;