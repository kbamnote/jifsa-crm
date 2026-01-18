import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Eye, Calendar, Upload, Link as LinkIcon, Trash2, X } from 'lucide-react';
import { Users, UserCircle, BarChart3, Image, Video, FileText, Building, Globe, Tag, Camera, PlayCircle, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { createSocialMediaPost, getSocialMediaPosts, updateSocialMediaPost, deleteSocialMediaPost, getSocialMediaStats } from '../../utils/Api';
import Cookies from "js-cookie";
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import AddSocialMediaModal from '../../modal/AddSocialMediaModal';
import UpdateSocialMediaModal from '../../modal/UpdateSocialMediaModal';

const SocialMedia = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState({
    productCompany: '',
    platform: '',
    uploadType: '',
    startDate: '',
    endDate: '',
    uploadedBy: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueUploadedBy, setUniqueUploadedBy] = useState([]);
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
    
    // Parse URL parameters on component mount
    const urlParams = new URLSearchParams(location.search);
    const pageParam = parseInt(urlParams.get('page')) || 1;
    const searchParam = urlParams.get('search') || '';
    
    const filterParams = {
      productCompany: urlParams.get('productCompany') || '',
      platform: urlParams.get('platform') || '',
      uploadType: urlParams.get('uploadType') || '',
      startDate: urlParams.get('startDate') || '',
      endDate: urlParams.get('endDate') || '',
      uploadedBy: urlParams.get('uploadedBy') || ''
    };
    
    setSearchTerm(searchParam);
    setFilters(filterParams);
    setCurrentPage(pageParam);
    
    fetchSocialMediaData(pageParam);
  }, []);

  useEffect(() => {
    // Only apply client-side filtering when search term changes
    // For filter changes, we already fetch from server
    filterData();
  }, [searchTerm, socialMediaData, filters]);

  const fetchSocialMediaData = async (page = 1) => {
    try {
      setLoading(true);
      // Prepare filters for API call
      const apiFilters = {
        productCompany: filters.productCompany || undefined,
        platform: filters.platform || undefined,
        uploadType: filters.uploadType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        uploadedBy: filters.uploadedBy || undefined,
        search: searchTerm || undefined
      };
      
      const response = await getSocialMediaPosts(page, pageSize, apiFilters);
      if (response.data.success) {
        setSocialMediaData(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || response.data.data.length);
        setCurrentPage(response.data.currentPage || page);
        
        // Update URL with current state
        updateURLParams(filters, page, searchTerm);
      }
      // Refresh stats after fetching data
      fetchStats();
    } catch (error) {
      console.error('Error fetching social media data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    // Reset to page 1 and fetch new data when filter changes
    setCurrentPage(1);
    fetchSocialMediaData(1);
  };
  
  // Update URL with current filters and page
  const updateURLParams = (newFilters, newPage, newSearch) => {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    // Add search term
    if (newSearch) params.set('search', newSearch);
    
    // Add page
    if (newPage && newPage > 1) params.set('page', newPage);
    
    // Update URL without reloading
    const newUrl = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    navigate(newUrl, { replace: true });
  };
  
  // Extract unique uploaded by names from data
  useEffect(() => {
    if (socialMediaData.length > 0) {
      const uniqueNames = [...new Set(socialMediaData.map(item => item.uploadedByName))]
        .filter(name => name)
        .sort();
      setUniqueUploadedBy(uniqueNames);
    }
  }, [socialMediaData]);

  const clearFilters = () => {
    const clearedFilters = {
      productCompany: '',
      platform: '',
      uploadType: '',
      startDate: '',
      endDate: '',
      uploadedBy: ''
    };
    
    setFilters(clearedFilters);
    setSearchTerm('');
    setCurrentPage(1);
    
    // Update URL
    updateURLParams(clearedFilters, 1, '');
    
    // Refetch data
    fetchSocialMediaData(1);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length + (searchTerm ? 1 : 0);
  };

  const filterData = () => {
    let filtered = [...socialMediaData];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.platforms.some(platform => platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.uploadType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uploadedByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply product company filter
    if (filters.productCompany) {
      filtered = filtered.filter(item => 
        item.productCompany === filters.productCompany
      );
    }
    
    // Apply platform filter
    if (filters.platform) {
      filtered = filtered.filter(item => 
        item.platforms.includes(filters.platform)
      );
    }
    
    // Apply upload type filter
    if (filters.uploadType) {
      filtered = filtered.filter(item => 
        item.uploadType === filters.uploadType
      );
    }
    
    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(item => 
        new Date(item.date) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(item => 
        new Date(item.date) <= endDate
      );
    }
    
    // Apply uploaded by filter
    if (filters.uploadedBy) {
      filtered = filtered.filter(item => 
        item.uploadedByName.toLowerCase().includes(filters.uploadedBy.toLowerCase())
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
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
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              {previewImage && (
                <div className="flex justify-center items-center min-h-[200px]">
                  {previewImage.toLowerCase().match(/\.(mp4|webm|ogg)$/i) ? (
                    <video 
                      src={previewImage} 
                      controls 
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                  ) : (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-w-full max-h-[80vh] object-contain"
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
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Social Media Management</h1>
              <p className="text-gray-600 mt-1 sm:mt-2">Manage social media posts and reels for all product companies</p>
            </div>
            {/* Allow marketing, manager, sales, and admin users to add new posts */}
            {['marketing', 'manager', 'sales', 'admin'].includes(userRole) && (
              <button
                onClick={() => {
                  setShowAddModal(true);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Add New</span>
              </button>
            )}
          </div>
        </div>



        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
       
          
          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'} shadow-sm`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-semibold">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
            
            {(getActiveFilterCount() > 0 || searchTerm) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-xl shadow-sm border border-blue-100 min-w-[100px] text-center">
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-lg sm:text-xl font-bold text-blue-800">{stats.totalPosts}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-xl shadow-sm border border-blue-100 min-w-[100px] text-center">
              <p className="text-xs text-blue-600 font-medium">Posts</p>
              <p className="text-lg sm:text-xl font-bold text-blue-800">{stats.totalPostsType}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-3 rounded-xl shadow-sm border border-green-100 min-w-[100px] text-center">
              <p className="text-xs text-green-600 font-medium">Reels</p>
              <p className="text-lg sm:text-xl font-bold text-green-800">{stats.totalReels}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3 rounded-xl shadow-sm border border-purple-100 min-w-[100px] text-center">
              <p className="text-xs text-purple-600 font-medium">Flyers</p>
              <p className="text-lg sm:text-xl font-bold text-purple-800">{stats.totalFlyers}</p>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Product Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Company</label>
                <select
                  value={filters.productCompany}
                  onChange={(e) => handleFilterChange('productCompany', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">All Companies</option>
                  {productCompanyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={filters.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">All Platforms</option>
                  {platformOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Upload Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Type</label>
                <select
                  value={filters.uploadType}
                  onChange={(e) => handleFilterChange('uploadType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">All Types</option>
                  {uploadTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {/* Uploaded By Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded By</label>
                <select
                  value={filters.uploadedBy}
                  onChange={(e) => handleFilterChange('uploadedBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">All Users</option>
                  {uniqueUploadedBy.map((name, index) => (
                    <option key={index} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  {filters.productCompany && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {productCompanyOptions.find(opt => opt.value === filters.productCompany)?.label}
                      <button
                        onClick={() => handleFilterChange('productCompany', '')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.platform && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {platformOptions.find(opt => opt.value === filters.platform)?.label}
                      <button
                        onClick={() => handleFilterChange('platform', '')}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.uploadType && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {uploadTypeOptions.find(opt => opt.value === filters.uploadType)?.label}
                      <button
                        onClick={() => handleFilterChange('uploadType', '')}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.startDate && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      From: {formatDate(filters.startDate)}
                      <button
                        onClick={() => handleFilterChange('startDate', '')}
                        className="ml-1 text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.endDate && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      To: {formatDate(filters.endDate)}
                      <button
                        onClick={() => handleFilterChange('endDate', '')}
                        className="ml-1 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.uploadedBy && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      By: {filters.uploadedBy}
                      <button
                        onClick={() => handleFilterChange('uploadedBy', '')}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-gray-600 hover:text-gray-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Team Stats Section - Cards */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              Team Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.teamStats).map(([name, userStats]) => (
                <div key={name} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="font-semibold text-gray-800 mb-3 truncate flex items-center gap-1">
                    <UserCircle className="w-4 h-4 text-blue-500" />
                    {name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Total:
                      </span>
                      <span className="font-medium text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {userStats.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <Image className="w-3 h-3" /> Posts:
                      </span>
                      <span className="text-blue-600 font-medium text-sm bg-blue-50 px-2 py-1 rounded-full">
                        {userStats.posts}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <Video className="w-3 h-3" /> Reels:
                      </span>
                      <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded-full">
                        {userStats.reels}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Flyers:
                      </span>
                      <span className="text-purple-600 font-medium text-sm bg-purple-50 px-2 py-1 rounded-full">
                        {userStats.flyers}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(stats.teamStats).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No team statistics available</p>
                  <p className="text-gray-400 text-sm mt-1">Start adding social media posts to see team statistics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      
        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Product Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Platforms</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">File</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Link</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 sm:py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1">No social media posts found</h3>
                        <p className="text-sm sm:text-gray-500">Get started by adding a new social media post.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-200">
                      <td className="px-4 py-3 whitespace-nowrap text-sm md:hidden">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Building className="w-4 h-4 text-blue-500" /> Company:
                        </div>
                        <div className="text-gray-700 ml-5">
                          {productCompanyOptions.find(opt => opt.value === item.productCompany)?.label || item.productCompany}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm font-medium text-gray-900">
                          {productCompanyOptions.find(opt => opt.value === item.productCompany)?.label || item.productCompany}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm md:hidden">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Globe className="w-4 h-4 text-blue-500" /> Platforms:
                        </div>
                        <div className="text-gray-700 ml-5">
                          {item.platforms?.map(platform => 
                            platformOptions.find(opt => opt.value === platform)?.label || platform
                          ).join(', ') || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {item.platforms?.map(platform => 
                            platformOptions.find(opt => opt.value === platform)?.label || platform
                          ).join(', ') || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm md:hidden">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Tag className="w-4 h-4 text-blue-500" /> Type:
                        </div>
                        <div className="ml-5">
                          <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-2 py-1">
                            {uploadTypeOptions.find(opt => opt.value === item.uploadType)?.label || item.uploadType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                          {uploadTypeOptions.find(opt => opt.value === item.uploadType)?.label || item.uploadType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm md:hidden">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Camera className="w-4 h-4 text-blue-500" /> File:
                        </div>
                        <div className="flex items-center ml-5">
                          {item.imageUrl && item.uploadType === 'post' && (
                            <div 
                              className="cursor-pointer"
                              onClick={() => handleImagePreview(item.imageUrl)}
                            >
                              <img 
                                src={item.imageUrl} 
                                alt="Post" 
                                className="w-8 h-8 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
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
                                className="w-8 h-8 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                              />
                            </div>
                          )}
                          {item.videoUrl && item.uploadType === 'flyer' && (
                            <div 
                              className="cursor-pointer"
                              onClick={() => handleImagePreview(item.videoUrl)}
                            >
                              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                                <PlayCircle className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                          {(item.uploadType === 'reel') && (
                            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                              <PlayCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {!item.imageUrl && !item.videoUrl && item.uploadType !== 'reel' && (
                            <span className="text-gray-400 italic text-sm">No file</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        {item.imageUrl && item.uploadType === 'post' && (
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleImagePreview(item.imageUrl)}
                          >
                            <img 
                              src={item.imageUrl} 
                              alt="Post" 
                              className="w-10 h-10 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
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
                              className="w-10 h-10 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                            />
                          </div>
                        )}
                        {item.videoUrl && item.uploadType === 'flyer' && (
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleImagePreview(item.videoUrl)}
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                              <PlayCircle className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        )}
                        {(item.uploadType === 'reel') && (
                          <div className="flex justify-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                              <PlayCircle className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                        {!item.imageUrl && !item.videoUrl && item.uploadType !== 'reel' && (
                          <span className="text-gray-400 italic text-sm">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm md:hidden">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <LinkIcon className="w-4 h-4 text-blue-500" /> Link:
                        </div>
                        <div className="ml-5">
                          {item.uploadType === 'reel' && item.sourceUrl && (
                            <a 
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Reel
                            </a>
                          )}
                          {item.uploadType === 'post' && item.sourceUrl && (
                            <a 
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Post
                            </a>
                          )}
                          {item.uploadType === 'flyer' && (item.flyerUrl || item.sourceUrl) && (
                            <a 
                              href={item.flyerUrl || item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Flyer
                            </a>
                          )}
                          {!item.sourceUrl && !item.flyerUrl && (
                            <span className="text-gray-400 italic text-sm">No link</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        {item.uploadType === 'reel' && item.sourceUrl && (
                          <a 
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Reel Link
                          </a>
                        )}
                        {item.uploadType === 'post' && item.sourceUrl && (
                          <a 
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Post Link
                          </a>
                        )}
                        {item.uploadType === 'flyer' && (item.flyerUrl || item.sourceUrl) && (
                          <a 
                            href={item.flyerUrl || item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Flyer Link
                          </a>
                        )}
                        {!item.sourceUrl && !item.flyerUrl && (
                          <span className="text-gray-400 italic text-sm">No link</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm md:hidden">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-blue-500" /> Date:
                        </div>
                        <div className="text-gray-500 ml-5">
                          {formatDate(item.date)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm hidden md:table-cell text-gray-500">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm md:hidden">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <User className="w-4 h-4 text-blue-500" /> Uploaded By:
                        </div>
                        <div className="text-gray-900 ml-5">{item.uploadedByName}</div>
                        <div className="text-gray-500 ml-5">{item.uploadedByEmail}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">{item.uploadedByName}</div>
                        <div className="text-sm text-gray-500">{item.uploadedByEmail}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* Allow marketing, manager, sales, and admin users to edit */}
                          <button
                            onClick={() => handleEdit(item)}
                            className={`p-2.5 rounded-lg transition-all duration-200 ${['marketing', 'manager', 'sales', 'admin'].includes(userRole) ? 'text-blue-600 hover:bg-blue-100 hover:scale-105' : 'text-gray-400 cursor-not-allowed'}`}
                            disabled={!['marketing', 'manager', 'sales', 'admin'].includes(userRole)}
                            title={['marketing', 'manager', 'sales', 'admin'].includes(userRole) ? "Edit" : "Only authorized users can edit"}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Only admin users can delete */}
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteClick(item._id)}
                              className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105"
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-4">
                <div className="text-sm text-gray-700 font-medium">
                  Showing <span className="font-bold text-blue-600">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
                  <span className="font-bold text-blue-600">
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>{' '}
                  of <span className="font-bold text-purple-600">{totalItems}</span> results
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      const newPage = Math.max(1, currentPage - 1);
                      setCurrentPage(newPage);
                      fetchSocialMediaData(newPage);
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'}`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            fetchSocialMediaData(pageNum);
                          }}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === pageNum ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-blue-300'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => {
                      const newPage = Math.min(totalPages, currentPage + 1);
                      setCurrentPage(newPage);
                      fetchSocialMediaData(newPage);
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg'}`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
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