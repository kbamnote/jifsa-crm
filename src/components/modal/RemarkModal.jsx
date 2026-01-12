import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

const RemarkModal = ({ 
  showModal, 
  setShowModal, 
  lead, 
  onSubmit, 
  onCancel,
  allRemarks = [] 
}) => {
  const [formData, setFormData] = useState({
    status: '',
    message: '',
    reminderDate: '',
    reminderTime: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (showModal) {
      // Reset form when modal opens
      setFormData({
        status: '',
        message: '',
        reminderDate: '',
        reminderTime: ''
      });
      setErrors({});
    }
  }, [showModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (formData.reminderDate && !formData.reminderTime) {
      newErrors.reminderTime = 'Reminder time is required when date is set';
    }
    
    if (formData.reminderTime && !formData.reminderDate) {
      newErrors.reminderDate = 'Reminder date is required when time is set';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Combine date and time if both are provided
      let fullReminderDate = null;
      if (formData.reminderDate && formData.reminderTime) {
        // Create a new Date object combining the date and time
        fullReminderDate = new Date(`${formData.reminderDate}T${formData.reminderTime}`);
      } else if (formData.reminderDate) {
        // If only date is provided, use the date at midnight
        fullReminderDate = new Date(formData.reminderDate);
      }
      
      const remarkData = {
        message: formData.message,
        status: formData.status,
        reminderDate: fullReminderDate,
        leadId: lead._id
      };
      
      onSubmit(remarkData);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Add Remark for {lead?.leadName || 'Lead'}</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="interested">Interested</option>
                <option value="rejected">Rejected</option>
                <option value="confirm_selected">Confirm Selected</option>
                <option value="need_more_info">Need More Info</option>
                <option value="callback_scheduled">Callback Scheduled</option>
                <option value="not_reachable">Not Reachable</option>
                <option value="meeting_scheduled">Meeting Scheduled</option>
                <option value="quote_sent">Quote Sent</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter conversation details..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="reminderDate"
                    value={formData.reminderDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.reminderDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.reminderDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.reminderDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="reminderTime"
                    value={formData.reminderTime}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.reminderTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.reminderTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.reminderTime}</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Remark
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RemarkModal;