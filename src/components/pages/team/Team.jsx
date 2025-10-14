import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, UserPlus, X, Mail, Lock, User, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { getTeamDetail, addMember, deleteMember } from '../../utils/Api';
import Cookies from "js-cookie";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedMember, setExpandedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales'
  });

  const userRole = Cookies.get("role") || "";

  useEffect(() => {
    fetchTeamMembers();
  }, []);

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

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await addMember(formData);
      if (response.data.success) {
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'sales' });
        fetchTeamMembers();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || 'Failed to add team member');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteMember(id);
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const toggleExpandMember = (id) => {
    setExpandedMember(expandedMember === id ? null : id);
  };

  // Role-based permissions for team actions
  const canViewTeam = ['admin', 'manager'].includes(userRole);
  const canAddMembers = userRole === 'admin';
  const canDeleteMembers = userRole === 'admin';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
              <p className="text-gray-600 mt-1">Manage your sales team members</p>
            </div>
          </div>
          {canAddMembers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Team Member
            </button>
          )}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Members</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{teamMembers.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Assigned Leads</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {teamMembers.reduce((sum, member) => sum + (member.assignedLeads?.length || 0), 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Managers</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {teamMembers.filter(m => m.role === 'manager').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading team members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No team members yet</p>
              <p className="text-gray-500 mt-2">Add your first team member to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <div key={member._id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-gray-600 text-sm">{member.email}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.role === 'manager' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {member.assignedLeads?.length || 0} leads assigned
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.assignedLeads?.length > 0 && (
                          <button
                            onClick={() => toggleExpandMember(member._id)}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
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
                            onClick={() => handleDeleteMember(member._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Assigned Leads Section */}
                    {expandedMember === member._id && member.assignedLeads?.length > 0 && (
                      <div className="mt-4 ml-16 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Assigned Leads</h4>
                        <div className="space-y-2">
                          {member.assignedLeads.map((lead) => (
                            <div key={lead._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{lead.fullName}</p>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                  <span>{lead.email}</span>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal - Only shown to admins */}
      {showAddModal && canAddMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Add Team Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </div>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Role
                  </div>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sales">Sales</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;