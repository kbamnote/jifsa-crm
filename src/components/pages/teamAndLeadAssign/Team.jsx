import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, UserPlus, X, Mail, Lock, User, Briefcase, ChevronDown, ChevronUp, Edit, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { getTeamDetail, addMember, deleteMember, updateMember } from '../../utils/Api';
import Cookies from "js-cookie";
import TeamModal from '../../modal/TeamModal';
import UpdateTeamModal from '../../modal/UpdateTeamModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';

const Team = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberToUpdate, setMemberToUpdate] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all'); // Added state to track selected role

  const userRole = Cookies.get("role") || "";

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    // Filter team members based on selected role
    if (selectedRole === 'all') {
      setFilteredMembers(teamMembers);
    } else {
      setFilteredMembers(teamMembers.filter(member => member.role === selectedRole));
    }
  }, [selectedRole, teamMembers]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await getTeamDetail();
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (formData) => {
    try {
      const response = await addMember(formData);
      if (response.data.success) {
        setShowAddModal(false);
        fetchTeamMembers();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || 'Failed to add team member');
    }
  };

  const handleUpdateMember = async (id, formData) => {
    try {
      const response = await updateMember(id, formData);
      if (response.data.success) {
        setShowUpdateModal(false);
        setMemberToUpdate(null);
        fetchTeamMembers();
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert(error.response?.data?.message || 'Failed to update team member');
    }
  };

  const handleDeleteMember = (id) => {
    const member = teamMembers.find(m => m._id === id);
    if (member) {
      setMemberToDelete({ id, name: member.name });
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteMember = async () => {
    if (memberToDelete) {
      try {
        await deleteMember(memberToDelete.id);
        fetchTeamMembers();
        setShowDeleteModal(false);
        setMemberToDelete(null);
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const toggleExpandMember = (id) => {
    setExpandedMember(expandedMember === id ? null : id);
  };

  // Calculate role counts
  const getRoleCounts = () => {
    const counts = {};
    teamMembers.forEach(member => {
      const role = member.role;
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  };

  const roleCounts = getRoleCounts();

  // Role-based permissions for team actions
  const canViewTeam = ['admin', 'manager', 'counsellor', 'telecaller'].includes(userRole);
  const canAddMembers = userRole === 'admin';
  const canDeleteMembers = userRole === 'admin';
  const canUpdateMembers = userRole === 'admin';
  const canViewPasswords = userRole === 'admin';

  // If user doesn't have permission to view team, show access denied message
  if (!canViewTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to view the team management page. 
            Please contact your administrator if you believe this is an error.
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 p-3 rounded-xl w-14 h-14"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-80"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg w-48"></div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Members List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="flex items-center gap-4">
                          <div className="h-4 bg-gray-200 rounded w-48"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Management</h1>
              <p className="text-gray-600 mt-1">Manage your sales and marketing team members</p>
            </div>
          </div>
          {canAddMembers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add Team Member</span>
            </button>
          )}
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
            Role Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              className={`bg-gray-50 p-4 rounded-lg border border-gray-200 text-center cursor-pointer transition-all ${
                selectedRole === 'all' ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedRole('all')}
            >
              <p className="text-2xl font-bold text-indigo-600">{teamMembers.length}</p>
              <p className="text-sm text-gray-600">All</p>
            </div>
            {Object.entries(roleCounts).map(([role, count]) => (
              <div 
                key={role} 
                className={`bg-gray-50 p-4 rounded-lg border border-gray-200 text-center cursor-pointer transition-all ${
                  selectedRole === role ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <p className="text-2xl font-bold text-indigo-600">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Team Members {selectedRole !== 'all' && `(${selectedRole})`}</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading team members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No team members found</p>
              <p className="text-gray-500 mt-2">Try selecting a different role filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <div key={member._id} className="hover:bg-blue-50 transition-all duration-200">
                  <div 
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigate(`/team/${member._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800 truncate">{member.name}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-1">
                            <span className="text-gray-600 text-sm flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              {member.email}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.role === 'manager' 
                                ? 'bg-purple-100 text-purple-700' 
                                : member.role === 'marketing'
                                ? 'bg-green-100 text-green-700'
                                : member.role === 'counsellor'
                                ? 'bg-yellow-100 text-yellow-700'
                                : member.role === 'telecaller'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              {member.assignedLeads?.length || 0} leads
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canUpdateMembers && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMemberToUpdate(member);
                              setShowUpdateModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit Member"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {member.assignedLeads?.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandMember(member._id);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Toggle Assigned Leads"
                          >
                            {expandedMember === member._id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        )}
                        {canDeleteMembers && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMember(member._id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Leads Section */}
                  {expandedMember === member._id && member.assignedLeads?.length > 0 && (
                    <div className="mt-4 ml-20 mr-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Assigned Leads ({member.assignedLeads.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {member.assignedLeads.map((lead) => (
                          <div 
                            key={lead._id} 
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => navigate(`/lead/${lead._id}`)}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{lead.fullName}</p>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                <span className="truncate">{lead.email}</span>
                                <span>•</span>
                                <span>{lead.phoneNo}</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                              lead.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal - Only shown to admins */}
      <TeamModal 
        showModal={showAddModal} 
        setShowModal={setShowAddModal} 
        handleAddMember={handleAddMember} 
      />
      
      {/* Update Member Modal - Only shown to admins */}
      <UpdateTeamModal 
        showModal={showUpdateModal} 
        setShowModal={setShowUpdateModal} 
        handleUpdateMember={handleUpdateMember} 
        memberToUpdate={memberToUpdate}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        onConfirm={confirmDeleteMember}
        itemName={memberToDelete ? memberToDelete.name : 'this member'}
      />
    </div>
  );
};

export default Team;