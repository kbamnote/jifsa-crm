import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { addImgOrDocs, getImgOrDocs, deleteImgOrDocs } from '../../utils/Api';
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import { FileText, Image, Download, File } from 'lucide-react';

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gallery & Documents</h1>

      {/* Upload Form */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload Image/Document</h2>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Upload
          </button>
        </form>
      </div>

      {/* Gallery Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>

        {loading ? (
          <div className="text-center py-8">Loading files...</div>
        ) : images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No files found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image._id}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative pb-[100%] bg-gray-50">
                  {isImageFile(image.imageUrl) ? (
                    <img
                      src={image.imageUrl}
                      alt={image.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      {getFileIcon(image.imageUrl)}
                      <span className="mt-2 text-sm text-center text-gray-600 truncate w-full">
                        {image.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{image.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded by: {image.createdBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    Role: {image.creatorRole}
                  </p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(image.imageUrl, image.name)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(image._id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
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
    </div>
  );
};

export default ImgAndFiles;
