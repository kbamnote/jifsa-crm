import React, { useState, useEffect } from 'react';
import { Users, Calendar, Phone, Mail, MapPin, Eye, UserCheck, TrendingUp, Clock } from 'lucide-react';
import { getDetail } from '../../utils/Api';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';

const LeadAssigned = () => {
  const navigate = useNavigate();
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  useEffect(() => {
    fetchLeads();
  }, []);

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
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">My Assigned Leads</h1>
                  <p className="text-blue-100 mt-1">View and manage leads assigned to you</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm font-medium">Total Leads: {assignedLeads.length}</p>
              </div>
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
            ) : assignedLeads.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No assigned leads</h3>
                <p className="text-gray-500 max-w-md mx-auto">You don't have any leads assigned to you yet. Your manager will assign leads to you soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedLeads.map((lead) => (
                  <div 
                    key={lead._id} 
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{lead.fullName}</h3>
                          <p className="text-sm text-blue-600 font-medium mt-1">{lead.productCompany}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(lead.status)}`}>
                          {lead.status?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span>{lead.phoneNo}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{lead.city}, {lead.state}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-500 truncate max-w-[160px]">
                          By: {getAssignedByInfo(lead)}
                        </span>
                        <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors" onClick={() => navigate(`/lead/${lead._id}`)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAssigned;