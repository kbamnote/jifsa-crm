import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { addImgOrDocs, getImgOrDocs, deleteImgOrDocs, shareImage } from '../../utils/Api';
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import MailModal from '../../modal/MailModal';
import { FileText, Image, Download, File, Share2, X } from 'lucide-react';

const ImgAndFiles = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Image preview modal states
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Mail modal states
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailAttachment, setMailAttachment] = useState(null);
  const [imageToShare, setImageToShare] = useState(null);

  useEffect(() => {
    const role = Cookies.get('role');
    setUserRole(role || '');
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await getImgOrDocs();
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleNameChange = (e) => {
    setFileName(e.target.value);
  };

  // ✅ Detect file type from URL instead of name
  const isImageFile = (fileUrl) => {
    if (!fileUrl) return false;
    const extension = fileUrl.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
  };

  // ✅ Return icon based on URL file extension
  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <File className="w-8 h-8 text-gray-500" />;
    const extension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (['pdf'].includes(extension)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !fileName) {
      alert('Please provide both file and name');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', fileName);
      formData.append('image', selectedFile);

      const response = await addImgOrDocs(formData);
      if (response.data.success) {
        setSuccessMessage('File uploaded successfully');
        setShowSuccessModal(true);
        setSelectedFile(null);
        setFileName('');
        fetchImages(); // Refresh the image list
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const handleDelete = (id) => {
    if (userRole !== 'admin') {
      alert('Only admin users can delete files');
      return;
    }
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await deleteImgOrDocs(itemToDelete);
      if (response.data.success) {
        setSuccessMessage('File deleted successfully');
        setShowSuccessModal(true);
        fetchImages(); // Refresh the image list
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
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
                      {userRole === 'admin' && (
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