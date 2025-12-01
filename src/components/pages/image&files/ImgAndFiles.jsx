import React, { useState, useEffect } from 'react';
import { Download, Share2, X, Mail } from 'lucide-react';
import { getImgOrDocs, addImgOrDocs, deleteImgOrDocs } from '../../utils/Api';
import Cookies from 'js-cookie';
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import MailModal from '../../modal/MailModal';

const ImgAndFiles = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailAttachment, setMailAttachment] = useState(null);
  const [imageToShare, setImageToShare] = useState(null);

  const userRole = Cookies.get("role") || "";
  const userName = Cookies.get("name") || "";
  const userEmail = Cookies.get("email") || "";

  useEffect(() => {
    fetchImages();
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
    } catch (error) {
      console.error('Error deleting file:', error);
      setSuccessMessage(error.response?.data?.message || 'Failed to delete file');
      setShowSuccessModal(true);
    } finally {
      setShowDeleteModal(false);
      setImageToDelete(null);
    }
  };

  const handleDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gallery & Documents</h1>

      {/* Upload Form */}
      <div className="mb-8 p-4 md:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Upload Image/Document</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={fileName}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name for the file"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              Select File
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Upload
          </button>
        </form>
      </div>

      {/* Gallery Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Gallery</h2>

        {loading ? (
          <div className="text-center py-8">Loading files...</div>
        ) : images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No files found</div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {images.map((image) => (
              <div
                key={image._id}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col"
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
                      <button
                        onClick={() => handleDownload(image.imageUrl, image.name)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button
                        onClick={() => handleShare(image)}
                        className="p-1 text-gray-600 hover:text-green-600"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      {userRole === 'admin' && !image.isSocialMedia && (
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default ImgAndFiles;