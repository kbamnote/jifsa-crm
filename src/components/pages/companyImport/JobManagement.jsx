import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Search, Filter, RefreshCw, Briefcase } from "lucide-react";
import { getAllCompanies, deleteCompany } from "../../utils/Api";
import { getUserRole, isAdmin } from "../../utils/AuthUtils";
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from "../../modal/DeleteConfirmationModal";
import SuccessModal from "../../modal/SuccessModal";
import ErrorModal from "../../modal/ErrorModal";

const JobManagement = () => {
  const navigate = useNavigate();
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [callStatusFilter, setCallStatusFilter] = useState("");
  const [postedByFilter, setPostedByFilter] = useState("");
  const [collectedByFilter, setCollectedByFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  // Get user role
  const userRole = getUserRole();

  // Fetch job listings from database on component mount
  useEffect(() => {
    fetchJobListings();
  }, []);

  // Apply filters when job listings or filter criteria change
  useEffect(() => {
    let result = [...jobListings];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        (job['Job Title'] && job['Job Title'].toLowerCase().includes(term)) ||
        (job['Company Name'] && job['Company Name'].toLowerCase().includes(term)) ||
        (job['Location'] && job['Location'].toLowerCase().includes(term))
      );
    }
    
    // Apply location filter
    if (locationFilter) {
      result = result.filter(job => 
        job['Location'] && job['Location'].toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(job => job['Status'] === statusFilter);
    }
    
    // Apply call status filter
    if (callStatusFilter) {
      result = result.filter(job => job['Call Status'] === callStatusFilter);
    }
    
    // Apply posted by filter
    if (postedByFilter) {
      result = result.filter(job => 
        job['Posted By'] && job['Posted By'].toLowerCase().includes(postedByFilter.toLowerCase())
      );
    }
    
    // Apply collected by filter
    if (collectedByFilter) {
      result = result.filter(job => 
        job['Collected By'] && job['Collected By'].toLowerCase().includes(collectedByFilter.toLowerCase())
      );
    }
    
    setFilteredJobListings(result);
  }, [jobListings, searchTerm, locationFilter, statusFilter, callStatusFilter, postedByFilter, collectedByFilter]);

  // Get unique filter options
  const getUniqueLocations = () => {
    const locations = jobListings.map(job => job['Location']).filter(Boolean);
    return [...new Set(locations)];
  };

  const getUniqueStatuses = () => {
    const statuses = jobListings.map(job => job['Status']).filter(Boolean);
    return [...new Set(statuses)];
  };

  const getUniqueCallStatuses = () => {
    const callStatuses = jobListings.map(job => job['Call Status']).filter(Boolean);
    return [...new Set(callStatuses)];
  };

  const getUniquePostedBy = () => {
    const postedBy = jobListings.map(job => job['Posted By']).filter(Boolean);
    return [...new Set(postedBy)];
  };

  const getUniqueCollectedBy = () => {
    const collectedBy = jobListings.map(job => job['Collected By']).filter(Boolean);
    return [...new Set(collectedBy)];
  };

  // Fetch job listings from database
  const fetchJobListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllCompanies();
      console.log("Job listings:", response.data.data);
      // Filter out any empty records
      const validJobListings = (response.data.data || []).filter(listing => {
        const keys = Object.keys(listing);
        const meaningfulKeys = keys.filter(key => 
          !['_id', '__v', 'createdAt', 'updatedAt'].includes(key) && 
          listing[key] !== null && 
          listing[key] !== undefined &&
          listing[key] !== ''
        );
        return meaningfulKeys.length > 0;
      });
      
      setJobListings(validJobListings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job listings:", error);
      setError("Failed to fetch job listings: " + (error.response?.data?.message || error.message || "Unknown error"));
      setLoading(false);
    }
  };

  // Handle View Job
  const handleViewJob = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  // Handle Delete Job
  const handleDeleteJob = (jobId) => {
    setSelectedJobId(jobId);
    setShowDeleteModal(true);
  };

  // Confirm Delete Job
  const confirmDeleteJob = async () => {
    if (!selectedJobId) return;
    
    try {
      setLoading(true);
      setError("");
      
      const response = await deleteCompany(selectedJobId);
      
      if (response.data.success) {
        setSuccess("Job listing deleted successfully");
        fetchJobListings();
        setShowDeleteModal(false);
        setSelectedJobId(null);
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || "Failed to delete job listing");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      setError(error.response?.data?.message || error.message || "Failed to delete job listing");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Get column configuration
  const getColumnConfig = () => {
    const importantColumns = [
      { key: 'Job Title', label: 'Job Title' },
      { key: 'Company Name', label: 'Company Name' },
      { key: 'Location', label: 'Location' },
      { key: 'Status', label: 'Status' },
      { key: 'Call Status', label: 'Call Status' }
    ];
    
    return importantColumns;
  };

  // Helper function to get nested property value
  const getNestedValue = (obj, path) => {
    if (!obj) return 'N/A';
    
    if (path === 'createdAt') {
      return obj[path] ? formatDate(obj[path]) : 'N/A';
    }
    
    const hasNestedStructure = obj.title !== undefined && 
                              obj.company !== undefined && 
                              typeof obj.company === 'object';
    
    if (hasNestedStructure) {
      const nestedMap = {
        'Job Title': 'title',
        'Company Name': 'company.name',
        'Location': 'location',
        'Status': 'status',
        'Call Status': 'callStatus'
      };
      
      const nestedPath = nestedMap[path];
      if (!nestedPath) return 'N/A';
      
      if (nestedPath.includes('.')) {
        return nestedPath.split('.').reduce((current, prop) => {
          if (current === null || current === undefined) {
            return 'N/A';
          }
          
          if (prop === 'location' && Array.isArray(current[prop])) {
            return current[prop].join(', ');
          }
          
          return current[prop] !== undefined ? current[prop] : 'N/A';
        }, obj) || 'N/A';
      } else {
        if (nestedPath === 'location' && Array.isArray(obj[nestedPath])) {
          return obj[nestedPath].join(', ');
        }
        return obj[nestedPath] !== undefined ? obj[nestedPath] : 'N/A';
      }
    } else {
      if (path === 'Location' && Array.isArray(obj[path])) {
        return obj[path].join(', ');
      }
      
      return obj[path] !== undefined && obj[path] !== null && obj[path] !== '' ? obj[path] : 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Job Management</h1>
        </div>
        
        {/* Modals */}
        <DeleteConfirmationModal 
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          onConfirm={confirmDeleteJob}
          itemName="this job listing"
        />
        
        <SuccessModal 
          showModal={showSuccessModal}
          setShowModal={setShowSuccessModal}
          message={success}
        />
        
        <ErrorModal 
          showModal={showErrorModal}
          setShowModal={setShowErrorModal}
          message={error}
        />

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {getUniqueLocations().map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {getUniqueStatuses().map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call Status
                </label>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={callStatusFilter}
                  onChange={(e) => setCallStatusFilter(e.target.value)}
                >
                  <option value="">All Call Statuses</option>
                  {getUniqueCallStatuses().map((callStatus, index) => (
                    <option key={index} value={callStatus}>{callStatus}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posted By
                </label>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={postedByFilter}
                  onChange={(e) => setPostedByFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {getUniquePostedBy().map((postedBy, index) => (
                    <option key={index} value={postedBy}>{postedBy}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collected By
                </label>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={collectedByFilter}
                  onChange={(e) => setCollectedByFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {getUniqueCollectedBy().map((collectedBy, index) => (
                    <option key={index} value={collectedBy}>{collectedBy}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("");
                    setStatusFilter("");
                    setCallStatusFilter("");
                    setPostedByFilter("");
                    setCollectedByFilter("");
                  }}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Showing {filteredJobListings.length} of {jobListings.length} job listings
            </p>
          </div>
          <div>
            <button
              onClick={fetchJobListings}
              disabled={loading}
              className="flex items-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Table
            </button>
          </div>
        </div>
        
        {/* Job Listings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Job Listings</h2>
            
            {filteredJobListings.length > 0 && (
              <div className="flex items-center space-x-6">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                
                {/* Pagination controls */}
                {filteredJobListings.length > itemsPerPage && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {Math.ceil(filteredJobListings.length / itemsPerPage)}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredJobListings.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredJobListings.length / itemsPerPage)}
                      className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : filteredJobListings.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job listings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by importing job listings.
              </p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {getColumnConfig().map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJobListings
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((listing) => (
                        <tr key={listing._id} className={(filteredJobListings.indexOf(listing) - (currentPage - 1) * itemsPerPage) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {getColumnConfig().map((column) => (
                            <td key={column.key} className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              <div className="truncate" title={column.key === 'createdAt' 
                                ? (listing[column.key] 
                                    ? formatDate(listing[column.key]) 
                                    : 'N/A')
                                : getNestedValue(listing, column.key)}>
                                {column.key === 'createdAt' 
                                  ? (listing[column.key] 
                                      ? formatDate(listing[column.key]) 
                                      : 'N/A')
                                  : getNestedValue(listing, column.key)}
                              </div>
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewJob(listing._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {isAdmin() && (
                                <button
                                  onClick={() => handleDeleteJob(listing._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;