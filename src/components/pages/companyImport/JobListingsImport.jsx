import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, FileSpreadsheet, Briefcase, Search, Filter, Trash2, Edit, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getAllCompanies, deleteAllCompanies, deleteCompany, updateCompany } from "../../utils/Api";
import { getUserRole, isAdmin } from "../../utils/AuthUtils";
import axios from "axios";
import DeleteConfirmationModal from "../../modal/DeleteConfirmationModal";
import SuccessModal from "../../modal/SuccessModal";
import ErrorModal from "../../modal/ErrorModal";

const JobListingsImport = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, syncing, completed, error
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = "";
  
  // Modal states
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteSingleModal, setShowDeleteSingleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  // Edit state
  const [editingJobId, setEditingJobId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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
        (job['Category'] && job['Category'].toLowerCase().includes(term)) ||
        (job['Location'] && job['Location'].toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(job => job['Category'] === categoryFilter);
    }
    
    // Apply location filter
    if (locationFilter) {
      result = result.filter(job => 
        job['Location'] && job['Location'].toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Apply experience filter
    if (experienceFilter) {
      result = result.filter(job => job['Experience Level'] === experienceFilter);
    }
    
    setFilteredJobListings(result);
  }, [jobListings, searchTerm, categoryFilter, locationFilter, experienceFilter]);

  // Get unique filter options
  const getUniqueCategories = () => {
    const categories = jobListings.map(job => job['Category']).filter(Boolean);
    return [...new Set(categories)];
  };

  const getUniqueLocations = () => {
    const locations = jobListings.map(job => job['Location']).filter(Boolean);
    return [...new Set(locations)];
  };

  const getUniqueExperienceLevels = () => {
    const levels = jobListings.map(job => job['Experience Level']).filter(Boolean);
    return [...new Set(levels)];
  };

  // Fetch job listings from database
  const fetchJobListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllCompanies();
      
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

  // Handle JSON file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setExcelFile(file);
      setError("");
    }
  };

  // Convert JSON file to JavaScript object
  const convertJsonFileToObject = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let jsonData;
          let rawData = e.target.result;
          
          try {
            jsonData = JSON.parse(rawData);
          } catch (parseError) {
            // Try to fix special formats
            console.log("Standard JSON parsing failed, attempting to handle special format...");
            
            let cleanedData = rawData.trim();
            
            // Handle multiple JSON objects separated by commas
            if (cleanedData.startsWith('{') && cleanedData.includes('},') && cleanedData.endsWith('}')) {
              cleanedData = '[' + cleanedData.replace(/}\s*,\s*{/g, '},{') + ']';
              console.log("Converted multiple JSON objects to array format");
            }
            
            try {
              jsonData = JSON.parse(cleanedData);
            } catch (cleanParseError) {
              console.error("JSON parsing error details:", {
                errorMessage: parseError.message,
                dataPreview: rawData.substring(0, 200) + "...",
                dataLength: rawData.length
              });
              throw new Error(`Invalid JSON format: ${parseError.message}`);
            }
          }
          
          // Handle different JSON structures
          const companiesData = Array.isArray(jsonData) ? jsonData : 
                              (jsonData.companies && Array.isArray(jsonData.companies) ? jsonData.companies : [jsonData]);
          resolve(companiesData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // Validate company data
  const validateCompanyData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error("Expected an array of company objects");
    }
    
    if (data.length === 0) {
      throw new Error("No company data found in the file");
    }
    
    const requiredFields = ['Job Title', 'Company Name', 'Location'];
    const sampleRecords = data.slice(0, Math.min(3, data.length));
    
    for (let i = 0; i < sampleRecords.length; i++) {
      const record = sampleRecords[i];
      if (typeof record !== 'object' || record === null) {
        throw new Error(`Record ${i+1} is not a valid object`);
      }
    }
    
    return true;
  };

  // Sync data to backend
  const syncJsonData = async (data) => {
    try {
      validateCompanyData(data);
      
      setStatus("syncing");
      setError("");
      
      const tempApi = axios.create({
        baseURL: "https://elite-backend-production.up.railway.app",
      });
      
      const response = await tempApi.post("/companies/import", {
        companies: data
      });
      
      if (response.data.success) {
        setStatus("completed");
        setSuccess(`Successfully imported ${response.data.count} job listings`);
        setLastSynced(new Date());
        fetchJobListings();
        setShowSuccessModal(true);
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to import job listings");
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      setStatus("error");
      setError(error.message || "Failed to import job listings");
      setShowErrorModal(true);
      throw error;
    }
  };

  // Handle Upload & Sync
  const handleUploadAndSync = async () => {
    if (!excelFile) {
      setError("Please select a JSON file first");
      setShowErrorModal(true);
      return;
    }

    try {
      setError("");
      
      // Only handle JSON files now
      if (excelFile.name.endsWith('.json')) {
        const jsonData = await convertJsonFileToObject(excelFile);
        await syncJsonData(jsonData);
      } else {
        throw new Error("Only JSON files are supported. Please upload a .json file.");
      }
    } catch (error) {
      console.error("File processing error:", error);
      setStatus("error");
      setError(`File processing failed: ${error.message || "Unknown error occurred"}`);
      setShowErrorModal(true);
    }
  };

  // Handle Delete All Data (Admin only)
  const handleDeleteAllData = async () => {
    if (!isAdmin()) {
      setError("Only administrators can delete all data");
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await deleteAllCompanies();
      
      if (response.data.success) {
        setSuccess(`Successfully deleted ${response.data.deletedCount} job listings`);
        fetchJobListings();
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || "Failed to delete job listings");
      }
    } catch (error) {
      console.error("Error deleting all data:", error);
      setError(error.response?.data?.message || error.message || "Failed to delete job listings");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setShowDeleteAllModal(false);
    }
  };

  // Handle Delete Single Job (Admin only)
  const handleDeleteSingleJob = async (jobId) => {
    if (!isAdmin()) {
      setError("Only administrators can delete job listings");
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await deleteCompany(jobId);
      
      if (response.data.success) {
        setSuccess("Job listing deleted successfully");
        fetchJobListings();
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
      setShowDeleteSingleModal(false);
      setSelectedJobId(null);
    }
  };

  // Handle Edit Job
  const handleEditJob = (job) => {
    setEditingJobId(job._id);
    // Create a copy of the job data for editing
    setEditFormData({ ...job });
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingJobId(null);
    setEditFormData({});
  };

  // Handle Save Edit
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await updateCompany(editingJobId, editFormData);
      
      if (response.data.success) {
        setSuccess("Job listing updated successfully");
        setEditingJobId(null);
        setEditFormData({});
        fetchJobListings();
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || "Failed to update job listing");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setError(error.response?.data?.message || error.message || "Failed to update job listing");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  // Get status badge class
  const getStatusClass = () => {
    switch (status) {
      case "syncing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case "syncing":
        return "Syncing...";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  };

  // Get column configuration
  const getColumnConfig = () => {
    const importantColumns = [
      { key: '_id', label: 'ID' },
      { key: 'Job Title', label: 'Job Title' },
      { key: 'Company Name', label: 'Company Name' },
      { key: 'Location', label: 'Location' },
      { key: 'Experience Level', label: 'Experience' },
      { key: 'Salary Min (₹)', label: 'Min Salary' },
      { key: 'Salary Max (₹)', label: 'Max Salary' },
      { key: 'Category', label: 'Category' },
      { key: 'Job Type', label: 'Job Type' },
      { key: 'Min Education', label: 'Education' },
      { key: 'Openings', label: 'Openings' },
      { key: 'Notice Period', label: 'Notice Period' },
      { key: 'Work Type', label: 'Work Type' },
      { key: 'Interview Type', label: 'Interview Type' },
      { key: 'Date', label: 'Date' },
      { key: 'Status', label: 'Status' },
      { key: 'Collected By', label: 'Collected By' },
      { key: 'Posted By', label: 'Posted By' },
      { key: 'Feedback', label: 'Feedback' },
      { key: 'createdAt', label: 'Created At' }
    ];
    
    return importantColumns;
  };

  // Helper function to get nested property value
  const getNestedValue = (obj, path) => {
    if (!obj) return 'N/A';
    
    if (path === 'createdAt') {
      return obj[path] ? new Date(obj[path]).toLocaleDateString() : 'N/A';
    }
    
    const hasNestedStructure = obj.title !== undefined && 
                              obj.company !== undefined && 
                              typeof obj.company === 'object';
    
    if (hasNestedStructure) {
      const nestedMap = {
        'Job Title': 'title',
        'Company Name': 'company.name',
        'Location': 'location',
        'Experience Level': 'experienceLevel',
        'Salary Min (₹)': 'salary.min',
        'Salary Max (₹)': 'salary.max',
        'Category': 'category'
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
          <h1 className="text-3xl font-bold text-gray-800">Job Listings</h1>
        </div>
        
        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="font-medium">Last Synced:</span>
            <span className="text-gray-600">{formatDate(lastSynced)}</span>
          </div>
        </div>
        
        {/* Modals */}
        <DeleteConfirmationModal 
          showModal={showDeleteAllModal}
          setShowModal={setShowDeleteAllModal}
          onConfirm={handleDeleteAllData}
          itemName="all job listings"
        />
        
        <DeleteConfirmationModal 
          showModal={showDeleteSingleModal}
          setShowModal={setShowDeleteSingleModal}
          onConfirm={() => handleDeleteSingleJob(selectedJobId)}
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

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Upload className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Upload Job Listings</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select JSON File (.json)
            </label>
            <div className="flex items-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileSpreadsheet className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JSON files only
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {excelFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {excelFile.name}
              </p>
            )}
          </div>
          
          <button
            onClick={handleUploadAndSync}
            disabled={status === "syncing" || !excelFile}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              status === "syncing" || !excelFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "syncing" ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                Processing & Syncing...
              </div>
            ) : (
              "Upload & Sync"
            )}
          </button>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                Category
              </label>
              <select
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
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
                Experience
              </label>
              <select
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <option value="">All Levels</option>
                {getUniqueExperienceLevels().map((level, index) => (
                  <option key={index} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setLocationFilter("");
                  setExperienceFilter("");
                }}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mb-6">
          <div>
            {isAdmin() && (
              <button
                onClick={() => setShowDeleteAllModal(true)}
                disabled={loading}
                className="flex items-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete All Data
              </button>
            )}
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Job Listings</h2>
            <p className="text-gray-600 text-sm mt-1">
              Showing {filteredJobListings.length} of {jobListings.length} job listings
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : filteredJobListings.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job listings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading a JSON file with job listings.
              </p>
            </div>
          ) : (
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
                  {filteredJobListings.map((listing) => (
                    <tr key={listing._id} className={editingJobId === listing._id ? 'bg-blue-50' : (filteredJobListings.indexOf(listing) % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                      {editingJobId === listing._id ? (
                        // Edit mode row
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={getColumnConfig().length}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Job Title</label>
                                <input
                                  type="text"
                                  name="Job Title"
                                  value={editFormData['Job Title'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Company Name</label>
                                <input
                                  type="text"
                                  name="Company Name"
                                  value={editFormData['Company Name'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Location</label>
                                <input
                                  type="text"
                                  name="Location"
                                  value={editFormData['Location'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Status</label>
                                <select
                                  name="Status"
                                  value={editFormData['Status'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                  <option value="">Select Status</option>
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Closed">Closed</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Experience Level</label>
                                <input
                                  type="text"
                                  name="Experience Level"
                                  value={editFormData['Experience Level'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Category</label>
                                <input
                                  type="text"
                                  name="Category"
                                  value={editFormData['Category'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Min Salary</label>
                                <input
                                  type="text"
                                  name="Salary Min (₹)"
                                  value={editFormData['Salary Min (₹)'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Max Salary</label>
                                <input
                                  type="text"
                                  name="Salary Max (₹)"
                                  value={editFormData['Salary Max (₹)'] || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                disabled={loading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={loading}
                                className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View mode row
                        <>
                          {getColumnConfig().map((column) => (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.key === 'createdAt' 
                                ? (listing[column.key] 
                                    ? new Date(listing[column.key]).toLocaleDateString() 
                                    : 'N/A')
                                : getNestedValue(listing, column.key)}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditJob(listing)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {isAdmin() && (
                                <button
                                  onClick={() => {
                                    setSelectedJobId(listing._id);
                                    setShowDeleteSingleModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
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

export default JobListingsImport;