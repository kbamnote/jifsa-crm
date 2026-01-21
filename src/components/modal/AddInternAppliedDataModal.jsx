import React, { useState } from 'react';
import { X, Upload, FileText, Camera } from 'lucide-react';
import { createInternApplication } from '../utils/Api';

const AddInternAppliedDataModal = ({ showModal, setShowModal, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNo1: '',
    phoneNo2: '',
    postAppliedFor: '',
    productCompany: '',
    resume: null,
    photo: null,
    // Personal Information
    fatherName: '',
    fathersContactNo: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    maritalStatus: '',
    category: '',
    nationality: '',
    religion: '',
    // Education Information
    highestDegree: '',
    specialization: '',
    collegeOrInstituteName: '',
    schoolName: '',
    experience: '',
    skills: '',
    previousCompany: '',
    previousSalary: '',
    // Application Information
    modeOfTraining: '',
    expectedJoiningDate: '',
    expectedSalary: '',
    currentSalary: '',
    noticePeriod: '',
    source: '',
    sourceName: '',
    // Status fields
    status: 'unread',
    callStatus: 'not_called',
    interviewRoundStatus: 'not_scheduled',
    aptitudeRoundStatus: 'not_scheduled',
    hrRoundStatus: 'not_scheduled',
    admissionLetter: 'not_issued',
    feesStatus: 'not_paid',
    paymentMethod: 'other',
    feesInstallmentStructure: 'one_time',
    // Additional fields
    feedback: '',
    city: '',
    state: '',
    pincode: '',

  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    resumeName: '',
    photoName: ''
  });
  
  // Product company options
  const productCompanyOptions = [
    { value: 'Elite-Associate', label: 'Elite Associate' },
    { value: 'JIFSA', label: 'JIFSA' },
    { value: 'Elite-BIM', label: 'Elite BIM' },
    { value: 'Elite-BIFS', label: 'Elite BIFS' },
    { value: 'EEE-Technologies', label: 'EEE Technologies' },
    { value: 'Elite-Jobs', label: 'Elite Jobs' },
    { value: 'Elite-Cards', label: 'Elite Cards' },
    { value: 'Other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user selects an option
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      // Validate file type
      if (name === 'resume') {
        const validResumeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validResumeTypes.includes(file.type)) {
          setErrors(prev => ({
            ...prev,
            resume: 'Please upload a valid resume file (PDF, DOC, DOCX)'
          }));
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
          setErrors(prev => ({
            ...prev,
            resume: 'Resume size should be less than 10MB'
          }));
          return;
        }
      } else if (name === 'photo') {
        const validPhotoTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validPhotoTypes.includes(file.type)) {
          setErrors(prev => ({
            ...prev,
            photo: 'Please upload a valid photo (JPEG, PNG)'
          }));
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
          setErrors(prev => ({
            ...prev,
            photo: 'Photo size should be less than 10MB'
          }));
          return;
        }
      }

      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Update file names
      if (name === 'resume') {
        setUploadedFiles(prev => ({
          ...prev,
          resumeName: file.name
        }));
      } else if (name === 'photo') {
        setUploadedFiles(prev => ({
          ...prev,
          photoName: file.name
        }));
      }

      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.email && formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phoneNo1 && formData.phoneNo1.trim() && !/^[0-9+\-\s()]{10,15}$/.test(formData.phoneNo1)) {
      newErrors.phoneNo1 = 'Phone number 1 is invalid';
    }
    
    if (formData.phoneNo2 && !/^[0-9+\-\s()]{10,15}$/.test(formData.phoneNo2)) {
      newErrors.phoneNo2 = 'Phone number 2 is invalid';
    }
    
    if (formData.resume && !formData.resume) {
      newErrors.resume = 'Please select a valid resume';
    }
    
    if (formData.photo && !formData.photo) {
      newErrors.photo = 'Please select a valid photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Creating intern application with form data:', formData);
      
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNo1', formData.phoneNo1);
      
      if (formData.phoneNo2) {
        formDataToSend.append('phoneNo2', formData.phoneNo2);
      }
      
      formDataToSend.append('postAppliedFor', formData.postAppliedFor);
      formDataToSend.append('productCompany', formData.productCompany);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('callStatus', formData.callStatus);
      formDataToSend.append('feedback', formData.feedback || '');
      formDataToSend.append('city', formData.city || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('pincode', formData.pincode || '');
            
      // Personal Information
      formDataToSend.append('fatherName', formData.fatherName || '');
      formDataToSend.append('fathersContactNo', formData.fathersContactNo || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('gender', formData.gender || '');
      formDataToSend.append('dateOfBirth', formData.dateOfBirth || '');
      formDataToSend.append('age', formData.age || '');
      formDataToSend.append('maritalStatus', formData.maritalStatus || '');
      formDataToSend.append('category', formData.category || '');
      formDataToSend.append('nationality', formData.nationality || '');
      formDataToSend.append('religion', formData.religion || '');
            
      // Education Information
      formDataToSend.append('highestDegree', formData.highestDegree || '');
      formDataToSend.append('specialization', formData.specialization || '');
      formDataToSend.append('collegeOrInstituteName', formData.collegeOrInstituteName || '');
      formDataToSend.append('schoolName', formData.schoolName || '');
      formDataToSend.append('experience', formData.experience || '');
      formDataToSend.append('skills', formData.skills || '');
      formDataToSend.append('previousCompany', formData.previousCompany || '');
      formDataToSend.append('previousSalary', formData.previousSalary || '');
            
      // Application Information
      formDataToSend.append('modeOfTraining', formData.modeOfTraining || '');
      formDataToSend.append('expectedJoiningDate', formData.expectedJoiningDate || '');
      formDataToSend.append('expectedSalary', formData.expectedSalary || '');
      formDataToSend.append('currentSalary', formData.currentSalary || '');
      formDataToSend.append('noticePeriod', formData.noticePeriod || '');
      formDataToSend.append('source', formData.source || '');
      formDataToSend.append('sourceName', formData.sourceName || '');
            
      // Interview tracking fields
      formDataToSend.append('interviewRoundStatus', formData.interviewRoundStatus);
      formDataToSend.append('aptitudeRoundStatus', formData.aptitudeRoundStatus);
      formDataToSend.append('hrRoundStatus', formData.hrRoundStatus);
      formDataToSend.append('admissionLetter', formData.admissionLetter);
      
      // Fees and payment fields
      formDataToSend.append('feesStatus', formData.feesStatus);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('feesInstallmentStructure', formData.feesInstallmentStructure);
      
      // Files
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      console.log('FormData being sent to API:', Array.from(formDataToSend.entries()));
      
      // Use the API function instead of direct fetch
      const result = await createInternApplication(formDataToSend);
      
      console.log('API response:', result);

      if (result.data.success) {
        console.log('Application created successfully:', result.data.data);
        setFormData({
          fullName: '',
          email: '',
          phoneNo1: '',
          phoneNo2: '',
          postAppliedFor: '',
          productCompany: '',
          resume: null,
          photo: null,
          // Personal Information
          fatherName: '',
          fathersContactNo: '',
          address: '',
          gender: '',
          dateOfBirth: '',
          age: '',
          maritalStatus: '',
          category: '',
          nationality: '',
          religion: '',
          // Education Information
          highestDegree: '',
          specialization: '',
          collegeOrInstituteName: '',
          schoolName: '',
          experience: '',
          skills: '',
          previousCompany: '',
          previousSalary: '',
          // Application Information
          modeOfTraining: '',
          expectedJoiningDate: '',
          expectedSalary: '',
          currentSalary: '',
          noticePeriod: '',
          source: '',
          sourceName: '',
          // Status fields
          status: 'unread',
          callStatus: 'not_called',
          interviewRoundStatus: 'not_scheduled',
          aptitudeRoundStatus: 'not_scheduled',
          hrRoundStatus: 'not_scheduled',
          admissionLetter: 'not_issued',
          feesStatus: 'not_paid',
          paymentMethod: 'other',
          feesInstallmentStructure: 'one_time',
          // Additional fields
          feedback: '',
          city: '',
          state: '',
          pincode: ''
        });
        setUploadedFiles({
          resumeName: '',
          photoName: ''
        });
        setShowModal(false);
        onSuccess(result.data.data);
      } else {
        throw new Error(result.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      console.error('Error details:', error.response || error.message);
      alert(error.message || 'An error occurred while submitting the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    console.log('Closing modal and resetting form data');
    setFormData({
      fullName: '',
      email: '',
      phoneNo1: '',
      phoneNo2: '',
      postAppliedFor: '',
      productCompany: '',
      resume: null,
      photo: null,
      // Personal Information
      fatherName: '',
      fathersContactNo: '',
      address: '',
      gender: '',
      dateOfBirth: '',
      age: '',
      maritalStatus: '',
      category: '',
      nationality: '',
      religion: '',
      // Education Information
      highestDegree: '',
      specialization: '',
      collegeOrInstituteName: '',
      schoolName: '',
      experience: '',
      skills: '',
      previousCompany: '',
      previousSalary: '',
      // Application Information
      modeOfTraining: '',
      expectedJoiningDate: '',
      expectedSalary: '',
      currentSalary: '',
      noticePeriod: '',
      source: '',
      sourceName: '',
      // Status fields
      status: 'unread',
      callStatus: 'not_called',
      interviewRoundStatus: 'not_scheduled',
      aptitudeRoundStatus: 'not_scheduled',
      hrRoundStatus: 'not_scheduled',
      admissionLetter: 'not_issued',
      feesStatus: 'not_paid',
      paymentMethod: 'other',
      feesInstallmentStructure: 'one_time',
      // Additional fields
      feedback: '',
      city: '',
      state: '',
      pincode: '',
    });
    setUploadedFiles({
      resumeName: '',
      photoName: ''
    });
    setErrors({});
    setShowModal(false);
  };

  if (!showModal) {
    console.log('AddInternAppliedDataModal: Modal is not shown');
    return null;
  }
  
  console.log('AddInternAppliedDataModal: Rendering with formData:', formData);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </span>
            Apply for Intern Position
          </h2>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number 1
              </label>
              <input
                type="tel"
                name="phoneNo1"
                value={formData.phoneNo1}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  errors.phoneNo1 ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter primary phone number"
                disabled={isSubmitting}
              />
              {errors.phoneNo1 && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNo1}</p>
              )}
            </div>

            {/* Phone Number 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number 2
              </label>
              <input
                type="tel"
                name="phoneNo2"
                value={formData.phoneNo2}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  errors.phoneNo2 ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter secondary phone number (optional)"
                disabled={isSubmitting}
              />
              {errors.phoneNo2 && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNo2}</p>
              )}
            </div>

            {/* Post Applied For */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Applied For
              </label>
              <input
                type="text"
                name="postAppliedFor"
                value={formData.postAppliedFor}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  errors.postAppliedFor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter the position you're applying for"
                disabled={isSubmitting}
              />
              {errors.postAppliedFor && (
                <p className="mt-1 text-sm text-red-600">{errors.postAppliedFor}</p>
              )}
            </div>

            {/* Product Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Company
              </label>
              <select
                value={formData.productCompany}
                onChange={(e) => handleSelectChange('productCompany', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  errors.productCompany ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a company</option>
                {productCompanyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.productCompany && (
                <p className="mt-1 text-sm text-red-600">{errors.productCompany}</p>
              )}
            </div>

            {/* Resume Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  disabled={isSubmitting}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {uploadedFiles.resumeName ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFiles.resumeName}</p>
                        <p className="text-sm text-gray-500">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">Upload Resume</p>
                      <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.resume && (
                <p className="mt-1 text-sm text-red-600">{errors.resume}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="photo"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                  disabled={isSubmitting}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {uploadedFiles.photoName ? (
                    <div className="flex items-center justify-center gap-3">
                      <Camera className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFiles.photoName}</p>
                        <p className="text-sm text-gray-500">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">Upload Photo</p>
                      <p className="text-sm text-gray-500">JPG, PNG (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.photo && (
                <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.fatherName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter father's name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Contact
                  </label>
                  <input
                    type="text"
                    name="fathersContactNo"
                    value={formData.fathersContactNo}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.fathersContactNo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter father's contact number"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full address"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter age"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.maritalStatus ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter category"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Education Information Section */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Education Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Degree
                  </label>
                  <input
                    type="text"
                    name="highestDegree"
                    value={formData.highestDegree}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.highestDegree ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter highest degree"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.specialization ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter specialization"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College/Institute Name
                  </label>
                  <input
                    type="text"
                    name="collegeOrInstituteName"
                    value={formData.collegeOrInstituteName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.collegeOrInstituteName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter college/institute name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.schoolName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter school name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter experience"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.skills ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter skills separated by commas"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInternAppliedDataModal;