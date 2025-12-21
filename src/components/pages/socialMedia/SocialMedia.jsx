import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Calendar, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { createSocialMediaPost, getSocialMediaPosts, updateSocialMediaPost, deleteSocialMediaPost } from '../../utils/Api';
import Cookies from "js-cookie";
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';

const SocialMedia = () => {
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [formData, setFormData] = useState({
    productCompany: '',
    caption: '',
    platforms: [], // Changed from single platform to array of platforms
    uploadType: '',
    date: '',
    source: null,
    sourceUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Capitalized display names for UI
  const productCompanyOptions = [
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
    { value: 'X', label: 'X (Twitter)' }
  ];
  
  const uploadTypeOptions = [
    { value: 'post', label: 'Post' },
    { value: 'reel', label: 'Reel' }
  ];

  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || "");
    fetchSocialMediaData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, socialMediaData]);

  const fetchSocialMediaData = async () => {
    try {
      setLoading(true);
      const response = await getSocialMediaPosts();
      if (response.data.success) {
        setSocialMediaData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching social media data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = socialMediaData;
    if (searchTerm) {
      filtered = socialMediaData.filter(item =>
        item.productCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.platforms.some(platform => platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.uploadType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uploadedByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredData(filtered);
  };

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
      setSuccessMessage('Please select a product company');
      setShowSuccessModal(true);
      return;
    }
    
    if (formData.platforms.length === 0) {
      setSuccessMessage('Please select at least one platform');
      setShowSuccessModal(true);
      return;
    }
    
    if (!formData.uploadType) {
      setSuccessMessage('Please select an upload type');
      setShowSuccessModal(true);
      return;
    }
    
    if (!formData.date) {
      setSuccessMessage('Please select a date');
      setShowSuccessModal(true);
      return;
    }
    
    if (formData.uploadType === 'post' && !formData.source && !editingId) {
      setSuccessMessage('Please select an image to upload');
      setShowSuccessModal(true);
      return;
    }
    
    if (formData.uploadType === 'reel' && !formData.sourceUrl && !editingId) {
      setSuccessMessage('Please enter a reel URL');
      setShowSuccessModal(true);
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
      
      if (formData.uploadType === 'post' && formData.source) {
        formDataToSend.append('source', formData.source);
      } else if (formData.uploadType === 'reel') {
        formDataToSend.append('sourceUrl', formData.sourceUrl);
      }
      
      if (editingId) {
        // Update existing post
        await updateSocialMediaPost(editingId, formDataToSend);
        setSuccessMessage('Social media post updated successfully!');
      } else {
        // Create new post
        await createSocialMediaPost(formDataToSend);
        setSuccessMessage('Social media post created successfully!');
      }

      // Reset form
      setFormData({
        productCompany: '',
        platforms: [],
        uploadType: '',
        date: '',
        source: null,
        sourceUrl: ''
      });
      setUploadedFileName('');
      setShowForm(false);
      setEditingId(null);
      
      // Refresh data
      fetchSocialMediaData();
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting social media data:', error);
      setSuccessMessage('Error submitting social media data. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      productCompany: item.productCompany,
      platforms: item.platforms || [], // Use the platforms array from the item
      uploadType: item.uploadType,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '', // Format date for input
      source: null,
      sourceUrl: item.sourceUrl || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    if (userRole !== 'admin') {
      setSuccessMessage('Only admin users can delete social media posts');
      setShowSuccessModal(true);
      return;
    }
    
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteSocialMediaPost(itemToDelete);
      setSuccessMessage('Social media post deleted successfully!');
      fetchSocialMediaData();
    } catch (error) {
      console.error('Error deleting social media post:', error);
      setSuccessMessage('Error deleting social media post. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
      setShowSuccessModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse">
          {/* Header */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          
          {/* Search and Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-12 bg-gray-200"></div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-16 bg-gray-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Social Media Management</h1>
            <p className="text-gray-600 mt-2">Manage social media posts and reels for all product companies</p>
          </div>
          {/* Allow marketing, manager, sales, and admin users to add new posts */}
          {['marketing', 'manager', 'sales', 'admin'].includes(userRole) && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  productCompany: '',
                  platforms: [],
                  uploadType: '',
                  date: '',
                  source: null,
                  sourceUrl: ''
                });
                setUploadedFileName('');
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {showForm ? 'Cancel' : 'Add New'}
            </button>
          )}
        </div>

        {/* Form */}
        {/* Allow marketing, manager, sales, and admin users to see the form */}
        {showForm && ['marketing', 'manager', 'sales', 'admin'].includes(userRole) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {editingId ? 'Edit Social Media Post' : 'Add New Social Media Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image
                    </label>
                    <div className="flex items-center space-x-4">
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
                  </div>
                ) : formData.uploadType === 'reel' ? (
                  <div className="md:col-span-2">
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
                ) : null}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company, platform, or user..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-xl font-bold text-gray-800">{filteredData.length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Platforms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Uploaded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No social media posts found</h3>
                        <p className="text-gray-500">Get started by adding a new social media post.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {productCompanyOptions.find(opt => opt.value === item.productCompany)?.label || item.productCompany}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.platforms?.map(platform => 
                            platformOptions.find(opt => opt.value === platform)?.label || platform
                          ).join(', ') || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {uploadTypeOptions.find(opt => opt.value === item.uploadType)?.label || item.uploadType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.uploadedByName}</div>
                        <div className="text-sm text-gray-500">{item.uploadedByEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* Allow marketing, manager, sales, and admin users to edit */}
                          <button
                            onClick={() => handleEdit(item)}
                            className={`p-2 rounded-lg transition-colors ${['marketing', 'manager', 'sales', 'admin'].includes(userRole) ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-400 cursor-not-allowed'}`}
                            disabled={!['marketing', 'manager', 'sales', 'admin'].includes(userRole)}
                            title={['marketing', 'manager', 'sales', 'admin'].includes(userRole) ? "Edit" : "Only authorized users can edit"}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Only admin users can delete */}
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteClick(item._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Only admin users can delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      <SuccessModal 
        showModal={showSuccessModal}
        setShowModal={setShowSuccessModal}
        message={successMessage}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        onConfirm={confirmDelete}
        itemName="social media post"
      />
    </div>
  );
};

export default SocialMedia;