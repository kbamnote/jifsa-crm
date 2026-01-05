import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Calendar, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { createSocialMediaPost, getSocialMediaPosts, updateSocialMediaPost, deleteSocialMediaPost, getSocialMediaStats } from '../../utils/Api';
import Cookies from "js-cookie";
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import AddSocialMediaModal from '../../modal/AddSocialMediaModal';
import UpdateSocialMediaModal from '../../modal/UpdateSocialMediaModal';

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
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalReels: 0,
    totalPostsType: 0,
    totalFlyers: 0,
    teamStats: {}
  });
  
  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await getSocialMediaStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  useEffect(() => {
    fetchStats();
  }, []);

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
    { value: 'X', label: 'X (Twitter)' }
  ];
  
  const uploadTypeOptions = [
    { value: 'post', label: 'Post' },
    { value: 'reel', label: 'Reel' },
    { value: 'flyer', label: 'Flyer' }
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
      // Refresh stats after fetching data
      fetchStats();
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
    
    if (formData.uploadType === 'reel' && !formData.sourceUrl && !editingId) {
      setSuccessMessage('Please enter a reel URL');
      setShowSuccessModal(true);
      return;
    }
    
    // For posts and flyers, ensure at least one of image or URL is provided
    if ((formData.uploadType === 'post' || formData.uploadType === 'flyer') && !formData.source && !formData.sourceUrl && !editingId) {
      setSuccessMessage('Please select an image to upload or enter a URL');
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
      
      if ((formData.uploadType === 'post' || formData.uploadType === 'flyer') && formData.source) {
        formDataToSend.append('source', formData.source);
      }
      
      if (formData.uploadType === 'reel' || formData.uploadType === 'post') {
        formDataToSend.append('sourceUrl', formData.sourceUrl);
      }
      
      if (formData.uploadType === 'flyer') {
        formDataToSend.append('sourceUrl', formData.sourceUrl); // For backward compatibility
        formDataToSend.append('flyerUrl', formData.sourceUrl);
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
    setItemToEdit(item);
    setShowUpdateModal(true);
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

  // Handle image/video preview
  const handleImagePreview = (url) => {
    setPreviewImage(url);
    setShowImagePreview(true);
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

        {/* Image/Video Preview Modal */}
        {showImagePreview && (
          <div 
            className="fixed inset-0 bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImagePreview(false)}
          >
            <div 
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImagePreview(false)}
                className="absolute top-4 right-4 text-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {previewImage && (
                <div className="flex justify-center">
                  {previewImage.toLowerCase().match(/\.(mp4|webm|ogg)$/i) ? (
                    <video 
                      src={previewImage} 
                      controls 
                      className="max-w-full max-h-[90vh] object-contain"
                    />
                  ) : (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-w-full max-h-[90vh] object-contain"
                      onError={(e) => {
                        console.error('Image failed to load:', previewImage);
                        e.target.src = '/placeholder-image.jpg'; // fallback image
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Social Media Modal */}
        <AddSocialMediaModal
          showModal={showAddModal}
          setShowModal={setShowAddModal}
          onSuccess={() => {
            fetchSocialMediaData();
            setShowAddModal(false);
          }}
        />

        {/* Update Social Media Modal */}
        <UpdateSocialMediaModal
          showModal={showUpdateModal}
          setShowModal={setShowUpdateModal}
          itemToEdit={itemToEdit}
          onSuccess={() => {
            fetchSocialMediaData();
            setShowUpdateModal(false);
            setItemToEdit(null);
          }}
        />
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
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add New
            </button>
          )}
        </div>



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
          <div className="flex flex-wrap gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalPosts}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Posts</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalPostsType}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Reels</p>
              <p className="text-xl font-bold text-green-600">{stats.totalReels}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-600">Flyers</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalFlyers}</p>
            </div>
          </div>
        </div>

        {/* Team Stats Section - Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(stats.teamStats).map(([name, userStats]) => (
              <div key={name} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2 truncate">{name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{userStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts:</span>
                    <span className="text-blue-600 font-medium">{userStats.posts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reels:</span>
                    <span className="text-green-600 font-medium">{userStats.reels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flyers:</span>
                    <span className="text-purple-600 font-medium">{userStats.flyers}</span>
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(stats.teamStats).length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No team statistics available</p>
              </div>
            )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Uploaded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.imageUrl && item.uploadType === 'post' && (
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleImagePreview(item.imageUrl)}
                          >
                            <img 
                              src={item.imageUrl} 
                              alt="Post" 
                              className="w-10 h-10 object-cover rounded-md border border-gray-200"
                            />
                          </div>
                        )}
                        {item.imageUrl && item.uploadType === 'flyer' && (
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleImagePreview(item.imageUrl)}
                          >
                            <img 
                              src={item.imageUrl} 
                              alt="Flyer" 
                              className="w-10 h-10 object-cover rounded-md border border-gray-200"
                            />
                          </div>
                        )}
                        {item.videoUrl && item.uploadType === 'flyer' && (
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleImagePreview(item.videoUrl)}
                          >
                            <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {(item.uploadType === 'reel') && (
                          <div className="flex justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {!item.imageUrl && !item.videoUrl && item.uploadType !== 'reel' && (
                          <span className="text-gray-400 italic">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.uploadType === 'reel' && item.sourceUrl && (
                          <a 
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Reel Link
                          </a>
                        )}
                        {item.uploadType === 'post' && item.sourceUrl && (
                          <a 
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Post Link
                          </a>
                        )}
                        {item.uploadType === 'flyer' && (item.flyerUrl || item.sourceUrl) && (
                          <a 
                            href={item.flyerUrl || item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Flyer Link
                          </a>
                        )}
                        {!item.sourceUrl && !item.flyerUrl && (
                          <span className="text-gray-400 italic">No link</span>
                        )}
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