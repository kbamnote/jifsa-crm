import React, { useState, useEffect } from "react";
import { Database, User, Mail, Phone, MessageSquare, Calendar, BookOpen, FileText, Image as ImageIcon, Eye, Edit, UserPlus, Users } from "lucide-react";
import Cookies from "js-cookie";
import { getTeamDetail, assignLead } from "../utils/Api";

const ClientModal = ({ showModal, selectedRecord, setShowModal, onEdit, onAssignSuccess }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  
  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";
  
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

  const handleEdit = () => {
    setShowModal(false);
    if (onEdit) {
      onEdit(selectedRecord);
    }
  };

  // Fetch team members for assignment dropdown
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

  // Handle lead assignment
  const handleAssignLead = async () => {
    if (!selectedMember) return;
    
    setIsAssigning(true);
    try {
      // Find the selected member to get their email
      const member = teamMembers.find(m => m._id === selectedMember);
      console.log('Selected member:', member);
      
      if (!member) {
        throw new Error('Selected team member not found');
      }
      
      const assignmentData = { 
        assignedTo: member.email, // Use email instead of ID
        assignedBy: userEmail // Use the email of the current user (admin)
      };
      
      console.log('Attempting to assign lead with data:', {
        leadId: selectedRecord._id,
        assignmentData: assignmentData
      });
      
      await assignLead(selectedRecord._id, assignmentData);
      
      // Close assignment section and refresh data
      setShowAssignment(false);
      setSelectedMember('');
      
      // Notify parent component to refresh data
      if (onAssignSuccess) {
        onAssignSuccess();
      }
      
      // Close modal
      setShowModal(false);
    } catch (error) {
      console.error('Error assigning lead:', error);
      console.error('Error response:', error.response);
      alert('Failed to assign lead: ' + (error.response?.data?.message || error.message || 'Please try again.'));
    } finally {
      setIsAssigning(false);
    }
  };

  useEffect(() => {
    if (showModal && userRole === 'admin') {
      fetchTeamMembers();
    }
  }, [showModal, userRole]);

  if (!showModal || !selectedRecord) return null;

  // Determine data type
  const isBimData = selectedRecord.source === 'bim' || selectedRecord.course;
  const isPaymentData = selectedRecord.uploadImg !== undefined;
  const isLeadData = !isPaymentData && !isBimData;
  const isPDF = (url) => url?.toLowerCase().endsWith('.pdf');

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isPaymentData ? (
                <FileText className="w-6 h-6 text-white" />
              ) : isBimData ? (
                <Database className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
              <h3 className="text-xl font-bold text-white">
                {isPaymentData ? 'Payment Document Details' : 'Lead Details'}
              </h3>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Payment Data Display */}
            {isPaymentData ? (
              <>
                <div className="mb-6">
                  {isPDF(selectedRecord.uploadImg) ? (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-12 text-center">
                      <FileText className="w-20 h-20 text-red-600 mx-auto mb-4" />
                      <p className="text-gray-700 font-semibold mb-4">PDF Document</p>
                      <a
                        href={selectedRecord.uploadImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Eye className="w-5 h-5" />
                        Open PDF
                      </a>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={selectedRecord.uploadImg}
                        alt={selectedRecord.name}
                        className="w-full max-h-96 object-contain bg-gray-50"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Document Name</label>
                    <p className="text-lg font-bold text-gray-800">{selectedRecord.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Details</label>
                    <p className="text-gray-700">{selectedRecord.details}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Upload Date
                    </label>
                    <p className="text-gray-700">{formatDate(selectedRecord.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Document Type</label>
                    {isPDF(selectedRecord.uploadImg) ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FileText className="w-3 h-3 mr-1" />
                        PDF Document
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Image
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Lead Data Display with all fields */
              <>
                {/* Status Badge */}
                {selectedRecord.status && (
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Lead Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRecord.status === 'interested' ? 'bg-green-100 text-green-800' :
                        selectedRecord.status === 'not_interested' ? 'bg-red-100 text-red-800' :
                        selectedRecord.status === 'read' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedRecord.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Product</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRecord.productCompany?.toLowerCase() === 'jifsa' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedRecord.productCompany?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                      <p className="text-gray-900 font-medium">{selectedRecord.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-blue-600">{selectedRecord.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                      <p className="text-gray-900">{selectedRecord.phoneNo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Alternate Phone</label>
                      <p className="text-gray-900">{selectedRecord.alternatePhoneNo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                      <p className="text-gray-900">{selectedRecord.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                      <p className="text-gray-900">{selectedRecord.dob ? formatDate(selectedRecord.dob) : 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                      <p className="text-gray-900">{selectedRecord.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Family Information */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Family Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Father's Name</label>
                      <p className="text-gray-900">{selectedRecord.fatherName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                      <p className="text-gray-900">{selectedRecord.contactNo || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Education & Experience */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Education & Experience
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Highest Degree</label>
                      <p className="text-gray-900">{selectedRecord.highestDegree || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Specialisation</label>
                      <p className="text-gray-900">{selectedRecord.specialisation || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">College/Institute</label>
                      <p className="text-gray-900">{selectedRecord.collegeOrInstituteName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">School Name</label>
                      <p className="text-gray-900">{selectedRecord.schoolName || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Experience</label>
                      <p className="text-gray-900">{selectedRecord.experience || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {selectedRecord.message && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message/Notes
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.message}</p>
                  </div>
                )}

                {/* Assignment Information */}
                {(selectedRecord.assignedTo || selectedRecord.assignedBy) && (
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Assignment Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecord.assignedTo && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To</label>
                          <p className="text-gray-900 font-medium">
                            {selectedRecord.assignedTo.name || selectedRecord.assignedTo.email || 'N/A'}
                          </p>
                        </div>
                      )}
                      {selectedRecord.assignedBy && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Assigned By</label>
                          <p className="text-gray-900 font-medium">
                            {selectedRecord.assignedBy.name || selectedRecord.assignedBy.email || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lead Assignment Section - Only for Admins */}
                {isAdmin && (
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                      Lead Assignment
                    </h4>
                    
                    {!showAssignment ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-gray-700">
                            {selectedRecord.assignedTo 
                              ? `Currently assigned to: ${selectedRecord.assignedTo.name || selectedRecord.assignedTo.email || 'N/A'}` 
                              : 'This lead is not currently assigned to anyone.'}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAssignment(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {selectedRecord.assignedTo ? 'Reassign Lead' : 'Assign Lead'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign to Sales Team Member
                          </label>
                          <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isAssigning}
                          >
                            <option value="">Select a team member</option>
                            {teamMembers
                              .filter(member => member.role === 'sales')
                              .map(member => (
                                <option key={member._id} value={member._id}>
                                  {member.name} ({member.email})
                                </option>
                              ))}
                          </select>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setShowAssignment(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                            disabled={isAssigning}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAssignLead}
                            disabled={!selectedMember || isAssigning}
                            className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                              !selectedMember || isAssigning
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {isAssigning ? 'Assigning...' : 'Assign Lead'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Timeline
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRecord.createdAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
                        <p className="text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
                      </div>
                    )}
                    {selectedRecord.updatedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                        <p className="text-gray-900">{formatDate(selectedRecord.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer with Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
          {!isPaymentData && onEdit && (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Lead</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientModal;