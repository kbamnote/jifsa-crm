import React, { useState, useEffect } from 'react';
import { Users, Calendar, Phone, Mail, MapPin, Eye, UserCheck } from 'lucide-react';
import { getDetail } from '../../utils/Api';
import Cookies from "js-cookie";

const LeadAssigned = () => {
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
        return 'bg-green-100 text-green-800';
      case 'not_interested':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'unread':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Assigned Leads</h1>
              <p className="text-gray-600 mt-1">View leads assigned to you</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Your Assigned Leads</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{assignedLeads.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Leads Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Leads Assigned to You</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading leads...</p>
              </div>
            ) : assignedLeads.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No assigned leads</h3>
                <p className="text-gray-500">You don't have any leads assigned to you yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedLeads.map((lead) => (
                  <div key={lead._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{lead.fullName}</h3>
                          <p className="text-sm text-gray-500 mt-1">{lead.productCompany}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(lead.status)}`}>
                          {lead.status?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{lead.phoneNo}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">{lead.city}, {lead.state}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                        <span className="text-xs text-gray-500">
                          Assigned by: {getAssignedByInfo(lead)}
                        </span>
                        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4 mr-1" />
                          View
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