import React, { useState } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';
import { createSocialMediaPost } from '../utils/Api';

const AddSocialMediaModal = ({ showModal, setShowModal, onSuccess }) => {
  const [formData, setFormData] = useState({
    productCompany: '',
    caption: '',
    platforms: [],
    uploadType: '',
    date: '',
    source: null,
    sourceUrl: ''
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capitalized display names for UI
  const productCompanyOptions = [
    { value: 'Elite-Associate', label: 'Elite Associate' },
    { value: 'JIFSA', label: 'JIFSA' },
    { value: 'Elite-BIM', label: 'Elite BIM' },
    { value: 'Elite-BIFS', label: 'Elite BIFS' },
    { value: 'EEE-Technologies', label: 'EEE Technologies' },
    { value: 'Elite-Jobs', label: 'Elite Jobs' },
    { value: 'Elite-Cards', label: 'Elite Cards' }
  ];

  const platformOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'X', label: 'X (Twitter)' },
    { value: 'youtube', label: 'YouTube' }
  ];

  const uploadTypeOptions = [
    { value: 'post', label: 'Post' },
    { value: 'reel', label: 'Reel' },
    { value: 'flyer', label: 'Flyer' },
    { value: 'video', label: 'Video' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle platform selection (multiple checkboxes)
  const handlePlatformChange = (platformValue) => {
    setFormData(prev => {
      const platforms = prev.platforms.includes(platformValue)
        ? prev.platforms.filter(p => p !== platformValue) // Remove if already selected
        : [...prev.platforms, platformValue]; // Add if not selected
      
      return {
        ...prev,
        platforms
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        source: file
      }));
      setUploadedFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productCompany) {
      alert('Please select a product company');
      return;
    }
    
    if (formData.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }
    
    if (!formData.uploadType) {
      alert('Please select an upload type');
      return;
    }
    
    if (!formData.date) {
      alert('Please select a date');
      return;
    }
    
    if (formData.uploadType === 'reel' && !formData.sourceUrl) {
      alert('Please enter a reel URL');
      return;
    }
    
    if (formData.uploadType === 'video' && !formData.sourceUrl) {
      alert('Please enter a video URL');
      return;
    }
    
    // For posts and flyers, ensure at least one of image or URL is provided
    if ((formData.uploadType === 'post' || formData.uploadType === 'flyer') && !formData.source && !formData.sourceUrl) {
      alert('Please select an image to upload or enter a URL');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('productCompany', formData.productCompany);
      
      // Append all selected platforms
      formData.platforms.forEach(platform => {
        formDataToSend.append('platforms', platform);
      });
      
      formDataToSend.append('uploadType', formData.uploadType);
      formDataToSend.append('date', formData.date);
      
      if ((formData.uploadType === 'post' || formData.uploadType === 'flyer') && formData.source) {
        formDataToSend.append('source', formData.source);
      } else if (formData.uploadType === 'reel' || formData.uploadType === 'video') {
        formDataToSend.append('sourceUrl', formData.sourceUrl);
      }
      
      if (formData.uploadType === 'post' || formData.uploadType === 'post') {
        formDataToSend.append('sourceUrl', formData.sourceUrl);
      }
      
      if (formData.uploadType === 'flyer') {
        formDataToSend.append('sourceUrl', formData.sourceUrl); // For backward compatibility
        formDataToSend.append('flyerUrl', formData.sourceUrl);
      }

      await createSocialMediaPost(formDataToSend);
      
      setFormData({
        productCompany: '',
        platforms: [],
        uploadType: '',
        date: '',
        source: null,
        sourceUrl: ''
      });
      setUploadedFileName('');
      setShowModal(false);
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error submitting social media data:', error);
      alert('Error submitting social media data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Add New Social Media Post
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Product Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Company
                </label>
                <select
                  name="productCompany"
                  value={formData.productCompany}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Product Company</option>
                  {productCompanyOptions.map(company => (
                    <option key={company.value} value={company.value}>{company.label}</option>
                  ))}
                </select>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  name="caption"
                  value={formData.caption}
                  onChange={handleInputChange}
                  placeholder="Enter a caption for your post"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Platforms (Multiple Selection) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media Platforms
                </label>
                <div className="space-y-2">
                  {platformOptions.map(platform => (
                    <div key={platform.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`platform-${platform.value}`}
                        checked={formData.platforms.includes(platform.value)}
                        onChange={() => handlePlatformChange(platform.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`platform-${platform.value}`} className="ml-2 text-sm text-gray-700">
                        {platform.label}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.platforms.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    Selected: {formData.platforms.map(p => platformOptions.find(opt => opt.value === p)?.label).join(', ')}
                  </div>
                )}
              </div>

              {/* Upload Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Type
                </label>
                <select
                  name="uploadType"
                  value={formData.uploadType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Upload Type</option>
                  {uploadTypeOptions.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Source - Conditional based on upload type */}
              {formData.uploadType === 'post' ? (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    {uploadedFileName && (
                      <div className="text-sm text-gray-600">
                        Selected: {uploadedFileName}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post URL (Optional)
                    </label>
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                        <LinkIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="sourceUrl"
                        value={formData.sourceUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/post"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : formData.uploadType === 'reel' ? (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reel URL
                  </label>
                  <div className="flex">
                    <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                      <LinkIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="sourceUrl"
                      value={formData.sourceUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/reel"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.uploadType === 'reel'}
                    />
                  </div>
                </div>
              ) : formData.uploadType === 'flyer' ? (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Flyer
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Image/Video up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    {uploadedFileName && (
                      <div className="text-sm text-gray-600">
                        Selected: {uploadedFileName}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flyer URL
                    </label>
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                        <LinkIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="sourceUrl"
                        value={formData.sourceUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/flyer"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={formData.uploadType === 'flyer'}
                      />
                    </div>
                  </div>
                </div>
              ) : formData.uploadType === 'video' ? (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <div className="flex">
                    <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                      <LinkIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="sourceUrl"
                      value={formData.sourceUrl}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/video"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.uploadType === 'video'}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-2 sm:space-y-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSocialMediaModal;