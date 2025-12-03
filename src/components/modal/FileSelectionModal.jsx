import React, { useState, useEffect } from 'react';
import { X, Image, FileText } from 'lucide-react';
import { getImgOrDocs } from '../utils/Api';

const FileSelectionModal = ({ onClose, onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await getImgOrDocs();
      setFiles(response.data.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
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
          <FileText className="w-8 h-8 text-red-600" />
        </div>
      );
    } else if (url.includes('.doc') || url.includes('.docx')) {
      return (
        <div className="bg-blue-100 p-3 rounded-lg">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
      );
    } else {
      return (
        <div className="bg-gray-100 p-3 rounded-lg">
          <FileText className="w-8 h-8 text-gray-600" />
        </div>
      );
    }
  };

  const handleSelect = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            Select File to Attach
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6">
            {/* Files Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Available Files</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading files...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No files found
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <div
                      key={file._id}
                      className={`border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer ${
                        selectedFile && selectedFile._id === file._id 
                          ? 'ring-2 ring-blue-500 border-blue-500' 
                          : ''
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="relative pb-[75%] bg-gray-50">
                        {isImageFile(file.imageUrl) ? (
                          <img
                            src={file.imageUrl}
                            alt={file.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                            {getFileIcon(file.imageUrl)}
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-grow flex flex-col">
                        <h3 className="font-semibold text-gray-800 truncate text-sm">
                          {file.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected File Preview */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Selected File</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isImageFile(selectedFile.imageUrl) ? (
                      <img
                        src={selectedFile.imageUrl}
                        alt={selectedFile.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getFileIcon(selectedFile.imageUrl)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedFile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSelect}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Attach File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          {!selectedFile && (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Attach File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSelectionModal;