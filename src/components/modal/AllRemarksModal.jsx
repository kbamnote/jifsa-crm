import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

const AllRemarksModal = ({ showModal, setShowModal, lead, allRemarks = [], onSubmit, onCancel }) => {
  const [newRemarkForm, setNewRemarkForm] = useState({
    status: '',
    message: '',
    reminderDate: '',
    reminderTime: ''
  });

  const [errors, setErrors] = useState({});

  if (!showModal) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Helper function to get user name based on the ID
  const getUserName = (userIdObj) => {
    // If userIdObj is a string (ObjectId), it represents the user ID
    if (typeof userIdObj === 'string') {
      // Try to find the user info from the lead's assigned data as fallback
      if (lead?.assignedBy && typeof lead.assignedBy === 'object') {
        if (lead.assignedBy.name) {
          return lead.assignedBy.name;
        } else if (lead.assignedBy.email) {
          return lead.assignedBy.email;
        }
      }
      if (lead?.assignedTo && typeof lead.assignedTo === 'object') {
        if (lead.assignedTo.name) {
          return lead.assignedTo.name;
        } else if (lead.assignedTo.email) {
          return lead.assignedTo.email;
        }
      }
      return 'User';
    }
    
    // If userIdObj is an object with name/email
    if (typeof userIdObj === 'object' && userIdObj.name) {
      return userIdObj.name;
    }
    
    if (typeof userIdObj === 'object' && userIdObj.email) {
      return userIdObj.email;
    }
    
    return 'System';
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      interested: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      confirm_selected: 'bg-blue-100 text-blue-800',
      need_more_info: 'bg-purple-100 text-purple-800',
      callback_scheduled: 'bg-indigo-100 text-indigo-800',
      not_reachable: 'bg-gray-100 text-gray-800',
      meeting_scheduled: 'bg-cyan-100 text-cyan-800',
      quote_sent: 'bg-orange-100 text-orange-800'
    };
    
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  const getConversationStatus = () => {
    if (!allRemarks || allRemarks.length === 0) return null;
    
    const lastRemark = allRemarks[allRemarks.length - 1];
    const isClosed = lastRemark.status === 'rejected' || lastRemark.status === 'confirm_selected';
    
    return isClosed ? 'Closed' : 'Active';
  };

  const getConversationDates = () => {
    if (!allRemarks || allRemarks.length === 0) return null;
    
    const sortedRemarks = [...allRemarks].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const startDate = sortedRemarks[0].createdAt;
    const lastRemark = sortedRemarks[sortedRemarks.length - 1];
    const endDate = (lastRemark.status === 'rejected' || lastRemark.status === 'confirm_selected') 
      ? lastRemark.createdAt 
      : null;
    
    return { startDate, endDate };
  };

  const conversationDates = getConversationDates();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRemarkForm(prev => ({
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
    
    if (!newRemarkForm.status) {
      newErrors.status = 'Status is required';
    }
    
    if (!newRemarkForm.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (newRemarkForm.reminderDate && !newRemarkForm.reminderTime) {
      newErrors.reminderTime = 'Reminder time is required when date is set';
    }
    
    if (newRemarkForm.reminderTime && !newRemarkForm.reminderDate) {
      newErrors.reminderDate = 'Reminder date is required when time is set';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRemark = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Combine date and time if both are provided
      let fullReminderDate = null;
      if (newRemarkForm.reminderDate && newRemarkForm.reminderTime) {
        // Create a new Date object combining the date and time
        fullReminderDate = new Date(`${newRemarkForm.reminderDate}T${newRemarkForm.reminderTime}`);
      } else if (newRemarkForm.reminderDate) {
        // If only date is provided, use the date at midnight
        fullReminderDate = new Date(newRemarkForm.reminderDate);
      }
      
      const remarkData = {
        message: newRemarkForm.message,
        status: newRemarkForm.status,
        reminderDate: fullReminderDate,
        leadId: lead._id
      };
      
      // Call the onSubmit function passed from parent component
      if (onSubmit) {
        await onSubmit(remarkData);
      }
      
      // Reset the form
      setNewRemarkForm({
        status: '',
        message: '',
        reminderDate: '',
        reminderTime: ''
      });
    }
  };

  const handleCancel = () => {
    // Reset the form and close the modal
    setNewRemarkForm({
      status: '',
      message: '',
      reminderDate: '',
      reminderTime: ''
    });
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            All Remarks for {lead?.leadName || 'Lead'}
          </h3>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              getConversationStatus() === 'Closed' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {getConversationStatus()}
            </span>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {conversationDates && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Conversation Started:</span>
                  <p className="text-gray-900">{formatDate(conversationDates.startDate)}</p>
                </div>
                {conversationDates.endDate && (
                  <div>
                    <span className="font-medium text-gray-700">Conversation Closed:</span>
                    <p className="text-gray-900">{formatDate(conversationDates.endDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {allRemarks && allRemarks.length > 0 ? (
            <div className="space-y-4">
              {[...allRemarks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((remark, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(remark.status)}`}>
                        {remark.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getUserName(remark.createdBy)} • {formatDate(remark.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-2">{remark.message}</p>
                  
                  {remark.reminderDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Reminder:</span>
                      <span>{formatDateTime(remark.reminderDate)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No remarks found for this lead.</p>
            </div>
          )}
          
          {/* New remark form */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Add New Remark</h4>
            <form onSubmit={handleAddRemark} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={newRemarkForm.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
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
                  value={newRemarkForm.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter conversation details..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
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
                      value={newRemarkForm.reminderDate}
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
                      value={newRemarkForm.reminderTime}
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
                  onClick={handleCancel}
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
    </div>
  );
};

export default AllRemarksModal;