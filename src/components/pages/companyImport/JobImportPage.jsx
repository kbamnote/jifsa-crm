import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, FileSpreadsheet, Briefcase, Search, Filter, Trash2, Edit, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getAllCompanies, deleteAllCompanies, deleteCompany, updateCompany } from "../../utils/Api";
import { getUserRole, isAdmin } from "../../utils/AuthUtils";
import axios from "axios";
import DeleteConfirmationModal from "../../modal/DeleteConfirmationModal";
import SuccessModal from "../../modal/SuccessModal";
import ErrorModal from "../../modal/ErrorModal";

const JobImportPage = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteSingleModal, setShowDeleteSingleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  const [editingJobId, setEditingJobId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  const userRole = getUserRole();

  useEffect(() => {
    fetchJobListings();
  }, []);

  useEffect(() => {
    let result = [...jobListings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job =>
        (job['Job Title'] && job['Job Title'].toLowerCase().includes(term)) ||
        (job['Company Name'] && job['Company Name'].toLowerCase().includes(term)) ||
        (job['Category'] && job['Category'].toLowerCase().includes(term)) ||
        (job['Location'] && job['Location'].toLowerCase().includes(term))
      );
    }

    if (categoryFilter) {
      result = result.filter(job => job['Category'] === categoryFilter);
    }

    if (locationFilter) {
      result = result.filter(job =>
        job['Location'] && job['Location'].toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (experienceFilter) {
      result = result.filter(job => job['Experience Level'] === experienceFilter);
    }

    setFilteredJobListings(result);
    setCurrentPage(1);
  }, [jobListings, searchTerm, categoryFilter, locationFilter, experienceFilter]);

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

  const fetchJobListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllCompanies();
      
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setExcelFile(file);
      setError("");
    }
  };

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
            console.log("Standard JSON parsing failed, attempting to handle special format...");
            let cleanedData = rawData.trim();
            
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

          const companiesData = Array.isArray(jsonData)
            ? jsonData
            : (jsonData.companies && Array.isArray(jsonData.companies)
              ? jsonData.companies
              : [jsonData]);
          
          resolve(companiesData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

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

  const handleUploadAndSync = async () => {
    if (!excelFile) {
      setError("Please select a JSON file first");
      setShowErrorModal(true);
      return;
    }

    try {
      setError("");
      
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

  const handleEditJob = (job) => {
    setEditingJobId(job._id);
    setEditFormData({ ...job });
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setEditFormData({});
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  const getStatusClass = () => {
    switch (status) {
      case "syncing": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "syncing": return "Syncing...";
      case "completed": return "Completed";
      case "error": return "Error";
      default: return "Idle";
    }
  };

  const getColumnConfig = () => {
    return [
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
  };

  const getNestedValue = (obj, path) => {
    if (!obj) return 'N/A';
    
    if (path === 'createdAt') {
      return obj[path] ? new Date(obj[path]).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }) : 'N/A';
    }

    const hasNestedStructure = obj.title !== undefined && obj.company !== undefined && typeof obj.company === 'object';

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
          if (current === null || current === undefined) return 'N/A';
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-8 h-8" />
            Job Import
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass()}`}>
              Status: {getStatusText()}
            </span>
            <span className="text-sm text-gray-600">
              Last Synced: {formatDate(lastSynced)}
            </span>
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={showDeleteAllModal}
          onClose={() => setShowDeleteAllModal(false)}
          onConfirm={handleDeleteAllData}
          itemName="all job listings"
        />
        
        <DeleteConfirmationModal
          isOpen={showDeleteSingleModal}
          onClose={() => {
            setShowDeleteSingleModal(false);
            setSelectedJobId(null);
          }}
          onConfirm={() => handleDeleteSingleJob(selectedJobId)}
          itemName="this job listing"
        />
        
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={success}
        />
        
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={error}
        />

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Job Data</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Select JSON File (.json)
              </span>
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">JSON files only</p>
          </div>

          {excelFile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Selected: {excelFile.name}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleUploadAndSync}
            disabled={!excelFile || status === "syncing"}
            className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {status === "syncing" ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing & Syncing...
              </>
            ) : (
              "Upload & Sync"
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {getUniqueLocations().map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {getUniqueExperienceLevels().map((level, index) => (
                  <option key={index} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("");
              setLocationFilter("");
              setExperienceFilter("");
            }}
            className="w-full mt-4 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>

          {filteredJobListings.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(filteredJobListings.length / itemsPerPage)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredJobListings.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredJobListings.length / itemsPerPage)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === Math.ceil(filteredJobListings.length / itemsPerPage)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          {isAdmin() && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              disabled={loading}
              className="flex items-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Data
            </button>
          )}
          <button
            onClick={fetchJobListings}
            disabled={loading}
            className="flex items-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Table
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Job Listings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredJobListings.length)} of {filteredJobListings.length} job listings
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredJobListings.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job listings</h3>
              <p className="text-gray-600">Get started by uploading a JSON file with job listings.</p>
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
                  {filteredJobListings
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((listing) => (
                      <tr key={listing._id}>
                        {editingJobId === listing._id ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {listing._id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="Job Title"
                                value={editFormData['Job Title'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="Company Name"
                                value={editFormData['Company Name'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="Location"
                                value={editFormData['Location'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                name="Status"
                                value={editFormData['Status'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Pending">Pending</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="Experience Level"
                                value={editFormData['Experience Level'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="Category"
                                value={editFormData['Category'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="Salary Min (₹)"
                                value={editFormData['Salary Min (₹)'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="Salary Max (₹)"
                                value={editFormData['Salary Max (₹)'] || ''}
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            {getColumnConfig().slice(8).map((column) => (
                              <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getNestedValue(listing, column.key)}
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={handleSaveEdit}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            {getColumnConfig().map((column) => (
                              <td
                                key={column.key}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              >
                                {column.key === 'createdAt'
                                  ? (listing[column.key] ? new Date(listing[column.key]).toLocaleDateString('en-IN', {
                                                                          day: 'numeric',
                                                                          month: 'short',
                                                                          year: 'numeric',
                                                                        }) : 'N/A')
                                  : getNestedValue(listing, column.key)}
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleEditJob(listing)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              {isAdmin() && (
                                <button
                                  onClick={() => {
                                    setSelectedJobId(listing._id);
                                    setShowDeleteSingleModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
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

export default JobImportPage;