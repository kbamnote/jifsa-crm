import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Building, MapPin, FileText, Hash, Clock, CheckCircle, AlertCircle, PhoneOff, Users, Award, GraduationCap, School, Briefcase, CreditCard, Wallet, Receipt, ArrowLeft, Edit, Send, X } from 'lucide-react';
import { getEnrollmentById, updateEnrollmentDetails, updateEnrollmentStatus, updateEnrollmentEducation, addEnrollmentRemark } from '../../../../utils/Api';
import UpdateEnrollmentModal from '../../../../modal/UpdateEnrollmentModal';
import RemarkModal from '../../../../modal/RemarkModal';
import AllRemarksModal from '../../../../modal/AllRemarksModal';

const ViewEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [showAllRemarksModal, setShowAllRemarksModal] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setLoading(true);
        const response = await getEnrollmentById(id);
        
        if (response && response.data && response.data.success) {
          setSelectedRecord(response.data.data);
        } else {
          setError('Enrollment not found');
        }
      } catch (err) {
        setError('Failed to load enrollment details');
        console.error('Error fetching enrollment:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEnrollment();
    }
  }, [id]);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getCallStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'called':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'follow_up_required':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'not_reachable':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'not_called':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRoundStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'passed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'not_scheduled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getAdmissionLetterClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'issued':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'received':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'not_issued':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getFeesStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'fully_paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'not_paid':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleUpdateClick = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      setUpdating(true);
      // Refresh the enrollment data
      const response = await getEnrollmentById(id);
      
      if (response && response.data && response.data.success) {
        setSelectedRecord(response.data.data);
      }
      setShowUpdateModal(false);
    } catch (err) {
      console.error('Error updating enrollment:', err);
      alert('Failed to update enrollment');
    } finally {
      setUpdating(false);
    }
  };

  // Function to open remarks modal
  const openRemarksModal = (enrollment) => {
    setCurrentEnrollment(enrollment);
    if (!enrollment.remarks || enrollment.remarks.length === 0) {
      setShowRemarksModal(true);
    } else {
      setShowAllRemarksModal(true);
    }
  };

  // Function to add a remark
  const addRemarkToEnrollment = async (remarkData) => {
    try {
      const response = await addEnrollmentRemark(remarkData.leadId, {
        message: remarkData.message,
        status: remarkData.status,
        reminderDate: remarkData.reminderDate
      });
      
      // Update the local state
      setSelectedRecord(response.data.updatedEnrollment);
      
      // Close the modal
      setShowRemarksModal(false);
      setShowAllRemarksModal(false);
      setCurrentEnrollment(null);
    } catch (error) {
      console.error('Error adding remark:', error);
      alert('Failed to add remark');
    }
  };

  const handleRemarkSubmit = async (remarkData) => {
    await addRemarkToEnrollment(remarkData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Enrollment</h2>
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

  if (!selectedRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enrollment Not Found</h2>
          <p className="text-gray-600 mb-6">The requested enrollment could not be found.</p>
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
                  <h1 className="text-2xl md:text-3xl font-bold">Enrollment Details</h1>
                  <p className="text-blue-100 mt-1">View comprehensive information about this enrollment</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateClick}
                  className="flex items-center gap-2 bg-green-600 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Update</span>
                </button>
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

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Student Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Student Name</label>
                  <p className="text-gray-800">{selectedRecord.studentName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                  <p className="text-gray-800">{selectedRecord.studentEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                  <p className="text-gray-800">{selectedRecord.studentPhone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Course</label>
                  <p className="text-gray-800">{selectedRecord.courseName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Age</label>
                  <p className="text-gray-800">{selectedRecord.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Gender</label>
                  <p className="text-gray-800">{selectedRecord.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
                  <p className="text-gray-800">{selectedRecord.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Qualification</label>
                  <p className="text-gray-800">{selectedRecord.qualification || 'N/A'}</p>
                </div>
              </div>
            </div>
        
            {/* Education Qualifications */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                Education Qualifications
              </h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRecord.education?.tenth || false}
                    disabled
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">10th</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRecord.education?.twelfth || false}
                    disabled
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">12th</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRecord.education?.undergraduate || false}
                    disabled
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">UG</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRecord.education?.postgraduate || false}
                    disabled
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">PG</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRecord.education?.phd || false}
                    disabled
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">PhD</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Experience</label>
                  <p className="text-gray-800">{selectedRecord.experience || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Specialisation</label>
                  <p className="text-gray-800">{selectedRecord.specialisation || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Highest Degree</label>
                  <p className="text-gray-800">{selectedRecord.highestDegree || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">College/Institute</label>
                  <p className="text-gray-800">{selectedRecord.collegeOrInstituteName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">School Name</label>
                  <p className="text-gray-800">{selectedRecord.schoolName || 'N/A'}</p>
                </div>
              </div>
            </div>
        
            {/* Product & Status Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Product & Status Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Product Company</label>
                  <p className="text-gray-800">{selectedRecord.productCompany || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(selectedRecord.status)}`}>
                    {selectedRecord.status?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Source</label>
                  <p className="text-gray-800 capitalize">{selectedRecord.source || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Message</label>
                  <p className="text-gray-800">{selectedRecord.message || 'N/A'}</p>
                </div>
              </div>
            </div>
        
            {/* CRM Tracking Fields */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-2 text-blue-600" />
                CRM Tracking Fields
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Call Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCallStatusClass(selectedRecord.callStatus)}`}>
                    {selectedRecord.callStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Interview Round Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoundStatusClass(selectedRecord.interviewRoundStatus)}`}>
                    {selectedRecord.interviewRoundStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Aptitude Round Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoundStatusClass(selectedRecord.aptitudeRoundStatus)}`}>
                    {selectedRecord.aptitudeRoundStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">HR Round Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoundStatusClass(selectedRecord.hrRoundStatus)}`}>
                    {selectedRecord.hrRoundStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Admission Letter</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAdmissionLetterClass(selectedRecord.admissionLetter)}`}>
                    {selectedRecord.admissionLetter?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Fees Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFeesStatusClass(selectedRecord.feesStatus)}`}>
                    {selectedRecord.feesStatus?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Payment Method</label>
                  <p className="text-gray-800">{selectedRecord.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Fees Installment Structure</label>
                  <p className="text-gray-800">{selectedRecord.feesInstallmentStructure?.replace('_', ' ') || 'N/A'}</p>
                </div>
              </div>
            </div>
        
            {/* Assignment & Tracking Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Assignment & Tracking Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Assigned To</label>
                  <p className="text-gray-800">
                    {selectedRecord.assignedTo ? 
                      (typeof selectedRecord.assignedTo === 'string' ? 
                        selectedRecord.assignedTo : 
                        `${selectedRecord.assignedTo.name || 'N/A'} (${selectedRecord.assignedTo.email || 'N/A'})`) 
                      : 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Assigned By</label>
                  <p className="text-gray-800">
                    {selectedRecord.assignedByName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Created By</label>
                  <p className="text-gray-800">
                    {selectedRecord.createdBy ? 
                      `${selectedRecord.createdBy.name || 'N/A'} (${selectedRecord.createdBy.email || 'N/A'}) [${selectedRecord.createdBy.role || 'N/A'}]` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Updated By</label>
                  <p className="text-gray-800">
                    {selectedRecord.updatedBy ? 
                      `${selectedRecord.updatedBy.name || 'N/A'} (${selectedRecord.updatedBy.email || 'N/A'}) [${selectedRecord.updatedBy.role || 'N/A'}]` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created At
                  </label>
                  <p className="text-gray-800">{formatDate(selectedRecord.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Updated At
                  </label>
                  <p className="text-gray-800">{formatDate(selectedRecord.updatedAt)}</p>
                </div>
              </div>
            </div>
        
            {/* Remarks Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Remarks
                </h4>
                <button
                  onClick={() => openRemarksModal(selectedRecord)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {(!selectedRecord.remarks || selectedRecord.remarks.length === 0) ? 'Add Remark' : 'All Remarks'}
                </button>
              </div>
              
              {selectedRecord.remarks && selectedRecord.remarks.length > 0 ? (
                <div className="space-y-3">
                  {selectedRecord.remarks
                    .filter(remark => remark.isActive !== false) // Filter out inactive remarks
                    .map((remark, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-800">
                              {remark.sequenceNumber}. {remark.message}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {remark.createdAt ? new Date(remark.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            Status: <span className="font-medium">{remark.status}</span>
                          </span>
                          {remark.createdBy && (
                            <span>
                              By: {remark.createdBy.name || remark.createdBy.email || 'Unknown'}
                            </span>
                          )}
                          {remark.reminderDate && (
                            <span>
                              Reminder: {formatDateTime(remark.reminderDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No remarks yet</p>
              )}
            </div>
        
            {/* Location Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Location Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">City</label>
                  <p className="text-gray-800">{selectedRecord.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">State</label>
                  <p className="text-gray-800">{selectedRecord.state || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Pincode</label>
                  <p className="text-gray-800">{selectedRecord.pincode || 'N/A'}</p>
                </div>
              </div>
            </div>
        
            {/* Feedback Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Feedback & Notes
              </h4>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Feedback</label>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.feedback || 'No feedback provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Enrollment Modal */}
      <UpdateEnrollmentModal 
        showModal={showUpdateModal} 
        setShowModal={setShowUpdateModal} 
        selectedRecord={selectedRecord}
        onSuccess={handleUpdateSubmit}
      />
      
      {/* Remark Modal */}
      {showRemarksModal && currentEnrollment && (
        <RemarkModal
          showModal={showRemarksModal}
          setShowModal={setShowRemarksModal}
          lead={currentEnrollment}
          onSubmit={handleRemarkSubmit}
          onCancel={() => {
            setShowRemarksModal(false);
            setCurrentEnrollment(null);
          }}
        />
      )}

      {/* All Remarks Modal */}
      {showAllRemarksModal && currentEnrollment && (
        <AllRemarksModal
          showModal={showAllRemarksModal}
          setShowModal={setShowAllRemarksModal}
          lead={currentEnrollment}
          allRemarks={currentEnrollment.remarks || []}
          onSubmit={handleRemarkSubmit}
          onCancel={() => {
            setShowAllRemarksModal(false);
            setCurrentEnrollment(null);
          }}
        />
      )}
    </div>
  );
};

export default ViewEnrollment;