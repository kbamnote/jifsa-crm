import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { createSeoEntry, getAllSeoEntries, updateSeoEntry, deleteSeoEntry } from '../../utils/Api';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import AddSeoModal from '../../modal/AddSeoModal';

const Seo = () => {
  const [seoData, setSeoData] = useState([]);
  const [formData, setFormData] = useState({
    productCompany: '',
    submissionEntity: '',
    count: '',
    date: '',
    links: [''] // Initialize with one empty link
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const userRole = Cookies.get('role');
  
  // Options for dropdowns
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
  
  // Fetch SEO data
  const fetchSeoData = async () => {
    try {
      setLoading(true);
      const response = await getAllSeoEntries();
      setSeoData(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch SEO data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSeoData();
  }, []);
  
  // Open add modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };
  
  // Open edit modal
  const handleOpenEditModal = (entry) => {
    setEditingItem(entry);
    setShowAddModal(true);
  };
  
  // Save SEO entry (create or update)
  const handleSaveSeoEntry = async (data) => {
    try {
      let response;
      if (editingItem) {
        response = await updateSeoEntry(editingItem._id, data);
      } else {
        response = await createSeoEntry(data);
      }
      
      setSuccess(response.data.message || (editingItem ? 'SEO entry updated successfully!' : 'SEO entry created successfully!'));
      fetchSeoData(); // Refresh the data
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };
  
  // Show delete confirmation modal
  const handleShowDeleteModal = (id) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };
  
  // Delete an entry
  const handleDelete = async () => {
    try {
      await deleteSeoEntry(deleteItemId);
      setSuccess('SEO entry deleted successfully!');
      setShowDeleteModal(false);
      setDeleteItemId(null);
      fetchSeoData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Delete failed');
      setShowDeleteModal(false);
      setDeleteItemId(null);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      productCompany: '',
      submissionEntity: '',
      count: '',
      date: '',
      links: ['']
    });
    setEditingId(null);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">SEO Management</h1>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal 
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          onConfirm={handleDelete}
          itemName="this SEO entry"
        />
                
        {/* Add/Edit SEO Modal */}
        <AddSeoModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveSeoEntry}
          editingItem={editingItem}
        />
        
        {/* Data Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">SEO Entries</h2>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Add New SEO Entry</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : seoData.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No SEO entries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Company</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Entity</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {seoData.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{entry.productCompany}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{entry.submissionEntity}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{entry.count || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {entry.links && entry.links.length > 0 ? (
                            entry.links.map((link, idx) => (
                              <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block truncate">
                                {link}
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No links</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{entry.createdBy?.name || entry.createdBy?.email || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(entry)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          {(userRole === 'admin') && (
                            <button
                              onClick={() => handleShowDeleteModal(entry._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Seo;