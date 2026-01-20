import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Phone, Mail } from 'lucide-react';
import { getInternApplicationById } from '../../utils/Api';

const InternApplicationDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await getInternApplicationById(id);
        if (response.data.success) {
          setApplication(response.data.data);
        } else {
          setError('Failed to fetch application');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch application');
        console.error('Error fetching application:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              Error: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Application not found</h3>
              <p className="text-gray-500">The requested intern application could not be found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const personalFields = [
    { label: 'Full Name', value: application.fullName, type: 'text' },
    { label: 'Email', value: application.email, type: 'email' },
    { label: 'Phone No. 1', value: application.phoneNo1, type: 'phone' },
    { label: 'Phone No. 2', value: application.phoneNo2, type: 'phone' },
    { label: 'Father\'s Name', value: application.fatherName, type: 'text' },
    { label: 'Father\'s Contact', value: application.fathersContactNo, type: 'phone' },
    { label: 'Address', value: application.address, type: 'text' },
    { label: 'Gender', value: application.gender, type: 'text' },
    { label: 'Date of Birth', value: application.dateOfBirth ? new Date(application.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', type: 'text' },
    { label: 'Age', value: application.age, type: 'text' },
    { label: 'Marital Status', value: application.maritalStatus, type: 'text' },
    { label: 'Category', value: application.category, type: 'text' },
    { label: 'Nationality', value: application.nationality, type: 'text' },
    { label: 'Religion', value: application.religion, type: 'text' },
  ];

  const educationFields = [
    { label: 'Highest Degree', value: application.highestDegree, type: 'text' },
    { label: 'Specialization', value: application.specialization, type: 'text' },
    { label: 'College/Institute Name', value: application.collegeOrInstituteName, type: 'text' },
    { label: 'School Name', value: application.schoolName, type: 'text' },
    { label: 'Experience', value: application.experience, type: 'text' },
    { label: 'Skills', value: application.skills, type: 'text' },
    { label: 'Previous Company', value: application.previousCompany, type: 'text' },
    { label: 'Previous Salary', value: application.previousSalary, type: 'text' },
  ];

  const applicationFields = [
    { label: 'Post Applied For', value: application.postAppliedFor, type: 'text' },
    { label: 'Product/Company', value: application.productCompany, type: 'text' },
    { label: 'Mode of Training', value: application.modeOfTraining, type: 'text' },
    { label: 'Expected Joining Date', value: application.expectedJoiningDate ? new Date(application.expectedJoiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', type: 'text' },
    { label: 'Expected Salary', value: application.expectedSalary, type: 'text' },
    { label: 'Current Salary', value: application.currentSalary, type: 'text' },
    { label: 'Notice Period', value: application.noticePeriod, type: 'text' },
    { label: 'Source', value: application.source, type: 'text' },
    { label: 'Source Name', value: application.sourceName, type: 'text' },
  ];

  const statusFields = [
    { label: 'Status', value: application.status?.replace(/_/g, ' ').toUpperCase(), type: 'status' },
    { label: 'Call Status', value: application.callStatus, type: 'text' },
    { label: 'Interview Round Status', value: application.interviewRoundStatus, type: 'text' },
    { label: 'Aptitude Round Status', value: application.aptitudeRoundStatus, type: 'text' },
    { label: 'HR Round Status', value: application.hrRoundStatus, type: 'text' },
    { label: 'Admission Letter', value: application.admissionLetter, type: 'text' },
    { label: 'Fees Status', value: application.feesStatus, type: 'text' },
    { label: 'Payment Method', value: application.paymentMethod, type: 'text' },
    { label: 'Fees Installment Structure', value: application.feesInstallmentStructure, type: 'text' },
  ];

  const renderValue = (value, type) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">-</span>;
    }

    switch (type) {
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {value}
          </a>
        );
      case 'phone':
        return (
          <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {value}
          </a>
        );
      case 'status':
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            value?.toLowerCase() === 'unread' ? 'bg-gray-100 text-gray-800' :
            value?.toLowerCase() === 'read' ? 'bg-blue-100 text-blue-800' :
            value?.toLowerCase() === 'interview_scheduled' ? 'bg-yellow-100 text-yellow-800' :
            value?.toLowerCase() === 'interview_completed' ? 'bg-purple-100 text-purple-800' :
            value?.toLowerCase() === 'selected' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {value}
          </span>
        );
      default:
        return value;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/intern-applied-data')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Applications
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Intern Application Details
              </h1>
              <p className="text-gray-600 mt-1">Full details for {application.fullName}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Application ID</div>
              <div className="font-mono text-gray-900">{application._id}</div>
              <div className="text-sm text-gray-500 mt-1">Created</div>
              <div className="text-gray-900">{formatDate(application.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalFields.map((field, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600">{field.label}</div>
                <div className="mt-1 text-gray-900">
                  {renderValue(field.value, field.type)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Education & Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {educationFields.map((field, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600">{field.label}</div>
                <div className="mt-1 text-gray-900">
                  {renderValue(field.value, field.type)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Application Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applicationFields.map((field, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600">{field.label}</div>
                <div className="mt-1 text-gray-900">
                  {renderValue(field.value, field.type)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Status & Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusFields.map((field, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600">{field.label}</div>
                <div className="mt-1 text-gray-900">
                  {renderValue(field.value, field.type)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        {(application.resumeUrl || application.photoUrl || application.cvUrl || application.idProofUrl) && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Attachments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {application.resumeUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Resume</div>
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mt-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}
              {application.photoUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Photo</div>
                  <a
                    href={application.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mt-1"
                  >
                    <Download className="w-4 h-4" />
                    View
                  </a>
                </div>
              )}
              {application.cvUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">CV</div>
                  <a
                    href={application.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mt-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}
              {application.idProofUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">ID Proof</div>
                  <a
                    href={application.idProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mt-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternApplicationDetailView;