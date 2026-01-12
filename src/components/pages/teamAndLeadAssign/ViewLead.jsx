import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Building, MapPin, FileText, Hash, Clock, CheckCircle, AlertCircle, PhoneOff, Users, Award, GraduationCap, School, Briefcase, CreditCard, Wallet, Receipt, ArrowLeft, Edit, Send } from 'lucide-react';
import { getDetail, updateDetail, sendGroupMail } from '../../utils/Api';
import UpdateLeadModal from '../../modal/UpdateLeadModal';
import MailModal from '../../modal/MailModal';
import FileSelectionModal from '../../modal/FileSelectionModal';

const ViewLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [showFileSelectionModal, setShowFileSelectionModal] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [mailAttachments, setMailAttachments] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await getDetail();
        const allLeads = response.data || [];
        const lead = allLeads.find(lead => lead._id === id);
        if (lead) {
          setSelectedRecord(lead);
        } else {
          setError('Lead not found');
        }
      } catch (err) {
        setError('Failed to load lead details');
        console.error('Error fetching lead:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeads();
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

  const handleMailClick = () => {
    setShowMailModal(true);
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      setUpdating(true);
      await updateDetail(id, updatedData);
      // Refresh the lead data
      const response = await getDetail();
      const allLeads = response.data || [];
      const lead = allLeads.find(lead => lead._id === id);
      if (lead) {
        setSelectedRecord(lead);
      }
      setShowUpdateModal(false);
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead');
    } finally {
      setUpdating(false);
    }
  };

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

  const handleSendMail = async (mailData) => {
    try {
      const formData = new FormData();
      formData.append('subject', mailData.subject);
      formData.append('body', mailData.body);
      if (mailData.attachments) {
        for (let i = 0; i < mailData.attachments.length; i++) {
          formData.append('attachments', mailData.attachments[i]);
        }
      }
      
      // Add the current lead to the recipients
      const recipients = [{
        email: selectedRecord.email,
        name: selectedRecord.fullName
      }];
      formData.append('recipients', JSON.stringify(recipients));
      
      await sendGroupMail(formData);
      setShowMailModal(false);
      alert('Mail sent successfully');
    } catch (err) {
      console.error('Error sending mail:', err);
      alert('Failed to send mail');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Lead</h2>
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
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lead Not Found</h2>
          <p className="text-gray-600 mb-6">The requested lead could not be found.</p>
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
                  <h1 className="text-2xl md:text-3xl font-bold">Lead Details</h1>
                  <p className="text-blue-100 mt-1">View comprehensive information about this lead</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMailClick}
                  className="flex items-center gap-2 bg-indigo-600 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Mail</span>
                </button>
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
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                  <p className="text-gray-800">{selectedRecord.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                  <p className="text-gray-800">{selectedRecord.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Primary Phone</label>
                  <p className="text-gray-800">{selectedRecord.phoneNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Alternate Phone</label>
                  <p className="text-gray-800">{selectedRecord.alternatePhoneNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Age</label>
                  <p className="text-gray-800">{selectedRecord.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Date of Birth</label>
                  <p className="text-gray-800">
                    {selectedRecord.dob ? formatDate(selectedRecord.dob) : 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
                  <p className="text-gray-800">{selectedRecord.address || 'N/A'}</p>
                </div>
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

            {/* Education & Experience */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                Education & Experience
              </h4>
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
              
              {/* Education Qualifications */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <School className="w-4 h-4 mr-2 text-blue-600" />
                  Education Qualifications
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRecord.education?.tenth || false}
                      disabled
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label className="text-sm text-gray-700">10th</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRecord.education?.twelfth || false}
                      disabled
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label className="text-sm text-gray-700">12th</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRecord.education?.undergraduate || false}
                      disabled
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label className="text-sm text-gray-700">UG</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRecord.education?.postgraduate || false}
                      disabled
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label className="text-sm text-gray-700">PG</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRecord.education?.phd || false}
                      disabled
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label className="text-sm text-gray-700">PhD</label>
                  </div>
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

            {/* Resume Information */}
            {selectedRecord.resume && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Resume Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Resume</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowResumePreview(true)}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        <span>View Resume</span>
                      </button>
                      <span className="text-gray-400">|</span>
                      <a
                        href={selectedRecord.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        <span>Download Resume</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
            {selectedRecord.remarks && selectedRecord.remarks.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  All Remarks
                </h4>
                <div className="space-y-4">
                  {selectedRecord.remarks.map((remark, index) => (
                    <div key={remark._id || index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-800">Remark {index + 1}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            remark.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            remark.status === 'interested' ? 'bg-green-100 text-green-800' :
                            remark.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            remark.status === 'confirm_selected' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {remark.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(remark.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {remark.message}
                      </div>
                      {remark.reminderDate && (
                        <div className="text-xs text-gray-500">
                          Reminder: {new Date(remark.reminderDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                      {remark.createdBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          By: {remark.createdBy.name || remark.createdBy.email || 'Unknown'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Update Lead Modal */}
      <UpdateLeadModal 
        showModal={showUpdateModal} 
        setShowModal={setShowUpdateModal} 
        selectedRecord={selectedRecord}
        onSuccess={handleUpdateSubmit}
      />
      
      {/* Mail Modal */}
      <MailModal
        showModal={showMailModal}
        setShowModal={setShowMailModal}
        attachmentFile={mailAttachments.length > 0 ? mailAttachments[0] : null}
        imageToShare={selectedRecord}
        selectedLeads={selectedRecord ? [selectedRecord] : []}
        onAttachmentClick={handleSelectAttachment}
        mode="send"
      />

      {/* File Selection Modal */}
      <FileSelectionModal 
        isOpen={showFileSelectionModal}
        onClose={() => setShowFileSelectionModal(false)}
        onFileSelect={handleFileSelectFromGallery}
      />
      
      {/* Resume Preview Modal */}
      {showResumePreview && selectedRecord?.resume && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Resume Preview</h3>
              <button
                onClick={() => setShowResumePreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-100px)]">
              {/* Preview for different file types */}
              {selectedRecord.resume.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${selectedRecord.resume}#toolbar=0&navpanes=0&scrollbar=0`} 
                  width="100%"
                  height="600px"
                  title="Resume Preview"
                  className="border border-gray-200 rounded"
                  type="application/pdf"
                />
              ) : selectedRecord.resume.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                <div className="flex justify-center">
                  <img
                    src={selectedRecord.resume}
                    alt="Resume Preview"
                    className="max-w-full max-h-[500px] object-contain border border-gray-200 rounded"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>File preview not available. Please download to view.</p>
                  <a
                    href={selectedRecord.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline mt-4 inline-block"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewLead;