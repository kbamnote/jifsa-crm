import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Briefcase, Lock, Users, FileText, Target, TrendingUp, ArrowLeft, Edit, Eye, EyeOff, Calendar, Clock, BarChart3, ThumbsUp, X, Heart, CheckSquare, Square, Phone, MapPin, UserCircle, Link as LinkIcon, Download, FileImage } from 'lucide-react';
import { getTeamMemberById, getTeamDetail, getReports, getDetail, createReport, updateReport } from '../../utils/Api';
import Cookies from "js-cookie";
import UpdateTeamModal from '../../modal/UpdateTeamModal';
import ReportModal from '../../modal/ReportModal';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teamMember, setTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'reports'
  const [allLeads, setAllLeads] = useState([]);
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  
  // Report details modal state
  const [showReportDetailsModal, setShowReportDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the specific team member
        const memberResponse = await getTeamMemberById(id);
        if (memberResponse.data.success) {
          setTeamMember(memberResponse.data.data);
        } else {
          setError('Team member not found');
        }
        
        // Fetch all team members to calculate stats
        const allMembersResponse = await getTeamDetail();
        if (allMembersResponse.data.success) {
          setAllTeamMembers(allMembersResponse.data.data);
        }
        
        // Fetch all leads to analyze remark system
        const allLeadsResponse = await getDetail({ page: 1, limit: 1000 });
        const allLeadsData = allLeadsResponse.data.success ? allLeadsResponse.data.data || [] : allLeadsResponse.data || [];
        setAllLeads(allLeadsData);
      } catch (err) {
        setError('Failed to load team member details');
        console.error('Error fetching team member:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Fetch reports for this team member
  useEffect(() => {
    const fetchMemberReports = async () => {
      if (!teamMember || !teamMember.email) return;
      
      try {
        setLoadingReports(true);
        const response = await getReports(1, 50, { userName: teamMember.email.split('@')[0] });
        if (response.data.success) {
          setReports(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchMemberReports();
  }, [teamMember]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate performance metrics based on remark system
  const calculatePerformanceMetrics = (member) => {
    if (!member.assignedLeads || !Array.isArray(member.assignedLeads)) {
      return { 
        totalLeads: 0, 
        convertedLeads: 0, 
        conversionRate: 0,
        interestedLeads: 0,
        rejectedLeads: 0,
        leadsWithReminders: 0,
        activeConversations: 0,
        closedConversations: 0
      };
    }
    
    const totalLeads = member.assignedLeads.length;
    
    // Filter all leads to get the ones assigned to this team member
    const assignedLeadsFromAll = allLeads.filter(lead => {
      if (typeof lead.assignedTo === 'string') {
        return lead.assignedTo === member.email;
      } else if (lead.assignedTo && typeof lead.assignedTo === 'object') {
        return lead.assignedTo.email === member.email;
      }
      return false;
    });
    
    // Calculate metrics based on lead status
    const convertedLeads = assignedLeadsFromAll.filter(lead => 
      lead.status && (lead.status.toLowerCase() === 'converted' || lead.status.toLowerCase() === 'confirmed')
    ).length;
    
    // Calculate metrics based on remarks
    const interestedLeads = assignedLeadsFromAll.filter(lead => 
      lead.remarks && lead.remarks.some(remark => 
        remark.status === 'interested' || remark.status === 'confirm_selected'
      )
    ).length;
    
    const rejectedLeads = assignedLeadsFromAll.filter(lead => 
      lead.remarks && lead.remarks.some(remark => 
        remark.status === 'rejected'
      )
    ).length;
    
    // Count leads with reminders
    const leadsWithReminders = assignedLeadsFromAll.filter(lead => 
      lead.remarks && lead.remarks.some(remark => 
        remark.reminderDate && new Date(remark.reminderDate) >= new Date()
      )
    ).length;
    
    // Calculate active vs closed conversations
    const activeConversations = assignedLeadsFromAll.filter(lead => {
      if (!lead.remarks || lead.remarks.length === 0) return false;
      const lastRemark = lead.remarks[lead.remarks.length - 1];
      return lastRemark.status !== 'rejected' && lastRemark.status !== 'confirm_selected';
    }).length;
    
    const closedConversations = assignedLeadsFromAll.filter(lead => {
      if (!lead.remarks || lead.remarks.length === 0) return false;
      const lastRemark = lead.remarks[lead.remarks.length - 1];
      return lastRemark.status === 'rejected' || lastRemark.status === 'confirm_selected';
    }).length;
    
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    
    return { 
      totalLeads, 
      convertedLeads, 
      conversionRate,
      interestedLeads,
      rejectedLeads,
      leadsWithReminders,
      activeConversations,
      closedConversations
    };
  };

  const performance = teamMember ? calculatePerformanceMetrics(teamMember) : { 
    totalLeads: 0, 
    convertedLeads: 0, 
    conversionRate: 0,
    interestedLeads: 0,
    rejectedLeads: 0,
    leadsWithReminders: 0,
    activeConversations: 0,
    closedConversations: 0
  };

  const handleUpdateMember = async (updatedData) => {
    try {
      // In a real implementation, you would call an update API
      // For now, we'll just close the modal and refresh the data
      setShowUpdateModal(false);
      // Refresh the data
      const response = await getTeamMemberById(id);
      if (response.data.success) {
        setTeamMember(response.data.data);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member');
    }
  };
  
  // Handle creating or updating a report
  const handleReportSubmit = async (formData, reportId = null) => {
    try {
      if (reportId) {
        // Update existing report
        await updateReport(reportId, formData);
      } else {
        // Create new report
        await createReport(formData);
      }
      
      // Refresh reports
      const response = await getReports(1, 50, { userName: teamMember.email.split('@')[0] });
      if (response.data.success) {
        setReports(response.data.data || []);
      }
      
      setShowReportModal(false);
      setEditingReport(null);
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report');
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    if (!reports || reports.length === 0) return { presentDays: 0, totalDays: 0, attendanceRate: 0 };
    
    const presentDays = reports.filter(report => report.attendance).length;
    const totalDays = reports.length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    return { presentDays, totalDays, attendanceRate };
  };

  const attendanceStats = calculateAttendanceStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 p-4 rounded-xl w-16 h-16"></div>
                  <div>
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-80"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-xl p-6 shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Team Member</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Member Not Found</h2>
          <p className="text-gray-600 mb-6">The requested team member could not be found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{teamMember.name}'s Profile</h1>
                  <p className="text-blue-100 mt-1">Detailed information and performance metrics</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(userRole === 'admin' || userRole === 'manager') && (
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="flex items-center gap-2 bg-green-600 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Update</span>
                  </button>
                )}
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reports' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Daily Reports & Attendance
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Personal Info and Performance */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                    <p className="text-gray-800 font-medium">{teamMember.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                    <p className="text-gray-800 font-medium">{teamMember.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Role</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      teamMember.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      teamMember.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      teamMember.role === 'marketing' ? 'bg-green-100 text-green-800' :
                      teamMember.role === 'counsellor' ? 'bg-yellow-100 text-yellow-800' :
                      teamMember.role === 'telecaller' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {teamMember.role?.charAt(0).toUpperCase() + teamMember.role?.slice(1) || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Account Created</label>
                    <p className="text-gray-800 font-medium">{formatDate(teamMember.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Password Information (Admin only) */}
              {userRole === 'admin' && teamMember.password && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-red-600" />
                    Account Security
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 font-mono">
                          {showPassword ? 
                            <span className="text-sm text-red-600 font-bold">{teamMember.password}</span> : 
                            <span className="text-sm">••••••••••••••••••••</span>
                          }
                        </p>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-500 hover:text-gray-700"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-red-500 mt-1 font-semibold">Encrypted password hash - cannot be reversed to original password</p>
                      <p className="text-xs text-gray-500 mt-1">This is the secure hash used for authentication purposes only</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-semibold">Total Leads</p>
                        <p className="text-2xl font-bold text-blue-800">{performance.totalLeads}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-semibold">Converted</p>
                        <p className="text-2xl font-bold text-green-800">{performance.convertedLeads}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-semibold">Conversion Rate</p>
                        <p className="text-2xl font-bold text-purple-800">{performance.conversionRate}%</p>
                      </div>
                      <Target className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-semibold">Interested</p>
                        <p className="text-2xl font-bold text-yellow-800">{performance.interestedLeads}</p>
                      </div>
                      <ThumbsUp className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 font-semibold">Rejected</p>
                        <p className="text-2xl font-bold text-red-800">{performance.rejectedLeads}</p>
                      </div>
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-600 font-semibold">With Reminders</p>
                        <p className="text-2xl font-bold text-indigo-800">{performance.leadsWithReminders}</p>
                      </div>
                      <Clock className="w-8 h-8 text-indigo-500" />
                    </div>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-600 font-semibold">Active Conv.</p>
                        <p className="text-2xl font-bold text-cyan-800">{performance.activeConversations}</p>
                      </div>
                      <Heart className="w-8 h-8 text-cyan-500" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Closed Conv.</p>
                        <p className="text-2xl font-bold text-gray-800">{performance.closedConversations}</p>
                      </div>
                      <CheckSquare className="w-8 h-8 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Leads */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Assigned Leads ({teamMember.assignedLeads?.length || 0})
                </h4>
                {teamMember.assignedLeads && teamMember.assignedLeads.length > 0 ? (
                  <div className="space-y-3">
                    {teamMember.assignedLeads.map((lead, index) => {
                      // Find the full lead data from allLeads to get more details
                      const fullLead = allLeads.find(l => l._id === lead._id) || lead;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => navigate(`/lead/${fullLead._id}`)}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{fullLead.fullName || 'N/A'}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                fullLead.status === 'converted' ? 'bg-green-100 text-green-800' :
                                fullLead.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                fullLead.status === 'interested' ? 'bg-blue-100 text-blue-800' :
                                fullLead.status === 'not_interested' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {fullLead.status || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {fullLead.email || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {fullLead.phoneNo || 'N/A'}
                              </span>
                              {fullLead.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {fullLead.city}
                                </span>
                              )}
                            </div>
                            {/* Show remark summary */}
                            {fullLead.remarks && fullLead.remarks.length > 0 && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Last Remark: </span>
                                <span className="text-gray-700 truncate">
                                  {fullLead.remarks[fullLead.remarks.length - 1]?.message || 'No remarks'}
                                </span>
                              </div>
                            )}
                          </div>
                          <Eye className="w-4 h-4 text-gray-500" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No leads assigned to this team member.</p>
                )}
              </div>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="space-y-6">
              {/* Team Comparison */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Team Standing
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Rank in team</p>
                    <p className="text-lg font-semibold text-gray-800">
                      #{allTeamMembers.findIndex(m => m._id === id) + 1} of {allTeamMembers.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Performance compared to average</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {performance.conversionRate > 0 ? (
                        <span className="text-green-600">Above Average</span>
                      ) : (
                        <span className="text-gray-600">Average</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Link
                    to={`/lead-assigned`}  // Navigate to the LeadAssigned page which shows leads assigned to current user
                    className="block w-full text-left px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    View Assigned Leads
                  </Link>
                  <Link
                    to={`/team`}  // Navigate back to team page
                    className="block w-full text-left px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Team
                  </Link>
                  <button 
                    onClick={() => {
                      // Find the first lead assigned to this team member and navigate to it
                      const firstAssignedLead = allLeads.find(lead => {
                        if (typeof lead.assignedTo === 'string') {
                          return lead.assignedTo === teamMember.email;
                        } else if (lead.assignedTo && typeof lead.assignedTo === 'object') {
                          return lead.assignedTo.email === teamMember.email;
                        }
                        return false;
                      });
                      
                      if (firstAssignedLead) {
                        navigate(`/lead/${firstAssignedLead._id}`);
                      } else {
                        alert('No leads assigned to this team member');
                      }
                    }}
                    className="w-full text-left px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    View First Lead
                  </button>
                </div>
              </div>

              {/* Lead Reminders */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                  Lead Reminders
                </h4>
                <div className="space-y-3">
                  {(() => {
                    // Filter leads assigned to this team member that have upcoming reminders
                    const assignedLeadsWithReminders = allLeads.filter(lead => {
                      if (typeof lead.assignedTo === 'string') {
                        return lead.assignedTo === teamMember.email && lead.remarks && lead.remarks.some(remark => 
                          remark.reminderDate && new Date(remark.reminderDate) >= new Date()
                        );
                      } else if (lead.assignedTo && typeof lead.assignedTo === 'object') {
                        return lead.assignedTo.email === teamMember.email && lead.remarks && lead.remarks.some(remark => 
                          remark.reminderDate && new Date(remark.reminderDate) >= new Date()
                        );
                      }
                      return false;
                    });
                    
                    if (assignedLeadsWithReminders.length === 0) {
                      return (
                        <div className="text-sm text-gray-600">
                          <p>No upcoming reminders</p>
                        </div>
                      );
                    }
                    
                    return assignedLeadsWithReminders.slice(0, 5).map(lead => {
                      const upcomingReminders = lead.remarks.filter(remark => 
                        remark.reminderDate && new Date(remark.reminderDate) >= new Date()
                      ).sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
                      
                      return upcomingReminders.slice(0, 1).map(reminder => (
                        <div key={`${lead._id}-${reminder._id}`} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="font-medium text-gray-800 truncate">{lead.fullName}</div>
                          <div className="text-sm text-gray-700 truncate">{reminder.message}</div>
                          <div className="text-xs text-yellow-700 mt-1">
                            Reminder: {new Date(reminder.reminderDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })} at {new Date(reminder.reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ));
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Reports Tab Content */
          <div className="space-y-6">
            {/* Attendance Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Attendance Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Present Days</p>
                      <p className="text-2xl font-bold text-blue-800">{attendanceStats.presentDays}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-semibold">Total Reports</p>
                      <p className="text-2xl font-bold text-green-800">{attendanceStats.totalDays}</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-semibold">Attendance Rate</p>
                      <p className="text-2xl font-bold text-purple-800">{attendanceStats.attendanceRate}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Reports */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Daily Reports ({reports.length})
                </h4>
                <button
                  onClick={() => {
                    setEditingReport(null);
                    setShowReportModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Report
                </button>
              </div>
              
              {loadingReports ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading reports...</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reports found for this team member</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reports.map((report, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-800">{report.userId?.name || report.userName?.split('@')[0] || 'N/A'}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.userId?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              report.userId?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                              report.userId?.role === 'marketing' ? 'bg-green-100 text-green-800' :
                              report.userId?.role === 'counsellor' ? 'bg-yellow-100 text-yellow-800' :
                              report.userId?.role === 'telecaller' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.userId?.role || report.userRole || 'N/A'}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-2 line-clamp-2">{report.reportField}</p>
                          {report.linkField && (
                            <a 
                              href={report.linkField} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Link
                            </a>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(report.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}</span>
                          </div>
                          
                          {report.attendance?.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <span>{new Date(report.attendance.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            </div>
                          )}
                          
                          {report.attendance?.morningTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>MT: {report.attendance.morningTime}</span>
                            </div>
                          )}
                          
                          {report.attendance?.eveningTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span>ET: {report.attendance.eveningTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {report.uploadFiles && report.uploadFiles.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">Attached Files:</p>
                          <div className="flex flex-wrap gap-2">
                            {report.uploadFiles.map((file, fileIndex) => (
                              <span key={fileIndex} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {file.fileName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingReport(report);
                            setShowReportModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            // Logic to view full details
                            const fullReport = reports.find(r => r._id === report._id);
                            if (fullReport) {
                              setSelectedReport(fullReport);
                              setShowReportDetailsModal(true);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-200 hover:bg-blue-300 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Team Member Modal */}
      {showUpdateModal && (
        <UpdateTeamModal 
          showModal={showUpdateModal} 
          setShowModal={setShowUpdateModal} 
          handleUpdateMember={handleUpdateMember}
          memberToUpdate={teamMember}
        />
      )}
      
      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          showModal={showReportModal}
          setShowModal={setShowReportModal}
          onSubmit={handleReportSubmit}
          initialData={editingReport}
          isEditMode={!!editingReport}
        />
      )}
      
      {/* Report Details Modal */}
      {showReportDetailsModal && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Report Details
              </h3>
              <button
                onClick={() => {
                  setShowReportDetailsModal(false);
                  setSelectedReport(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <UserCircle className="w-4 h-4 text-blue-500" />
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">{selectedReport.userId?.name || selectedReport.userName?.split('@')[0] || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <User className="w-4 h-4 text-purple-500" />
                    Role
                  </label>
                  <p className="text-gray-900 font-medium">{selectedReport.userId?.role || selectedReport.userRole || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-green-500" />
                    Created At
                  </label>
                  <p className="text-gray-900">{new Date(selectedReport.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Report
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-line">{selectedReport.reportField}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  Link
                </label>
                {selectedReport.linkField ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <a 
                      href={selectedReport.linkField} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                    >
                      {selectedReport.linkField}
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-500">
                    N/A
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Attendance
                </label>
                <div className="space-y-2">
                  {selectedReport.attendance?.date && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{new Date(selectedReport.attendance.date).toLocaleDateString('en-US', { weekday: 'short' })}, {new Date(selectedReport.attendance.date).toLocaleDateString('en-IN', {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric',
                                            })}</span>
                    </div>
                  )}
                  {selectedReport.attendance?.morningTime && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">Morning Time: {selectedReport.attendance.morningTime}</span>
                    </div>
                  )}
                  {selectedReport.attendance?.eveningTime && (
                    <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700">Evening Time: {selectedReport.attendance.eveningTime}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FileImage className="w-4 h-4 text-gray-500" />
                  Files
                </label>
                {selectedReport.uploadFiles && selectedReport.uploadFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedReport.uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {file.fileType?.startsWith('image/') ? (
                          <FileImage className="w-5 h-5 text-blue-500" />
                        ) : file.fileType === 'application/pdf' ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <File className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="truncate max-w-[200px] font-medium" title={file.fileName}>{file.fileName}</span>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.fileUrl;
                            link.download = file.fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="ml-auto text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-100"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-500">
                    No files attached
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowReportDetailsModal(false);
                    setSelectedReport(null);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;