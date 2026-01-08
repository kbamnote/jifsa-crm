import React, { useState, useRef } from 'react';
import { X, Upload, FileText, FileImage, File } from 'lucide-react';

const ReportModal = ({ 
  showModal, 
  setShowModal, 
  onSubmit, 
  initialData = null,
  isEditMode = false 
}) => {
  const [formData, setFormData] = useState({
    reportField: initialData?.reportField || '',
    linkField: initialData?.linkField || '',
    attendance: {
      date: initialData?.attendance?.date ? new Date(initialData.attendance.date).toISOString().split('T')[0] : '',
      morningTime: initialData?.attendance?.morningTime || '',
      eveningTime: initialData?.attendance?.eveningTime || ''
    }
  });
  
  const [files, setFiles] = useState(initialData?.uploadFiles || []);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('attendance.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        attendance: {
          ...prev.attendance,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const newPreviewFiles = newFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type
    }));
    
    setPreviewFiles(prev => [...prev, ...newPreviewFiles]);
  };

  const removeFile = (indexToRemove) => {
    setPreviewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reportField.trim()) {
      newErrors.reportField = 'Report field is required';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('reportField', formData.reportField);
      formDataToSend.append('linkField', formData.linkField);
      
      // Add attendance data
      formDataToSend.append('attendance[date]', formData.attendance.date);
      formDataToSend.append('attendance[morningTime]', formData.attendance.morningTime);
      formDataToSend.append('attendance[eveningTime]', formData.attendance.eveningTime);

      // Add files
      previewFiles.forEach((previewFile, index) => {
        formDataToSend.append('files', previewFile.file);
      });

      await onSubmit(formDataToSend, initialData?._id);
      resetForm();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reportField: '',
      linkField: '',
      attendance: {
        date: '',
        morningTime: '',
        eveningTime: ''
      }
    });
    setPreviewFiles([]);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  // Clean up object URLs
  React.useEffect(() => {
    return () => {
      previewFiles.forEach(previewFile => {
        if (previewFile.preview) {
          URL.revokeObjectURL(previewFile.preview);
        }
      });
    };
  }, [previewFiles]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? 'Edit Report' : 'Create New Report'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Report Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Field *
            </label>
            <textarea
              name="reportField"
              value={formData.reportField}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.reportField ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="4"
              placeholder="Enter your report details..."
            />
            {errors.reportField && (
              <p className="text-red-500 text-sm mt-1">{errors.reportField}</p>
            )}
          </div>

          {/* Link Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Field
            </label>
            <input
              type="text"
              name="linkField"
              value={formData.linkField}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter link if any..."
            />
          </div>

          {/* Attendance Date - Only show when editing */}
          {isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="attendance.date"
                  value={formData.attendance.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Morning Time
                </label>
                <input
                  type="time"
                  name="attendance.morningTime"
                  value={formData.attendance.morningTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evening Time
                </label>
                <input
                  type="time"
                  name="attendance.eveningTime"
                  value={formData.attendance.eveningTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Files (PDF and Images only)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="font-medium">Click to upload files</span>
                <span className="text-sm text-gray-500">PDF and Images only (Max 5 files)</span>
              </button>
            </div>
          </div>

          {/* Preview Files */}
          {previewFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h3>
              <div className="space-y-2">
                {previewFiles.map((previewFile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      {previewFile.preview ? (
                        <img
                          src={previewFile.preview}
                          alt={previewFile.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          {previewFile.type.startsWith('image/') ? (
                            <FileImage className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      )}
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {previewFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Report' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;