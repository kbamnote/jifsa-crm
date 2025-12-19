import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Eye, UserCheck, TrendingUp, Clock, Filter, Search, UserPlus, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDetail, deleteForm, getTeamDetail, assignLead } from '../../utils/Api';
import Cookies from "js-cookie";
import AddLeadModal from '../../modal/AddLeadModal';
import UpdateLeadModal from '../../modal/UpdateLeadModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import MailModal from '../../modal/MailModal';
import FileSelectionModal from '../../modal/FileSelectionModal';

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
  

  const [showFilters, setShowFilters] = useState(false);

  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamDetail();
      if (response.data.success) {
        console.log('All team members:', response.data.data);
        console.log('UserRole when fetching:', userRole);
        console.log('UserRole lower case:', userRole.toLowerCase());
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);
  
  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, productFilter, callStatusFilter, interviewRoundFilter, aptitudeRoundFilter, hrRoundFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all leads
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

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lead =>
        (lead.fullName && lead.fullName.toLowerCase().includes(term)) ||
        (lead.email && lead.email.toLowerCase().includes(term)) ||
        (lead.phoneNo && lead.phoneNo.toLowerCase().includes(term)) ||
        (lead.productCompany && lead.productCompany.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    // Apply product filter
    if (productFilter !== 'all') {
      result = result.filter(lead =>
        lead.productCompany && lead.productCompany.toLowerCase().replace(/\s+/g, '-') === productFilter
      );
    }

    // Apply call status filter
    if (callStatusFilter !== 'all') {
      result = result.filter(lead => lead.callStatus === callStatusFilter);
    }

    // Apply interview round filter
    if (interviewRoundFilter !== 'all') {
      result = result.filter(lead => lead.interviewRoundStatus === interviewRoundFilter);
    }

    // Apply aptitude round filter
    if (aptitudeRoundFilter !== 'all') {
      result = result.filter(lead => lead.aptitudeRoundStatus === aptitudeRoundFilter);
    }

    // Apply HR round filter
    if (hrRoundFilter !== 'all') {
      result = result.filter(lead => lead.hrRoundStatus === hrRoundFilter);
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
    fetchTeamMembers(); // Fetch team members when opening assignment modal
  };

  const handleMailAction = (lead) => {
    setLeadToShare(lead); // Set the selected lead as the only lead to show in the modal
    setShowMailModal(true);
  };

  const handleViewLead = (lead) => {
    navigate(`/lead/${lead._id}`);
  };

  const confirmDeleteLead = async () => {
    if (leadToDelete) {
      try {
        await deleteForm(leadToDelete._id);
        fetchLeads(); // Refresh the leads list
        setShowDeleteModal(false);
        setLeadToDelete(null);
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
      }
    }
  };

  // Handle lead assignment
  const handleAssignLead = async () => {
    if (!selectedMember) return;

    // Validate assignment based on user role
    const selectedTeamMember = teamMembers.find(m => m._id === selectedMember);
    if (!selectedTeamMember) {
      alert('Selected team member not found');
      return;
    }

    // Check if the assignment is allowed based on user role
    let isAllowed = false;
    if (userRole.toLowerCase() === 'admin') {
      // Admin can assign to any team member except admin
      isAllowed = selectedTeamMember.role !== 'admin';
    } else if (userRole.toLowerCase() === 'counsellor') {
      // Counsellor can only assign to telecaller
      isAllowed = selectedTeamMember.role === 'telecaller';
    } else {
      // Other roles can assign to sales
      isAllowed = selectedTeamMember.role === 'sales';
    }

    if (!isAllowed) {
      alert('You are not allowed to assign leads to this team member based on your role.');
      return;
    }

    setIsAssigning(true);
    try {
      const assignmentData = {
        assignedTo: selectedTeamMember.email, // Use email instead of ID
        assignedBy: userEmail // Use the email of the current user
      };

      await assignLead(leadToAssign._id, assignmentData);

      // Close assignment modal and refresh data
      setShowAssignmentModal(false);
      setSelectedMember('');
      setLeadToAssign(null);
      fetchLeads(); // Refresh the leads list
    } catch (error) {
      console.error('Error assigning lead:', error);
      alert('Failed to assign lead: ' + (error.response?.data?.message || error.message || 'Please try again.'));
    } finally {
      setIsAssigning(false);
    }
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

  // Calculate statistics
  const interestedLeads = filteredLeads.filter(lead => lead.status?.toLowerCase() === 'interested').length;
  const notInterestedLeads = filteredLeads.filter(lead => lead.status?.toLowerCase() === 'not_interested').length;
  const recentLeads = filteredLeads.filter(lead => {
    const createdDate = new Date(lead.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;

  // Only admin, manager, marketing, counsellor, and telecaller can access this page
  // Sales persons should only see the LeadAssigned page
  const allowedRoles = ['admin', 'manager', 'marketing', 'counsellor', 'telecaller'];
  if (userRole.toLowerCase() === 'sales') {
    // Redirect sales persons to the LeadAssigned page
    window.location.href = '/lead-assigned';
    return null;
  } else if (!allowedRoles.includes(userRole.toLowerCase())) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Users className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
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
  const isImageFile = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="w-10 h-10 text-blue-600" />
                Lead Management
              </h1>
              <p className="text-gray-600 mt-2">View, manage, and organize all leads in the system</p>
              <p className="text-sm text-gray-500 mt-1">Total Leads: {filteredLeads.length}</p>
            </div>
            <button
              onClick={handleAddLead}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add New Lead
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{filteredLeads.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Interested</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{interestedLeads}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Recent (7 days)</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{recentLeads}</p>
                </div>
                <Clock className="w-12 h-12 text-purple-500 opacity-80" />
              </div>
            </div>
          </div>



          {/* Controls */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <option value="follow_up_required">Follow Up Required</option>
                      <option value="not_reachable">Not Reachable</option>
                    </select>
                  </div>
                                          
                  {/* Interview Round Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Round
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aptitude Round
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HR Round
                    </label>
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Data Tables */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              <Users className="inline w-6 h-6 mr-2 text-blue-600" />
              All Leads
            </h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading leads...</p>
                </div>
              </div>
            ) : (
              // Leads Table
              filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No leads found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No leads match your current filters. Try adjusting your search or filters.'
                      : 'There are no leads in the system yet. Add your first lead to get started.'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <button
                      onClick={handleAddLead}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Lead
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead Info</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
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
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {lead.assignedTo
                            ? typeof lead.assignedTo === "string"
                              ? lead.assignedTo
                              : lead.assignedTo?.name || lead.assignedTo?.email || 'N/A'
                            : "Not Assigned"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDate(lead.createdAt)}</td>
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
                            {userRole.toLowerCase() !== 'telecaller' && (
                              lead.assignedTo ? (
                                <button
                                  onClick={() => handleAssignLeadAction(lead)}
                                  className="text-amber-600 hover:text-amber-900 p-2 rounded-full hover:bg-amber-50 transition-colors"
                                  title="Reassign Lead"
                                >
                                  <UserCheck className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAssignLeadAction(lead)}
                                  className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                                  title="Assign Lead"
                                >
                                  <UserPlus className="w-5 h-5" />
                                </button>
                              )
                            )}
                            <button
                              onClick={() => handleEditLead(lead)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              title="Edit Lead"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {userRole.toLowerCase() === 'admin' && (
                              <button
                                onClick={() => handleDeleteLead(lead)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )
          }
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



        <DeleteConfirmationModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          onConfirm={confirmDeleteLead}
          itemName={leadToDelete?.fullName || 'this lead'}
        />

        {/* Assignment Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {userRole.toLowerCase() === 'counsellor' ? 'Assign Lead to Telecaller' : 'Assign Lead'}
                  </h3>
                  <button
                    onClick={() => setShowAssignmentModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700">Assigning lead: {leadToAssign?.fullName || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{leadToAssign?.email || 'N/A'}</p>
                </div>

                {/* Show current assignment if exists */}
                {leadToAssign?.assignedTo && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      Currently assigned to: <span className="font-semibold">
                        {typeof leadToAssign.assignedTo === 'string'
                          ? leadToAssign.assignedTo
                          : (leadToAssign.assignedTo?.name || leadToAssign.assignedTo?.email || 'N/A')}
                      </span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {userRole.toLowerCase() === 'counsellor' ? 'Assign to Telecaller' : 'Assign to Team Member'}
                  </label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isAssigning}
                  >
                    <option value="">Select a team member</option>
                    {(() => {
                      console.log('Current user role for filtering:', userRole.toLowerCase());
                      console.log('All team members available:', teamMembers);
                      
                      const filteredMembers = teamMembers.filter(member => {
                        // Admin can assign to any team member except admin
                        if (userRole.toLowerCase() === 'admin') {
                          console.log('Admin filtering: excluding only admins');
                          return member.role !== 'admin';
                        }
                        // Counsellor can only assign to telecaller
                        else if (userRole.toLowerCase() === 'counsellor') {
                          console.log('Counsellor filtering: including only telecallers');
                          console.log('Checking member:', member.name, 'with role:', member.role);
                          const isTelecaller = member.role === 'telecaller';
                          console.log('Is telecaller?', isTelecaller);
                          return isTelecaller;
                        }
                        // Other roles (sales, marketing, manager, telecaller) can assign to sales
                        else {
                          console.log('Other role filtering: including only sales');
                          return member.role === 'sales';
                        }
                      });
                      
                      console.log('Filtered members for assignment:', filteredMembers);
                      
                      return filteredMembers.map(member => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.email}) [{member.role}]
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAssignmentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                    disabled={isAssigning}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignLead}
                    disabled={!selectedMember || isAssigning}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? 'Assigning...' : (leadToAssign?.assignedTo ? 'Reassign Lead' : (userRole.toLowerCase() === 'counsellor' ? 'Assign to Telecaller' : 'Assign Lead'))}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mail Modal */}
        <MailModal
          showModal={showMailModal}
          setShowModal={setShowMailModal}
          attachment={mailAttachments.length > 0 ? mailAttachments[0] : null}
          imageToShare={leadToShare}
          selectedLeads={[leadToShare]}
          onAttachmentClick={handleSelectAttachment}
          mode="send"
        />

        {/* File Selection Modal */}
        {showFileSelectionModal && (
          <FileSelectionModal
            isOpen={showFileSelectionModal}
            onClose={() => setShowFileSelectionModal(false)}
            onFileSelect={handleFileSelectFromGallery}
          />
        )}
      </div>
    </div>
  );
};

export default LeadManagement;