import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download, Search, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  getInternApplications, 
  createInternApplication, 
  updateInternApplication, 
  deleteInternApplication 
} from '../../utils/Api';
import AddInternAppliedDataModal from '../../modal/AddInternAppliedDataModal';
import UpdateInternAppliedDataModal from '../../modal/UpdateInternAppliedDataModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import SuccessModal from '../../modal/SuccessModal';

const InternAppliedDataPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    phoneNo1: '',
    postAppliedFor: ''
  });

  // Fetch applications
  const fetchApplications = async (page = 1) => {
    try {
      setLoading(true);
      
      const filterParams = {
        ...filters,
        search: searchTerm || undefined
      };
      
      const response = await getInternApplications(page, itemsPerPage, filterParams);
      
      if (response.data.success) {
        setApplications(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
        setCurrentPage(response.data.currentPage || page);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage);
  }, [currentPage, itemsPerPage, filters, searchTerm]);

  const handleCreateSuccess = (newApplication) => {
    setApplications(prev => [newApplication, ...prev]);
    setShowAddModal(false);
    setSuccessMessage('Intern application created successfully!');
    setShowSuccessModal(true);
  };

  const handleUpdateSuccess = (updatedApplication) => {
    setApplications(prev => 
      prev.map(app => app._id === updatedApplication._id ? updatedApplication : app)
    );
    setShowUpdateModal(false);
    setSuccessMessage('Intern application updated successfully!');
    setShowSuccessModal(true);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteInternApplication(itemToDelete);
      setApplications(prev => prev.filter(app => app._id !== itemToDelete));
      setSuccessMessage('Intern application deleted successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || 'Failed to delete application');
      console.error('Error deleting application:', err);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (application) => {
    setItemToEdit(application);
    setShowUpdateModal(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      fullName: '',
      email: '',
      phoneNo1: '',
      postAppliedFor: '',
      productCompany: '' // Added productCompany to clear filters
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length + (searchTerm ? 1 : 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Header */}
            <div className="mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            
            {/* Search and Add Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            
            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="h-12 bg-gray-200"></div>
              <div className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100"></div>
                ))}
              </div>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Intern Applications
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2">
                Manage intern applications and track candidates
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Add Application</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or post..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 text-sm"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"> {/* Updated grid columns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={filters.fullName}
              onChange={(e) => handleFilterChange('fullName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Filter by name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="text"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Filter by email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={filters.phoneNo1}
              onChange={(e) => handleFilterChange('phoneNo1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Filter by phone"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post Applied For</label>
            <input
              type="text"
              value={filters.postAppliedFor}
              onChange={(e) => handleFilterChange('postAppliedFor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Filter by post"
            />
          </div>
          
          {/* Product Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <select
              value={filters.productCompany}
              onChange={(e) => handleFilterChange('productCompany', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">All Companies</option>
              <option value="Elite-Associate">Elite Associate</option>
              <option value="JIFSA">JIFSA</option>
              <option value="Elite-BIM">Elite BIM</option>
              <option value="Elite-BIFS">Elite BIFS</option>
              <option value="EEE-Technologies">EEE Technologies</option>
              <option value="Elite-Jobs">Elite Jobs</option>
              <option value="Elite-Cards">Elite Cards</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Phone 1</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Phone 2</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Post Applied</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Resume</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date Applied</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
                        <p className="text-gray-500">Get started by adding a new intern application</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {application.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {application.phoneNo1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {application.phoneNo2 || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {application.postAppliedFor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {application.productCompany}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {application.resumeUrl ? (
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        ) : (
                          <span className="text-gray-400">No resume</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {application.photoUrl ? (
                          <a
                            href={application.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">No photo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.status === 'unread' ? 'bg-gray-100 text-gray-800' :
                          application.status === 'read' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'interview_scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'interview_completed' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'selected' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(application)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-100"
                            title="Edit Application"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(application._id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-700 font-medium mb-4 sm:mb-0">
                Showing <span className="font-bold text-blue-600">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
                <span className="font-bold text-blue-600">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-bold text-purple-600">{totalItems}</span> results
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);
                  }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    currentPage === 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === pageNum 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(newPage);
                  }}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    currentPage === totalPages 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <AddInternAppliedDataModal
          showModal={showAddModal}
          setShowModal={setShowAddModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Update Application Modal */}
      {showUpdateModal && itemToEdit && (
        <UpdateInternAppliedDataModal
          showModal={showUpdateModal}
          setShowModal={setShowUpdateModal}
          itemToEdit={itemToEdit}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          onConfirm={confirmDelete}
          itemName="intern application"
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          showModal={showSuccessModal}
          setShowModal={setShowSuccessModal}
          message={successMessage}
        />
      )}
    </div>
  );
};

export default InternAppliedDataPage;