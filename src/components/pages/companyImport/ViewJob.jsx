import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Building, MapPin, FileText, Hash, Clock, CheckCircle, AlertCircle, PhoneOff, Users, Award, GraduationCap, School, Briefcase, CreditCard, Wallet, Receipt, ArrowLeft, Edit, Send, Globe, IndianRupee, Clock3, CalendarDays, Navigation } from 'lucide-react';
import { getCompanyById, updateCompany } from '../../utils/Api';
import UpdateJobModal from '../../modal/UpdateJobModal';

const ViewJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await getCompanyById(id);
        
        if (response.data.success && response.data.data) {
          console.log('Job details:', response.data.data);
          setSelectedJob(response.data.data);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
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

  // Handle form submission for updating job details
  const handleUpdateSubmit = async (updatedData) => {
    try {
      setUpdateError(null);
      
      // Remove system fields that shouldn't be updated
      const dataToUpdate = { ...updatedData };
      delete dataToUpdate._id;
      delete dataToUpdate.__v;
      delete dataToUpdate.createdAt;
      delete dataToUpdate.updatedAt;
      
      const response = await updateCompany(id, dataToUpdate);
      
      if (response.data.success) {
        // Update the selectedJob state with the updated data
        setSelectedJob(response.data.data);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        setShowUpdateModal(false);
      } else {
        setUpdateError(response.data.message || 'Failed to update job details');
      }
    } catch (err) {
      console.error('Error updating job:', err);
      setUpdateError(err.response?.data?.message || err.message || 'Failed to update job details');
    }
  };

  // Show success message
  const renderSuccessMessage = () => {
    if (!updateSuccess) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
        Job details updated successfully!
      </div>
    );
  };

  // Show error message
  const renderErrorMessage = () => {
    if (!updateError) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
        {updateError}
      </div>
    );
  };

  // Render update button
  const renderUpdateButton = () => {
    return (
      <button
        onClick={() => setShowUpdateModal(true)}
        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
      >
        <Edit className="w-4 h-4 mr-2" />
        Update Details
      </button>
    );
  };

  // Helper function to safely access nested properties
  const getNestedValue = (obj, path) => {
    if (!obj) return 'N/A';
    
    // Handle array values
    if (Array.isArray(obj)) {
      return obj.join(', ');
    }
    
    // Handle direct property access
    if (obj.hasOwnProperty(path)) {
      if (Array.isArray(obj[path])) {
        return obj[path].join(', ');
      }
      return obj[path] || 'N/A';
    }
    
    return 'N/A';
  };

  const renderJobDetails = () => {
    if (!selectedJob) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Job Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Job Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Job Title</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Job Title') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Company Name</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Company Name') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Category') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Job Type</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Job Type') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Experience Level</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Experience Level') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Minimum Education</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Min Education') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Openings</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Openings') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Notice Period</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Notice Period') || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Job Description
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Job Description') || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Location & Compensation */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Location & Compensation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Location') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Minimum Salary</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Salary Min (₹)') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Maximum Salary</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Salary Max (₹)') || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Work Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Work Type</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Work Type') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Interview Type</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Interview Type') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Direct Link/Contact</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Direct Link') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Year of Passing</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Year of Passing') || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Skills & Requirements */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Skills & Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Skills</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Skills') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Requirements</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Requirements') || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Responsibilities</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Responsibilities') || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              Status Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Status') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Call Status</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Call Status') || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Company Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Company Description</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Company Description') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Company Website</label>
                <p className="text-gray-800">{getNestedValue(selectedJob, 'Company Website') || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-blue-600" />
              Tracking Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created At
                </label>
                <p className="text-gray-800">{formatDate(selectedJob.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Updated At
                </label>
                <p className="text-gray-800">{formatDate(selectedJob.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/job-management')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Job Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Job Details</h1>
                  <p className="text-blue-100 mt-1">View comprehensive information about this job</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="flex items-center gap-2 bg-green-600 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Update</span>
                </button>
                <button
                  onClick={() => navigate('/job-management')}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {renderSuccessMessage()}
        {renderErrorMessage()}

        {/* Job Details */}
        {renderJobDetails()}

        {/* Update Modal */}
        <UpdateJobModal 
          showModal={showUpdateModal}
          setShowModal={setShowUpdateModal}
          selectedJob={selectedJob}
          onSuccess={handleUpdateSubmit}
        />
      </div>
    </div>
  );
};

export default ViewJob;