import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';

const AddSeoModal = ({ isOpen, onClose, onSave, editingItem, title }) => {
  const [formData, setFormData] = useState({
    productCompany: '',
    submissionEntity: '',
    count: '',
    date: '',
    links: ['']
  });
  const [errors, setErrors] = useState({});

  const productCompanyOptions = [
    'JIFSA', 
    'Elite-BIM', 
    'Elite-BIFS', 
    'EEE-Technologies', 
    'Elite-Jobs', 
    'Elite-Cards', 
    'Elite-Associate', 
    'Elite-Properties', 
    'Elite-Paisa', 
    'Elite-Management'
  ];

  const submissionEntityOptions = [
    'Bookmarking Submission',
    'Blog Submission',
    'Social sharing submission',
    'Ping submission',
    'Mind Map submission',
    'Profile submission'
  ];

  useEffect(() => {
    if (editingItem) {
      setFormData({
        productCompany: editingItem.productCompany || '',
        submissionEntity: editingItem.submissionEntity || '',
        count: editingItem.count || '',
        date: editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : '',
        links: editingItem.links && editingItem.links.length > 0 ? [...editingItem.links] : ['']
      });
    } else {
      setFormData({
        productCompany: '',
        submissionEntity: '',
        count: '',
        date: '',
        links: ['']
      });
    }
  }, [editingItem, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    setFormData(prev => ({
      ...prev,
      links: newLinks
    }));
  };

  const addLinkField = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
  };

  const removeLinkField = (index) => {
    if (formData.links.length > 1) {
      const newLinks = formData.links.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        links: newLinks
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productCompany) newErrors.productCompany = 'Product Company is required';
    if (!formData.submissionEntity) newErrors.submissionEntity = 'Submission Entity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      count: formData.count ? parseInt(formData.count) : undefined,
      date: formData.date || undefined
    };

    onSave(submitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingItem ? 'Edit SEO Entry' : 'Add New SEO Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Company *
              </label>
              <select
                name="productCompany"
                value={formData.productCompany}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.productCompany ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Product Company</option>
                {productCompanyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.productCompany && (
                <p className="text-red-500 text-sm mt-1">{errors.productCompany}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Entity *
              </label>
              <select
                name="submissionEntity"
                value={formData.submissionEntity}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.submissionEntity ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Submission Entity</option>
                {submissionEntityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.submissionEntity && (
                <p className="text-red-500 text-sm mt-1">{errors.submissionEntity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Count
              </label>
              <input
                type="number"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter count"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Links
            </label>
            <div className="space-y-3">
              {formData.links.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter link URL"
                  />
                  {formData.links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLinkField}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link Field</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingItem ? 'Update' : 'Create'} SEO Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSeoModal;