import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { addImgOrDocs } from '../utils/Api';
import Cookies from 'js-cookie';

const AddFileModal = ({ showModal, setShowModal, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    productCompany: 'JIFSA',
    image: null
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = Cookies.get("role") || "";
  const userName = Cookies.get("name") || "";
  const userEmail = Cookies.get("email") || "";

  const productCompanyOptions = [
    { value: 'JIFSA', label: 'JIFSA' },
    { value: 'Elite-BIM', label: 'Elite BIM' },
    { value: 'Elite-BIFS', label: 'Elite BIFS' },
    { value: 'EEE-Technologies', label: 'EEE Technologies' },
    { value: 'Elite-Jobs', label: 'Elite Jobs' },
    { value: 'Elite-Cards', label: 'Elite Cards' },
    { value: 'Elite-Management', label: 'Elite Management' },
    { value: 'Elite-Associate', label: 'Elite Associate' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setUploadedFileName(file.name);
      
      // Auto-fill name if empty
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: file.name.split('.')[0]
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Please select a file to upload');
      return;
    }

    if (!formData.name) {
      alert('Please enter a name for the file');
      return;
    }

    setIsSubmitting(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('image', formData.image);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('productCompany', formData.productCompany);
    formDataToSend.append('createdBy', userName);
    formDataToSend.append('creatorEmail', userEmail);
    formDataToSend.append('creatorRole', userRole);

    try {
      await addImgOrDocs(formDataToSend);
      
      setFormData({
        name: '',
        productCompany: 'JIFSA',
        image: null
      });
      setUploadedFileName('');
      setShowModal(false);
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.message || 'Failed to upload file');
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
            Add New File
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* File Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name for the file"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Product/Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Category
                </label>
                <select
                  name="productCompany"
                  value={formData.productCompany}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {productCompanyOptions.map(company => (
                    <option key={company.value} value={company.value}>{company.label}</option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Images, PDF, Word, Excel, PowerPoint</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  {uploadedFileName && (
                    <div className="text-sm text-gray-600">
                      Selected: {uploadedFileName}
                    </div>
                  )}
                </div>
              </div>
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
                {isSubmitting ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFileModal;