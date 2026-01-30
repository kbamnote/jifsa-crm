import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Bell, Upload, Eye, FileText, Folder, Plus } from 'lucide-react';
import { getPaymentCategories } from '../utils/Api';

const UpdatePaymentDetailModal = ({ isOpen, onClose, onSave, paymentDetail }) => {
  const [formData, setFormData] = useState({
    name: "",
    details: "",
    startDate: "",
    endDate: "",
    amount: "",
    currency: "INR",
    billingType: "one-time",
    status: "pending",
    category: "",
    uploadImg: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
    
    if (paymentDetail && isOpen) {
      setFormData({
        name: paymentDetail.name || "",
        details: paymentDetail.details || "",
        startDate: paymentDetail.startDate ? new Date(paymentDetail.startDate).toISOString().split('T')[0] : "",
        endDate: paymentDetail.endDate ? new Date(paymentDetail.endDate).toISOString().split('T')[0] : "",
        amount: paymentDetail.amount || "",
        currency: paymentDetail.currency || "INR",
        billingType: paymentDetail.billingType || "one-time",
        status: paymentDetail.status || "pending",
        category: paymentDetail.category || "",
        uploadImg: paymentDetail.uploadImg || null,
      });
      if (paymentDetail.uploadImg) {
        setPreviewUrl(paymentDetail.uploadImg);
      }
    } else {
      setFormData({
        name: "",
        details: "",
        startDate: "",
        endDate: "",
        amount: "",
        currency: "INR",
        billingType: "one-time",
        status: "pending",
        category: "",
        uploadImg: null,
      });
      setPreviewUrl(null);
    }
    setErrors({});
    setShowNewCategoryInput(false);
  }, [paymentDetail, isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await getPaymentCategories();
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      setPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Billing name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      if (formData.details) fd.append("details", formData.details);
      if (formData.startDate) fd.append("startDate", formData.startDate);
      if (formData.endDate) fd.append("endDate", formData.endDate);
      if (formData.amount) fd.append("amount", formData.amount);
      fd.append("currency", formData.currency);
      fd.append("billingType", formData.billingType);
      fd.append("status", formData.status);
      if (formData.category) fd.append("category", formData.category);
      if (formData.uploadImg && typeof formData.uploadImg !== 'string') {
        fd.append("uploadImg", formData.uploadImg);
      }

      await onSave(paymentDetail._id, fd);
      onClose();
    } catch (error) {
      console.error('Error updating payment detail:', error);
      // More detailed error handling
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || 'Failed to update payment detail';
        console.error('Server error:', errorMessage);
        // You could set an error state here to display to user
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received from server');
      } else {
        // Something else happened
        console.error('Error setting up request:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPDF = (url) => url?.toLowerCase().endsWith('.pdf');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-2xl font-bold text-gray-800">
            Update Billing Record
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Billing Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Service Fee, Subscription, Annual License"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Billing Type
              </label>
              <select
                name="billingType"
                value={formData.billingType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              >
                <option value="one-time">One-time Payment</option>
                <option value="monthly">Monthly Billing</option>
                <option value="yearly">Yearly Billing</option>
                <option value="quarterly">Quarterly Billing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00 (optional)"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>
            

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category/Folder
              </label>
              <div className="space-y-2">
                {!showNewCategoryInput ? (
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                    >
                      <option value="">Select existing category or create new</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      name="category"
                      placeholder="Enter new category name"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-10 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                      autoFocus
                    />
                    <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    if (showNewCategoryInput) {
                      // Cancel creating new category
                      setFormData(prev => ({ ...prev, category: '' }));
                      setShowNewCategoryInput(false);
                    } else {
                      // Start creating new category
                      setShowNewCategoryInput(true);
                      setFormData(prev => ({ ...prev, category: '' }));
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${showNewCategoryInput ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  {showNewCategoryInput ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create New Category
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Details
              </label>
              <input
                type="text"
                name="details"
                placeholder="Additional information (optional)"
                value={formData.details}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Update Document (Image or PDF) (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                name="uploadImg"
                accept="image/*,.pdf"
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white file:font-semibold hover:file:opacity-90 shadow-sm"
              />
            </div>
            {previewUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview:
                </p>
                {isPDF(previewUrl) ? (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-700">PDF Document Preview</span>
                  </div>
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg shadow-sm" />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                'Update Billing Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePaymentDetailModal;