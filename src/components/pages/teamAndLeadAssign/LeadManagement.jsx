import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Eye, UserCheck, TrendingUp, Clock, Filter, Search, UserPlus, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDetail, deleteForm, getTeamDetail, assignLead } from '../../utils/Api';
import Cookies from "js-cookie";
import AddLeadModal from '../../modal/AddLeadModal';
import UpdateLeadModal from '../../modal/UpdateLeadModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import MailModal from '../../modal/MailModal';
import FileSelectionModal from '../../modal/FileSelectionModal';
import AssignmentModal from '../../modal/AssignmentModal';

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
  const [showFilters, setShowFilters] = useState(false);

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
        console.log('All team members:', response.data.data);
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
  }, [leads, searchTerm, statusFilter, productFilter, callStatusFilter, interviewRoundFilter, aptitudeRoundFilter, hrRoundFilter, createdByFilter]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-xl shadow-lg">
                <Users className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
                <p className="text-gray-600 mt-1">View, manage, and organize all leads in the system</p>
                <p className="text-sm text-gray-500 mt-1">Total Leads: {filteredLeads.length}</p>
              </div>
            </div>
            <button
              onClick={handleAddLead}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span>Add New Lead</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{filteredLeads.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Interested</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{interestedLeads}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Recent (7 days)</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{recentLeads}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-600'
              }`}
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Leads</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'No leads match your current filters. Try adjusting your search or filters.'
                  : 'There are no leads in the system yet. Add your first lead to get started.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={handleAddLead}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Your First Lead</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lead Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {lead.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{lead.fullName || 'Unnamed Lead'}</div>
                            <div className="text-sm text-gray-500">{lead.productCompany || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{lead.phoneNo || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(lead.status)}`}>
                          {lead.status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {lead.assignedTo
                          ? typeof lead.assignedTo === "string"
                            ? lead.assignedTo
                            : lead.assignedTo?.name || lead.assignedTo?.email || 'N/A'
                          : "Not Assigned"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewLead(lead)}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="View Lead Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleMailAction(lead)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                            title="Send Mail"
                          >
                            <Mail size={18} />
                          </button>
                          {userRole.toLowerCase() !== 'telecaller' && (
                            lead.assignedTo ? (
                              <button
                                onClick={() => handleAssignLeadAction(lead)}
                                className="text-amber-600 hover:text-amber-900 p-2 rounded-full hover:bg-amber-50 transition-colors"
                                title="Reassign Lead"
                              >
                                <UserCheck size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAssignLeadAction(lead)}
                                className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                                title="Assign Lead"
                              >
                                <UserPlus size={18} />
                              </button>
                            )
                          )}
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit size={18} />
                          </button>
                          {userRole.toLowerCase() === 'admin' && (
                            <button
                              onClick={() => handleDeleteLead(lead)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 size={18} />
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
      </div>
    </div>
  );
};

export default LeadManagement;