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
import { Users, Plus, Trash2, Edit, Eye, UserCheck, TrendingUp, Clock, Filter, Search, UserPlus, Mail, X, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDetail, deleteForm, getTeamDetail, assignLead, updateEducation as updateEducationApi, addRemark } from '../../utils/Api';
import Cookies from "js-cookie";
import AddLeadModal from '../../modal/AddLeadModal';
import UpdateLeadModal from '../../modal/UpdateLeadModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import MailModal from '../../modal/MailModal';
import FileSelectionModal from '../../modal/FileSelectionModal';
import AssignmentModal from '../../modal/AssignmentModal';
import RemarkModal from '../../modal/RemarkModal';
import AllRemarksModal from '../../modal/AllRemarksModal';

const LeadManagement = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [showFileSelectionModal, setShowFileSelectionModal] = useState(false);
  const [mailAttachments, setMailAttachments] = useState([]);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [leadToUpdate, setLeadToUpdate] = useState(null);
  const [leadToAssign, setLeadToAssign] = useState(null);
  const [leadToShare, setLeadToShare] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [callStatusFilter, setCallStatusFilter] = useState('all');
  const [interviewRoundFilter, setInterviewRoundFilter] = useState('all');
  const [aptitudeRoundFilter, setAptitudeRoundFilter] = useState('all');
  const [hrRoundFilter, setHrRoundFilter] = useState('all');
  const [createdByFilter, setCreatedByFilter] = useState('all');
  const [remarkStatusFilter, setRemarkStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // State for managing remark modals
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [showAllRemarksModal, setShowAllRemarksModal] = useState(false);
  const [currentLeadForRemark, setCurrentLeadForRemark] = useState(null);
  
  // State for reminders
  const [showReminders, setShowReminders] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState([]);

  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  // Reset modal states on mount to prevent stuck modals
  useEffect(() => {
    setShowAssignmentModal(false);
    setShowAddModal(false);
    setShowUpdateModal(false);
    setShowDeleteModal(false);
    setShowMailModal(false);
    setShowFileSelectionModal(false);
    setLeadToAssign(null);
    setLeadToDelete(null);
    setLeadToUpdate(null);
    setLeadToShare(null);
  }, []);

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamDetail();
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, productFilter, callStatusFilter, interviewRoundFilter, aptitudeRoundFilter, hrRoundFilter, createdByFilter, remarkStatusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDetail();
      const allLeads = response.data || [];
      setLeads(allLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let result = leads;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lead =>
        (lead.fullName && lead.fullName.toLowerCase().includes(term)) ||
        (lead.email && lead.email.toLowerCase().includes(term)) ||
        (lead.phoneNo && lead.phoneNo.toLowerCase().includes(term)) ||
        (lead.productCompany && lead.productCompany.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    if (productFilter !== 'all') {
      result = result.filter(lead =>
        lead.productCompany && lead.productCompany.toLowerCase().replace(/\s+/g, '-') === productFilter
      );
    }

    if (callStatusFilter !== 'all') {
      result = result.filter(lead => lead.callStatus === callStatusFilter);
    }

    if (interviewRoundFilter !== 'all') {
      result = result.filter(lead => lead.interviewRoundStatus === interviewRoundFilter);
    }

    if (aptitudeRoundFilter !== 'all') {
      result = result.filter(lead => lead.aptitudeRoundStatus === aptitudeRoundFilter);
    }

    if (hrRoundFilter !== 'all') {
      result = result.filter(lead => lead.hrRoundStatus === hrRoundFilter);
    }

    if (createdByFilter !== 'all') {
      result = result.filter(lead => {
        // Handle different formats of createdBy
        if (lead.createdBy) {
          if (typeof lead.createdBy === 'object') {
            return lead.createdBy.email === createdByFilter || lead.createdBy.name === createdByFilter;
          } else if (typeof lead.createdBy === 'string') {
            return lead.createdBy === createdByFilter;
          }
        }
        return false;
      });
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

  const handleDeleteLead = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const handleAssignLeadAction = (lead) => {
    setLeadToAssign(lead);
    setShowAssignmentModal(true);
    fetchTeamMembers();
  };

  const handleMailAction = (lead) => {
    setLeadToShare(lead);
    setShowMailModal(true);
  };

  const handleViewLead = (lead) => {
    navigate(`/lead/${lead._id}`);
  };

  const confirmDeleteLead = async () => {
    if (leadToDelete) {
      try {
        await deleteForm(leadToDelete._id);
        fetchLeads();
        setShowDeleteModal(false);
        setLeadToDelete(null);
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
      }
    }
  };

  const handleAssignLead = async () => {
    if (!selectedMember) return;

    const selectedTeamMember = teamMembers.find(m => m._id === selectedMember);
    if (!selectedTeamMember) {
      alert('Selected team member not found');
      return;
    }

    let isAllowed = false;
    if (userRole.toLowerCase() === 'admin') {
      isAllowed = selectedTeamMember.role !== 'admin';
    } else if (userRole.toLowerCase() === 'counsellor') {
      isAllowed = selectedTeamMember.role === 'telecaller';
    } else {
      isAllowed = selectedTeamMember.role === 'sales';
    }

    if (!isAllowed) {
      alert('You are not allowed to assign leads to this team member based on your role.');
      return;
    }

    setIsAssigning(true);
    try {
      const assignmentData = {
        assignedTo: selectedTeamMember.email,
        assignedBy: userEmail
      };
      await assignLead(leadToAssign._id, assignmentData);
      
      setShowAssignmentModal(false);
      setSelectedMember('');
      setLeadToAssign(null);
      fetchLeads();
    } catch (error) {
      console.error('Error assigning lead:', error);
      alert('Failed to assign lead: ' + (error.response?.data?.message || error.message || 'Please try again.'));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);
    setLeadToAssign(null);
    setSelectedMember('');
    setIsAssigning(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const interestedLeads = filteredLeads.filter(lead => lead.status?.toLowerCase() === 'interested').length;
  const notInterestedLeads = filteredLeads.filter(lead => lead.status?.toLowerCase() === 'not_interested').length;
  const recentLeads = filteredLeads.filter(lead => {
    const createdDate = new Date(lead.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;

  const allowedRoles = ['admin', 'manager', 'marketing', 'counsellor', 'telecaller'];
  if (userRole.toLowerCase() === 'sales') {
    window.location.href = '/lead-assigned';
    return null;
  } else if (!allowedRoles.includes(userRole.toLowerCase())) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <Users size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to view the lead management page. Only authorized personnel can access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSelectAttachment = () => {
    setShowFileSelectionModal(true);
  };

  const handleFileSelectFromGallery = (file) => {
    const attachment = {
      name: file.name,
      url: file.imageUrl,
      isImage: isImageFile(file.imageUrl)
    };
    setMailAttachments([attachment]);
    setShowFileSelectionModal(false);
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  const getFilteredTeamMembers = () => {
    return teamMembers.filter(member => {
      if (userRole.toLowerCase() === 'admin') {
        return member.role !== 'admin';
      } else if (userRole.toLowerCase() === 'counsellor') {
        return member.role === 'telecaller';
      } else {
        return member.role === 'sales';
      }
    });
  };

  // Education update functionality
  const updateEducation = async (leadId, educationField) => {
    try {
      // Call the API function
      await updateEducationApi(leadId, educationField);
      
      // Update the local state
      setLeads(prev => prev.map(lead => {
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
    
    leads.forEach(lead => {
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
      setLeads(prev => prev.map(lead => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 sm:p-4 rounded-xl shadow-lg">
                    <Users className="text-white" size={24} sm:size={32} />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Lead Management</h1>
                    <p className="text-sm text-gray-600 mt-1">View, manage, and organize all leads in the system</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Total Leads: {filteredLeads.length}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={getUpcomingReminders}
                    className="flex items-center justify-center sm:justify-start gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 sm:py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Clock size={16} sm:size={20} />
                    <span className="hidden sm:inline">Reminders</span>
                    <span>({upcomingReminders.filter(r => {
                      const now = new Date();
                      const reminderDate = new Date(r.reminderDate);
                      return reminderDate >= now && reminderDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    }).length})</span>
                  </button>
                  <button
                    onClick={handleAddLead}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={16} sm:size={20} />
                    <span>Add New Lead</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Leads</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{filteredLeads.length}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                <Users className="text-blue-600" size={16} sm:size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Interested</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-1">{interestedLeads}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-xl">
                <TrendingUp className="text-green-600" size={16} sm:size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Recent (7 days)</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mt-1">{recentLeads}</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-xl">
                <Clock className="text-purple-600" size={16} sm:size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} sm:size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-600'
              }`}
            >
              <Filter size={16} sm:size={20} />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Products</option>
                  <option value="jifsa">JIFSA</option>
                  <option value="elite">Elite</option>
                  <option value="bim">BIM</option>
                  <option value="eee-technologies">EEE Technologies</option>
                </select>
              </div>

              {/* Call Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Status</label>
                <select
                  value={callStatusFilter}
                  onChange={(e) => setCallStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Call Status</option>
                  <option value="not_called">Not Called</option>
                  <option value="called">Called</option>
                  <option value="follow_up_required">Follow Up Required</option>
                  <option value="not_reachable">Not Reachable</option>
                </select>
              </div>

              {/* Interview Round Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Round</label>
                <select
                  value={interviewRoundFilter}
                  onChange={(e) => setInterviewRoundFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Interview Rounds</option>
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Aptitude Round Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aptitude Round</label>
                <select
                  value={aptitudeRoundFilter}
                  onChange={(e) => setAptitudeRoundFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Aptitude Rounds</option>
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* HR Round Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HR Round</label>
                <select
                  value={hrRoundFilter}
                  onChange={(e) => setHrRoundFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All HR Rounds</option>
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              {/* Remark Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark Status
                </label>
                <select
                  value={remarkStatusFilter}
                  onChange={(e) => setRemarkStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              {/* Created By Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                <select
                  value={createdByFilter}
                  onChange={(e) => setCreatedByFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Creators</option>
                  {(() => {
                    // Create a map to store unique creators
                    const creatorsMap = new Map();
                    
                    // Add team members to the map
                    teamMembers.forEach(member => {
                      creatorsMap.set(member.email, member.name || member.email);
                    });
                    
                    // Add creators from leads to the map
                    leads.forEach(lead => {
                      if (lead.createdBy && typeof lead.createdBy === 'object') {
                        const email = lead.createdBy.email;
                        const name = lead.createdBy.name || lead.createdBy.email;
                        // Only add if not already in the map
                        if (!creatorsMap.has(email)) {
                          creatorsMap.set(email, name);
                        }
                      }
                    });
                    
                    // Convert map to array and render options
                    return Array.from(creatorsMap.entries()).map(([email, name], index) => (
                      <option key={`creator-${index}`} value={email}>
                        {name}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Data Tables */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">All Leads</h2>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} sm:size={64} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'No leads match your current filters. Try adjusting your search or filters.'
                  : 'There are no leads in the system yet. Add your first lead to get started.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={handleAddLead}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus size={16} sm:size={20} />
                  <span>Add Your First Lead</span>
                </button>
              )}
            </div>
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
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100">
                      Assigned To
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
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-md">
                            {lead.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">{lead.fullName || 'Unnamed Lead'}</div>
                            <div className="text-xs sm:text-sm text-blue-600 font-semibold uppercase">{lead.productCompany || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          {lead.email || 'N/A'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
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
                                <span className="cursor-pointer px-2 sm:px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-[10px] sm:text-xs font-semibold hover:from-green-200 hover:to-emerald-200 transition-all duration-200 shadow-sm" onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentLeadForRemark(lead);
                                  setShowAllRemarksModal(true);
                                }}>
                                  All Remarks <span className="px-1 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium ml-1 text-[8px] sm:text-xs">
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
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusClass(lead.status)} shadow-sm`}>
                          {lead.status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          {lead.assignedTo
                            ? typeof lead.assignedTo === "string"
                              ? lead.assignedTo
                              : lead.assignedTo?.name || lead.assignedTo?.email || 'N/A'
                            : "Not Assigned"}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">{formatDate(lead.createdAt)}</span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          {new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewLead(lead)}
                            className="text-gray-600 hover:text-gray-900 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                            title="View Lead Details"
                          >
                            <Eye size={14} sm:size={16} />
                          </button>
                          <button
                            onClick={() => handleMailAction(lead)}
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 sm:p-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                            title="Send Mail"
                          >
                            <Mail size={14} sm:size={16} />
                          </button>
                          {userRole.toLowerCase() !== 'telecaller' && (
                            lead.assignedTo ? (
                              <button
                                onClick={() => handleAssignLeadAction(lead)}
                                className="text-amber-600 hover:text-amber-900 p-1.5 sm:p-2 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                                title="Reassign Lead"
                              >
                                <UserCheck size={14} sm:size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAssignLeadAction(lead)}
                                className="text-green-600 hover:text-green-900 p-1.5 sm:p-2 rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                                title="Assign Lead"
                              >
                                <UserPlus size={14} sm:size={16} />
                              </button>
                            )
                          )}
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                            title="Edit Lead"
                          >
                            <Edit size={14} sm:size={16} />
                          </button>
                          {userRole.toLowerCase() === 'admin' && (
                            <button
                              onClick={() => handleDeleteLead(lead)}
                              className="text-red-600 hover:text-red-900 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                              title="Delete Lead"
                            >
                              <Trash2 size={14} sm:size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

        <DeleteConfirmationModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          onConfirm={confirmDeleteLead}
          itemName={leadToDelete?.fullName || 'this lead'}
        />

        {/* Assignment Modal */}
        <AssignmentModal
          showModal={showAssignmentModal}
          setShowModal={setShowAssignmentModal}
          itemToAssign={leadToAssign}
          itemType="lead"
          teamMembers={teamMembers}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          onAssign={handleAssignLead}
          isAssigning={isAssigning}
          userRole={userRole}
        />

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
                            const fullLead = leads.find(l => l._id === reminder.leadId);
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
        
        {/* Mail Modal */}
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

export default LeadManagement;