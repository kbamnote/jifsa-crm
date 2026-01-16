import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Camera } from 'lucide-react';

const UpdateInternAppliedDataModal = ({ showModal, setShowModal, itemToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNo1: '',
    phoneNo2: '',
    postAppliedFor: '',
    productCompany: '', // Added productCompany field
    resume: null,
    photo: null
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
    if (itemToEdit) {
      setFormData({
        fullName: itemToEdit.fullName || '',
        email: itemToEdit.email || '',
        phoneNo1: itemToEdit.phoneNo1 || '',
        phoneNo2: itemToEdit.phoneNo2 || '',
        postAppliedFor: itemToEdit.postAppliedFor || '',
        productCompany: itemToEdit.productCompany || '', // Added productCompany
        resume: null, // Don't set existing file here
        photo: null   // Don't set existing file here
      });
      setUploadedFiles({
        resumeName: itemToEdit.resumeUrl ? 'Current Resume.pdf' : '',
        photoName: itemToEdit.photoUrl ? 'Current Photo.jpg' : ''
      });
    }
  }, [itemToEdit]);

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
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNo1', formData.phoneNo1);
      
      if (formData.phoneNo2) {
        formDataToSend.append('phoneNo2', formData.phoneNo2);
      }
      
      formDataToSend.append('postAppliedFor', formData.postAppliedFor);
      formDataToSend.append('productCompany', formData.productCompany); // Added productCompany
      
      // Only append files if they were changed
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      const response = await fetch(`https://elite-backend-production.up.railway.app/intern-applied-data/${itemToEdit._id}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setShowModal(false);
        onSuccess(result.data);
      } else {
        throw new Error(result.message || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert(error.message || 'An error occurred while updating the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNo1: '',
      phoneNo2: '',
      postAppliedFor: '',
      resume: null,
      photo: null
    });
    setUploadedFiles({
      resumeName: '',
      photoName: ''
    });
    setErrors({});
    setShowModal(false);
  };

  if (!showModal || !itemToEdit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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