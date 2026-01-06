import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Share2, X, Mail, Plus, Calendar, BarChart3 } from 'lucide-react';
import { getImgOrDocs, addImgOrDocs, deleteImgOrDocs, getImageStats } from '../../utils/Api';
import Cookies from 'js-cookie';
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import MailModal from '../../modal/MailModal';
import AddFileModal from '../../modal/AddFileModal';
import UpdateFileModal from '../../modal/UpdateFileModal';

const ImgAndFiles = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('JIFSA');
  const [productFilter, setProductFilter] = useState('All');
  const [fileTypeFilter, setFileTypeFilter] = useState('All');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailAttachment, setMailAttachment] = useState(null);
  const [imageToShare, setImageToShare] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [stats, setStats] = useState({
    totalImages: 0,
    productCounts: {},
    creatorCounts: {},
    fileTypeCounts: {}
  });
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(null);

  const userRole = Cookies.get("role") || "";
  const userName = Cookies.get("name") || "";
  const userEmail = Cookies.get("email") || "";

  const fetchStats = async () => {
    try {
      const response = await getImageStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchStats();
  }, []);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.download-menu')) {
        setDownloadMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await getImgOrDocs();
      setImages(response.data.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setFileName(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    // Auto-fill name if empty
    if (file && !fileName) {
      setFileName(file.name.split('.')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setSuccessMessage('Please select a file to upload');
      setShowSuccessModal(true);
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('name', fileName);
    formData.append('productCompany', selectedProduct);
    formData.append('createdBy', userName);
    formData.append('creatorEmail', userEmail);
    formData.append('creatorRole', userRole);

    try {
      await addImgOrDocs(formData);
      setSuccessMessage('File uploaded successfully!');
      setShowSuccessModal(true);
      setFileName('');
      setSelectedFile(null);
      e.target.reset();
      fetchImages(); // Refresh the image list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error uploading file:', error);
      setSuccessMessage(error.response?.data?.message || 'Failed to upload file');
      setShowSuccessModal(true);
    }
  };

  const handleDelete = (id) => {
    setImageToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteImgOrDocs(imageToDelete);
      setSuccessMessage('File deleted successfully!');
      setShowSuccessModal(true);
      fetchImages(); // Refresh the image list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting file:', error);
      setSuccessMessage(error.response?.data?.message || 'Failed to delete file');
      setShowSuccessModal(true);
    } finally {
      setShowDeleteModal(false);
      setImageToDelete(null);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowUpdateModal(true);
  };

  const handleDownload = (url, name, format = null) => {
    // Use the specified format or extract from the URL
    const extension = format || url.split('.').pop().split('?')[0].toLowerCase();
    
    // Construct the download filename with the correct extension
    const downloadName = name.includes(extension) ? name : `${name}.${extension}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDownloadMenu = (imageId) => {
    setDownloadMenuOpen(downloadMenuOpen === imageId ? null : imageId);
  };

  const handleDownloadOption = (url, name, format, imageId) => {
    handleDownload(url, name, format);
    setDownloadMenuOpen(null); // Close the menu after download
  };

  // Handle image preview
  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowImagePreview(true);
  };

  // Handle share action
  const handleShare = (image) => {
    setImageToShare(image);
    setMailAttachment({
      name: image.name,
      url: image.imageUrl,
      isImage: isImageFile(image.imageUrl)
    });
    setShowMailModal(true);
  };

  // Helper function to determine if a file is an image
  const isImageFile = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Helper function to determine file type
  const getFileType = (url) => {
    if (isImageFile(url)) return 'Image';
    if (url.includes('.pdf')) return 'PDF';
    if (url.includes('.doc') || url.includes('.docx')) return 'Word';
    if (url.includes('.ppt') || url.includes('.pptx')) return 'PowerPoint';
    if (url.includes('.xls') || url.includes('.xlsx')) return 'Excel';
    return 'Other';
  };

  // Helper function to get appropriate file icon
  const getFileIcon = (url) => {
    if (url.includes('.pdf')) {
      return (
        <div className="bg-red-100 p-3 rounded-lg">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (url.includes('.doc') || url.includes('.docx')) {
      return (
        <div className="bg-blue-100 p-3 rounded-lg">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (url.includes('.ppt') || url.includes('.pptx')) {
      return (
        <div className="bg-orange-100 p-3 rounded-lg">
          <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (url.includes('.xls') || url.includes('.xlsx')) {
      return (
        <div className="bg-green-100 p-3 rounded-lg">
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-100 p-3 rounded-lg">
          <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

          {/* Upload Form */}
          <div className="mb-8 p-4 md:p-6 bg-white rounded-lg shadow-md">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>

          {/* Gallery Section */}
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="border rounded-lg overflow-hidden shadow-md h-48">
                  <div className="bg-gray-200 h-32 w-full"></div>
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">File Management</h1>
          <p className="text-gray-600 mt-1">Manage and organize your files and documents</p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-2">
          <div className="bg-white px-3 py-2 rounded-lg shadow min-w-[80px]">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-800">{stats.totalImages}</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-lg shadow min-w-[80px]">
            <p className="text-xs text-gray-600">Images</p>
            <p className="text-lg font-bold text-blue-600">{stats.fileTypeCounts.Image || 0}</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-lg shadow min-w-[80px]">
            <p className="text-xs text-gray-600">PDF</p>
            <p className="text-lg font-bold text-green-600">{stats.fileTypeCounts.PDF || 0}</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-lg shadow min-w-[80px]">
            <p className="text-xs text-gray-600">Others</p>
            <p className="text-lg font-bold text-purple-600">{stats.fileTypeCounts.Other || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Team Stats Section - Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(stats.creatorCounts).map(([name, count]) => (
            <div key={name} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 truncate">{name}</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Files:</span>
                  <span className="font-medium text-sm">{count}</span>
                </div>
              </div>
            </div>
          ))}
          {Object.keys(stats.creatorCounts).length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No team statistics available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Button */}
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add New</span>
        </button>
      </div>

      {/* Gallery Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Uploaded Files</h2>
        
        {/* Results Counter */}
        {productFilter !== 'All' || fileTypeFilter !== 'All' ? (
          <div className="mb-2 text-sm text-gray-600">
            Showing {images.filter(image => {
              // Apply product filter
              if (productFilter !== 'All' && image.productCompany !== productFilter) {
                return false;
              }
              // Apply file type filter
              if (fileTypeFilter !== 'All' && getFileType(image.imageUrl) !== fileTypeFilter) {
                return false;
              }
              return true;
            }).length} of {images.length} files
          </div>
        ) : null}
        
        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Product</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Products</option>
                {[...new Set(images.map(img => img.productCompany))]
                  .filter(product => product) // Remove undefined/null values
                  .sort()
                  .map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
              </select>
            </div>
            
            {/* File Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by File Type</label>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All File Types</option>
                <option value="Image">Images</option>
                <option value="PDF">PDF</option>
                <option value="Word">Word</option>
                <option value="PowerPoint">PowerPoint</option>
                <option value="Excel">Excel</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          {(productFilter !== 'All' || fileTypeFilter !== 'All') && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-600 mr-2">Filters applied:</span>
              {productFilter !== 'All' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  Product: {productFilter}
                  <button 
                    onClick={() => setProductFilter('All')}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {fileTypeFilter !== 'All' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Type: {fileTypeFilter}
                  <button 
                    onClick={() => setFileTypeFilter('All')}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                  >
                    ×
                  </button>
                </span>
              )}
              <button 
                onClick={() => {
                  setProductFilter('All');
                  setFileTypeFilter('All');
                }}
                className="ml-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading files...</div>
        ) : images.filter(image => {
          // Apply product filter
          if (productFilter !== 'All' && image.productCompany !== productFilter) {
            return false;
          }
          // Apply file type filter
          if (fileTypeFilter !== 'All' && getFileType(image.imageUrl) !== fileTypeFilter) {
            return false;
          }
          return true;
        }).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {productFilter !== 'All' || fileTypeFilter !== 'All' 
              ? 'No files match the selected filters' 
              : 'No files found'}
          </div>
        ) : (
          <>
            {/* Group images by product */}
            {Object.entries(
              images
                .filter(image => {
                  // Apply product filter
                  if (productFilter !== 'All' && image.productCompany !== productFilter) {
                    return false;
                  }
                  // Apply file type filter
                  if (fileTypeFilter !== 'All' && getFileType(image.imageUrl) !== fileTypeFilter) {
                    return false;
                  }
                  return true;
                })
                .reduce((acc, image) => {
                  const product = image.productCompany || 'Uncategorized';
                  if (!acc[product]) {
                    acc[product] = [];
                  }
                  acc[product].push(image);
                  return acc;
                }, {})
            ).map(([product, productImages]) => (
              <div key={product} className="mb-8">
                <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">{product}</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                  {productImages.map((image) => (
                    <div
                      key={image._id}
                      className="border rounded-lg overflow-visible shadow-md hover:shadow-lg transition-shadow h-full flex flex-col"
                    >
                <div 
                  className="relative pb-[75%] bg-gray-50 cursor-pointer"
                  onClick={() => isImageFile(image.imageUrl) && handleImagePreview(image.imageUrl)}
                >
                  {isImageFile(image.imageUrl) ? (
                    <img
                      src={image.imageUrl}
                      alt={image.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 md:p-4">
                      {getFileIcon(image.imageUrl)}
                      <span className="mt-2 text-xs md:text-sm text-center text-gray-600 truncate w-full px-1">
                        {image.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4 flex-grow flex flex-col">
                  <h3 className="font-semibold text-gray-800 truncate text-sm md:text-base">{image.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    Product: {image.productCompany}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Uploaded by: {image.createdBy}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Role: {image.creatorRole}
                    {image.isSocialMedia && " (Social Media)"}
                  </p>
                  <div className="mt-2 md:mt-3 flex justify-between items-center flex-grow">
                    <span className="text-xs text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-1 md:space-x-2">
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => toggleDownloadMenu(image._id)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Download"
                        >
                          <Download className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        
                       {downloadMenuOpen === image._id && (
                          <div className="absolute z-50 bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-xl ring-1 ring-black ring-opacity-5 download-menu border border-gray-200"
                            style={{ minWidth: '120px' }}>
                            <div className="py-1" role="menu">
                              <button
                                onClick={() => handleDownloadOption(image.imageUrl, image.name, 'png', image._id)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 w-full text-left transition-colors"
                                role="menuitem"
                              >
                                Download as PNG
                              </button>
                              <button
                                onClick={() => handleDownloadOption(image.imageUrl, image.name, 'jpg', image._id)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 w-full text-left transition-colors"
                                role="menuitem"
                              >
                                Download as JPG
                              </button>
                              <button
                                onClick={() => handleDownloadOption(image.imageUrl, image.name, 'pdf', image._id)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 w-full text-left transition-colors"
                                role="menuitem"
                              >
                                Download as PDF
                              </button>
                              <button
                                onClick={() => handleDownloadOption(image.imageUrl, image.name, 'original', image._id)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 w-full text-left transition-colors"
                                role="menuitem"
                              >
                                Download Original
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleShare(image)}
                        className="p-1 text-gray-600 hover:text-green-600"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      {userRole === 'admin' && !image.isSocialMedia && (
                        <>
                          <button
                            onClick={() => handleEdit(image)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(image._id)}
                            className="p-1 text-gray-600 hover:text-red-600"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
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
        itemName="file"
      />

      {/* Image Preview Modal */}
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
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Mail Modal */}
      <MailModal
        showModal={showMailModal}
        setShowModal={setShowMailModal}
        attachmentFile={mailAttachment}
        imageToShare={imageToShare}
      />

      {/* Add File Modal */}
      <AddFileModal
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        onSuccess={() => {
          fetchImages();
          fetchStats();
          setShowAddModal(false);
        }}
      />

      {/* Update File Modal */}
      <UpdateFileModal
        showModal={showUpdateModal}
        setShowModal={setShowUpdateModal}
        itemToEdit={itemToEdit}
        onSuccess={() => {
          fetchImages();
          fetchStats();
          setShowUpdateModal(false);
          setItemToEdit(null);
        }}
      />
    </div>
  );
};

export default ImgAndFiles;