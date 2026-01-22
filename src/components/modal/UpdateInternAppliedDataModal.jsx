import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Camera } from 'lucide-react';
import { updateInternApplication } from '../utils/Api';

const UpdateInternAppliedDataModal = ({ showModal, setShowModal, itemToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNo1: '',
    phoneNo2: '',
    postAppliedFor: '',
    productCompany: '', // Added productCompany field
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
    // Assignment fields
    assignedTo: null,
    assignedBy: null,
    assignedByName: ''
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

  // Initialize form data when itemToEdit changes
  useEffect(() => {
    console.log('Initialize form data useEffect triggered with itemToEdit:', itemToEdit);
    if (itemToEdit) {
      const newFormData = {
        fullName: itemToEdit.fullName || '',
        email: itemToEdit.email || '',
        phoneNo1: itemToEdit.phoneNo1 || '',
        phoneNo2: itemToEdit.phoneNo2 || '',
        postAppliedFor: itemToEdit.postAppliedFor || '',
        productCompany: itemToEdit.productCompany || '',
        resume: null, // Don't set existing file here
        photo: null,  // Don't set existing file here
        // Personal Information
        fatherName: itemToEdit.fatherName || '',
        fathersContactNo: itemToEdit.fathersContactNo || '',
        address: itemToEdit.address || '',
        gender: itemToEdit.gender || '',
        dateOfBirth: itemToEdit.dateOfBirth || '',
        age: itemToEdit.age || '',
        maritalStatus: itemToEdit.maritalStatus || '',
        category: itemToEdit.category || '',
        nationality: itemToEdit.nationality || '',
        religion: itemToEdit.religion || '',
        // Education Information
        highestDegree: itemToEdit.highestDegree || '',
        specialization: itemToEdit.specialization || '',
        collegeOrInstituteName: itemToEdit.collegeOrInstituteName || '',
        schoolName: itemToEdit.schoolName || '',
        experience: itemToEdit.experience || '',
        skills: itemToEdit.skills || '',
        previousCompany: itemToEdit.previousCompany || '',
        previousSalary: itemToEdit.previousSalary || '',
        // Application Information
        modeOfTraining: itemToEdit.modeOfTraining || '',
        expectedJoiningDate: itemToEdit.expectedJoiningDate || '',
        expectedSalary: itemToEdit.expectedSalary || '',
        currentSalary: itemToEdit.currentSalary || '',
        noticePeriod: itemToEdit.noticePeriod || '',
        source: itemToEdit.source || '',
        sourceName: itemToEdit.sourceName || '',
        // Status fields
        status: itemToEdit.status || 'unread',
        callStatus: itemToEdit.callStatus || 'not_called',
        interviewRoundStatus: itemToEdit.interviewRoundStatus || 'not_scheduled',
        aptitudeRoundStatus: itemToEdit.aptitudeRoundStatus || 'not_scheduled',
        hrRoundStatus: itemToEdit.hrRoundStatus || 'not_scheduled',
        admissionLetter: itemToEdit.admissionLetter || 'not_issued',
        feesStatus: itemToEdit.feesStatus || 'not_paid',
        paymentMethod: itemToEdit.paymentMethod || 'other',
        feesInstallmentStructure: itemToEdit.feesInstallmentStructure || 'one_time',
        // Additional fields
        feedback: itemToEdit.feedback || '',
        city: itemToEdit.city || '',
        state: itemToEdit.state || '',
        pincode: itemToEdit.pincode || '',
        // Assignment fields
        assignedTo: itemToEdit.assignedTo || null,
        assignedBy: itemToEdit.assignedBy || null,
        assignedByName: itemToEdit.assignedByName || ''
      };
      
      console.log('Setting form data to:', newFormData);
      setFormData(newFormData);
      
      const newUploadedFiles = {
        resumeName: itemToEdit.resumeUrl ? 'Current Resume.pdf' : '',
        photoName: itemToEdit.photoUrl ? 'Current Photo.jpg' : ''
      };
      console.log('Setting uploaded files to:', newUploadedFiles);
      setUploadedFiles(newUploadedFiles);
    }
  }, [itemToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed from '${formData[name]}' to '${value}'`);
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
    console.log(`Select field ${name} changed from '${formData[name]}' to '${value}'`);
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
    
    console.log(`File field ${name} changed, file selected:`, file?.name || 'none');
    
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
      console.log('Updating intern application with ID:', itemToEdit._id);
      console.log('Current form data:', formData);
      console.log('Changed fields compared to original:', 
        Object.keys(formData).filter(key => 
          formData[key] !== itemToEdit[key] && 
          !(formData[key] === '' && itemToEdit[key] == null) &&
          !(formData[key] == null && itemToEdit[key] === '')
        )
      );
      
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
      formDataToSend.append('feedback', formData.feedback || '');
      formDataToSend.append('city', formData.city || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('pincode', formData.pincode || '');
      
      // Assignment fields
      formDataToSend.append('assignedTo', formData.assignedTo || '');
      formDataToSend.append('assignedBy', formData.assignedBy || '');
      formDataToSend.append('assignedByName', formData.assignedByName || '');
      
      // Source field
      formDataToSend.append('source', formData.source || 'other');
      
      // Interview tracking fields
      formDataToSend.append('callStatus', formData.callStatus);
      formDataToSend.append('interviewRoundStatus', formData.interviewRoundStatus);
      formDataToSend.append('aptitudeRoundStatus', formData.aptitudeRoundStatus);
      formDataToSend.append('hrRoundStatus', formData.hrRoundStatus);
      formDataToSend.append('admissionLetter', formData.admissionLetter);
      
      // Fees and payment fields
      formDataToSend.append('feesStatus', formData.feesStatus);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('feesInstallmentStructure', formData.feesInstallmentStructure);
      
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
      formDataToSend.append('sourceName', formData.sourceName || '');
      
      // Files
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      console.log('FormData being sent to update API:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
      }
      
      // Use the API function instead of direct fetch
      const result = await updateInternApplication(itemToEdit._id, formDataToSend);
      
      console.log('Update API response:', result);

      if (result.data.success) {
        console.log('Application updated successfully:', result.data.data);
        setShowModal(false);
        onSuccess(result.data.data);
      } else {
        throw new Error(result.data.message || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      console.error('Error details:', error.response || error.message);
      alert(error.message || 'An error occurred while updating the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    console.log('Closing update modal and resetting form data');
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
      // Assignment fields
      assignedTo: null,
      assignedBy: null,
      assignedByName: ''
    });
    setUploadedFiles({
      resumeName: '',
      photoName: ''
    });
    setErrors({});
    setShowModal(false);
  };

  if (!showModal || !itemToEdit) {
    console.log('UpdateInternAppliedDataModal: Modal is not shown or itemToEdit is null');
    return null;
  }
  
  console.log('UpdateInternAppliedDataModal: Rendering with itemToEdit:', itemToEdit, 'and formData:', formData);
  console.log('Form data keys:', Object.keys(formData));
  console.log('Full name in form data:', formData.fullName);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </span>
            Update Intern Application
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
                Upload Resume
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-update-upload"
                  disabled={isSubmitting}
                />
                <label htmlFor="resume-update-upload" className="cursor-pointer">
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
                      <p className="font-medium text-gray-900">Upload New Resume (Optional)</p>
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
                Upload Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="photo"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-update-upload"
                  disabled={isSubmitting}
                />
                <label htmlFor="photo-update-upload" className="cursor-pointer">
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
                      <p className="font-medium text-gray-900">Upload New Photo (Optional)</p>
                      <p className="text-sm text-gray-500">JPG, PNG (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.photo && (
                <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
              )}
            </div>
          </div>

          {/* CRM Process Fields */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              CRM Process Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Status
                </label>
                <select
                  name="callStatus"
                  value={formData.callStatus}
                  onChange={(e) => handleSelectChange('callStatus', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="not_called">Not Called</option>
                  <option value="called">Called</option>
                  <option value="follow_up_required">Follow Up Required</option>
                  <option value="not_reachable">Not Reachable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Round Status
                </label>
                <select
                  name="interviewRoundStatus"
                  value={formData.interviewRoundStatus}
                  onChange={(e) => handleSelectChange('interviewRoundStatus', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aptitude Round Status
                </label>
                <select
                  name="aptitudeRoundStatus"
                  value={formData.aptitudeRoundStatus}
                  onChange={(e) => handleSelectChange('aptitudeRoundStatus', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HR Round Status
                </label>
                <select
                  name="hrRoundStatus"
                  value={formData.hrRoundStatus}
                  onChange={(e) => handleSelectChange('hrRoundStatus', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Letter
                </label>
                <select
                  name="admissionLetter"
                  value={formData.admissionLetter}
                  onChange={(e) => handleSelectChange('admissionLetter', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="not_issued">Not Issued</option>
                  <option value="issued">Issued</option>
                  <option value="received">Received</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fees Status
                </label>
                <select
                  name="feesStatus"
                  value={formData.feesStatus}
                  onChange={(e) => handleSelectChange('feesStatus', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="not_paid">Not Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => handleSelectChange('paymentMethod', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="other">Other</option>
                  <option value="UPI">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fees Installment Structure
                </label>
                <select
                  name="feesInstallmentStructure"
                  value={formData.feesInstallmentStructure}
                  onChange={(e) => handleSelectChange('feesInstallmentStructure', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 border-gray-300"
                  disabled={isSubmitting}
                >
                  <option value="one_time">One Time</option>
                  <option value="two_installments">Two Installments</option>
                  <option value="three_installments">Three Installments</option>
                  <option value="four_installments">Four Installments</option>
                  <option value="EMI">EMI</option>
                  <option value="Loan">Loan</option>
                  <option value="other">Other</option>
                </select>
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
                  Updating...
                </>
              ) : (
                'Update Application'
              )}
            </button>
          </div>
        </form>


      </div>
    </div>
  );
};

export default UpdateInternAppliedDataModal;