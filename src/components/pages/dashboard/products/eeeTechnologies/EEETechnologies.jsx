import React, { useState, useEffect } from 'react';
import { getDetail, getEnrollments, updateEnrollmentStatus, deleteEnrollment, deleteForm } from '../../../../utils/Api';
import { Search, Users, ChevronLeft, ChevronRight, Eye, Calendar, Mail, Phone, User, GraduationCap, MessageSquare, X, Save } from "lucide-react";
import SuccessModal from '../../../../modal/SuccessModal';
import DeleteConfirmationModal from '../../../../modal/DeleteConfirmationModal';
import ErrorModal from '../../../../modal/ErrorModal';

const EEETechnologies = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Error boundary-like effect
  useEffect(() => {
    const handleError = (error) => {
      console.error('Unhandled error in component:', error);
      setHasError(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
    };
    
    // Add global error listener
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  // If there's an error, show error UI
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => {
              setHasError(false);
              setErrorMessage('');
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  const [enquiryData, setEnquiryData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [activeTab, setActiveTab] = useState("Enquiry"); // Enquiry, Enrollment
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState('');
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Sorting helper
  const sortData = (dataToSort, field, direction) => {
    try {
      return [...dataToSort].sort((a, b) => {
        // Handle cases where a or b might be undefined
        if (!a || !b) return 0;
        
        let aValue = a[field];
        let bValue = b[field];

        if (field === "createdAt") {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return direction === "desc" ? 1 : -1;
        if (bValue == null) return direction === "desc" ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (direction === "desc") {
          if (aValue < bValue) return 1;
          if (aValue > bValue) return -1;
          return 0;
        } else {
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        }
      });
    } catch (error) {
      console.error("Error sorting data:", error);
      return [...dataToSort]; // Return unsorted data if sorting fails
    }
  };

  // API calls - Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enquiryRes, enrollmentRes] = await Promise.all([getDetail(), getEnrollments()]);
        
        console.log("Enquiry response:", enquiryRes);
        console.log("Enrollment response:", enrollmentRes);
        
        // Handle different response structures
        let eeeTechEnquiry = [];
        if (enquiryRes && enquiryRes.data) {
          // Check if it's an array or object with data property
          if (Array.isArray(enquiryRes.data)) {
            eeeTechEnquiry = enquiryRes.data.filter(
              item => item.productCompany === 'EEE-Technologies'
            );
          } else if (enquiryRes.data.data && Array.isArray(enquiryRes.data.data)) {
            eeeTechEnquiry = enquiryRes.data.data.filter(
              item => item.productCompany === 'EEE-Technologies'
            );
          } else if (typeof enquiryRes.data === 'object' && !Array.isArray(enquiryRes.data) && enquiryRes.data.productCompany === 'EEE-Technologies') {
            // If it's an object but not an array, and it matches our criteria, use it as a single item
            eeeTechEnquiry = [enquiryRes.data];
          }
        }
        
        let enrollmentDataResult = [];
        if (enrollmentRes && enrollmentRes.data) {
          // Check if it's an array or object with data property
          if (Array.isArray(enrollmentRes.data)) {
            enrollmentDataResult = enrollmentRes.data;
          } else if (enrollmentRes.data.data && Array.isArray(enrollmentRes.data.data)) {
            enrollmentDataResult = enrollmentRes.data.data;
          } else if (typeof enrollmentRes.data === 'object' && !Array.isArray(enrollmentRes.data)) {
            // If it's an object but not an array, try to use it as is
            enrollmentDataResult = [enrollmentRes.data];
          }
        }
        
        setEnquiryData(eeeTechEnquiry);
        setEnrollmentData(enrollmentDataResult);
        
        // Set initial filtered data based on active tab
        const sorted = sortData(eeeTechEnquiry, "createdAt", "desc");
        setFilteredData(sorted);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Show error to user
        setErrorModalMessage('Failed to load data. Please try again later.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get current data based on active tab
  const getCurrentData = () => {
    try {
      switch (activeTab) {
        case "Enquiry":
          return enquiryData;
        case "Enrollment":
          return enrollmentData;
        default:
          return [];
      }
    } catch (error) {
      console.error("Error getting current data:", error);
      return [];
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    try {
      setActiveTab(tab);
      setSearchTerm("");
      setCurrentPage(1);
      setSortField("createdAt");
      setSortDirection("desc");
      
      const data = tab === "Enquiry" ? enquiryData : enrollmentData;
      
      const sorted = sortData(data, "createdAt", "desc");
      setFilteredData(sorted);
    } catch (error) {
      console.error("Error handling tab change:", error);
    }
  };

  // Search + Sort
  useEffect(() => {
    try {
      const currentData = getCurrentData();
      let filtered = currentData.filter((item) =>
        Object.values(item).some((value) => {
          // Handle nested objects properly
          if (value && typeof value === 'object') {
            // Check if it's a course object
            if (value.courseName) {
              return value.courseName.toString().toLowerCase().includes(searchTerm.toLowerCase());
            }
            // Check if it's an enrollment object with course details
            if (value.course && value.course.name) {
              return value.course.name.toString().toLowerCase().includes(searchTerm.toLowerCase());
            }
            // For other objects, convert to JSON string and search
            return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
          }
          return value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );

      filtered = sortData(filtered, sortField, sortDirection);
      setFilteredData(filtered);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error in search and sort effect:", error);
    }
  }, [searchTerm, enquiryData, enrollmentData, sortField, sortDirection, activeTab]);

  // Handle sort
  const handleSort = (field) => {
    try {
      let newDirection = "desc";
      if (sortField === field && sortDirection === "desc") {
        newDirection = "asc";
      }
      setSortField(field);
      setSortDirection(newDirection);
    } catch (error) {
      console.error("Error handling sort:", error);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setUpdatedStatus(record.status || '');
    setShowModal(true);
  };

  const handleDeleteEnquiry = async (id) => {
    if (!id) {
      setErrorModalMessage('Cannot delete: Invalid record ID');
      setShowErrorModal(true);
      return;
    }
    
    setDeleteItemType('enquiry');
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteEnquiry = async () => {
    try {
      await deleteForm(deleteItemId);
      // Refresh the list
      setEnquiryData(enquiryData.filter(item => item._id !== deleteItemId));
      setSuccessMessage('Enquiry deleted successfully');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      setErrorModalMessage('Failed to delete enquiry');
      setShowErrorModal(true);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRecord || !selectedRecord._id) {
      setErrorModalMessage('No record selected');
      setShowErrorModal(true);
      return;
    }
    
    if (!updatedStatus) {
      setErrorModalMessage('Please select a status');
      setShowErrorModal(true);
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateEnrollmentStatus(selectedRecord._id, updatedStatus);
      
      // Update the enrollment data in state
      setEnrollmentData(enrollmentData.map(item => 
        item._id === selectedRecord._id ? { ...item, status: updatedStatus } : item
      ));
      
      // Also update the selected record
      setSelectedRecord({ ...selectedRecord, status: updatedStatus });
      
      setSuccessMessage('Status updated successfully');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorModalMessage('Failed to update status');
      setShowErrorModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEnrollment = async (id) => {
    if (!id) {
      setErrorModalMessage('Cannot delete: Invalid record ID');
      setShowErrorModal(true);
      return;
    }
    
    setDeleteItemType('enrollment');
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteEnrollment = async () => {
    try {
      await deleteEnrollment(deleteItemId);
      // Refresh the list
      setEnrollmentData(enrollmentData.filter(item => item._id !== deleteItemId));
      setSuccessMessage('Enrollment deleted successfully');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      setErrorModalMessage('Failed to delete enrollment');
      setShowErrorModal(true);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "▲" : "▼";
  };

  // Render table based on active tab
  const renderTableHeaders = () => {
    try {
      if (activeTab === "Enquiry") {
        return (
          <tr>
            {[
              { label: "Name", field: "fullName", width: "w-40" },
              { label: "Email", field: "email", width: "w-56" },
              { label: "Phone", field: "phoneNo", width: "w-32" },
              { label: "Message", field: "message", width: "w-64" },
              { label: "Created", field: "createdAt", width: "w-28" },
              { label: "Action", field: null, width: "w-32" },
            ].map((col, idx) => (
              <th
                key={idx}
                className={`${col.width} px-4 py-3 text-left font-medium ${
                  col.field ? 'cursor-pointer hover:bg-blue-700 transition' : ''
                }`}
                onClick={() => col.field ? handleSort(col.field) : undefined}
              >
                <div className="flex items-center space-x-1">
                  <span>{col.label}</span>
                  {col.field && sortField === col.field && (
                    <span className="text-blue-200">{getSortIcon(col.field)}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        );
      } else {
        return (
          <tr>
            {[
              { label: "Student Name", field: "studentName", width: "w-40" },
              { label: "Email", field: "studentEmail", width: "w-56" },
              { label: "Course", field: "courseName", width: "w-40" },
              { label: "Phone", field: "studentPhone", width: "w-32" },
              { label: "Status", field: "status", width: "w-28" },
              { label: "Date", field: "createdAt", width: "w-28" },
              { label: "Action", field: null, width: "w-32" },
            ].map((col, idx) => (
              <th
                key={idx}
                className={`${col.width} px-4 py-3 text-left font-medium ${
                  col.field ? 'cursor-pointer hover:bg-blue-700 transition' : ''
                }`}
                onClick={() => col.field ? handleSort(col.field) : undefined}
              >
                <div className="flex items-center space-x-1">
                  <span>{col.label}</span>
                  {col.field && sortField === col.field && (
                    <span className="text-blue-200">{getSortIcon(col.field)}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        );
      }
    } catch (error) {
      console.error("Error rendering table headers:", error);
      return null;
    }
  };

  const renderTableRows = () => {
    try {
      if (currentItems.length === 0) {
        const colSpan = activeTab === "Enquiry" ? 6 : 7;
        return (
          <tr>
            <td colSpan={colSpan} className="text-center py-8 text-gray-500">
              <div className="flex flex-col items-center space-y-3">
                <Users className="w-12 h-12 text-gray-300" />
                <p className="text-lg font-medium">No {activeTab.toLowerCase()} records found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            </td>
          </tr>
        );
      }

      if (activeTab === "Enquiry") {
        return currentItems.map((item, index) => (
          <tr
            key={item._id || index}
            className={`border-t hover:bg-blue-50 transition ${
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <td className="px-4 py-3 truncate" title={item.fullName || 'N/A'}>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{item.fullName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate" title={item.email || 'N/A'}>{item.email || 'N/A'}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{item.phoneNo || 'N/A'}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate" title={item.message || 'N/A'}>
                  {(item.message && item.message.substring(0, 50)) || 'N/A'}
                  {(item.message && item.message.length > 50) ? "..." : ""}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {formatDateShort(item.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </div>
                </button>
                {item._id && (
                  <button
                    onClick={() => handleDeleteEnquiry(item._id)}
                    className="text-red-600 hover:text-red-800 hover:underline"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Delete</span>
                    </div>
                  </button>
                )}
              </div>
            </td>
          </tr>
        ));
      } else {
        return currentItems.map((item, index) => (
          <tr
            key={item._id || index}
            className={`border-t hover:bg-blue-50 transition ${
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <td className="px-4 py-3 truncate" title={item.studentName || 'N/A'}>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{item.studentName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate" title={item.studentEmail || 'N/A'}>{item.studentEmail || 'N/A'}</span>
              </div>
            </td>
            <td className="px-4 py-3 truncate" title={item.courseName || (item.course && item.course.name) || 'N/A'}>
              {item.courseName || (item.course && item.course.name) || 'N/A'}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{item.studentPhone || 'N/A'}</span>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.status || 'N/A'}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {formatDateShort(item.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </div>
                </button>
                {item._id && (
                  <button
                    onClick={() => handleDeleteEnrollment(item._id)}
                    className="text-red-600 hover:text-red-800 hover:underline"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Delete</span>
                    </div>
                  </button>
                )}
              </div>
            </td>
          </tr>
        ));
      }
    } catch (error) {
      console.error("Error rendering table rows:", error);
      return (
        <tr>
          <td colSpan="100%" className="text-center py-8 text-red-500">
            Error loading data. Please check the console for details.
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          
          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              EEE Technologies
            </h1>

            {/* Tab Selector */}
            <div className="mb-6">
              <div className="inline-flex rounded-lg shadow-sm bg-white p-1" role="group">
                <button
                  type="button"
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'Enquiry'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange('Enquiry')}
                >
                  Enquiry ({enquiryData.length})
                </button>
                <button
                  type="button"
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'Enrollment'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange('Enrollment')}
                >
                  Enrollment ({enrollmentData.length})
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab.toLowerCase()} records...`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full table-fixed border border-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  {renderTableHeaders()}
                </thead>
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <span className="text-gray-600 font-medium">
                  Page {currentPage} of {totalPages} ({filteredData.length} records)
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Modal for viewing details */}
            {showModal && selectedRecord && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'Enquiry' ? 'Enquiry Details' : 'Enrollment Details'}
                      </h2>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {activeTab === 'Enquiry' ? (
                        // Enquiry details
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Name:</span>
                            <span>{selectedRecord.fullName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Email:</span>
                            <span>{selectedRecord.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Phone:</span>
                            <span>{selectedRecord.phoneNo || 'N/A'}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                            <div>
                              <span className="font-medium">Message:</span>
                              <p className="mt-1">{selectedRecord.message || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Created:</span>
                            <span>{formatDateShort(selectedRecord.createdAt)}</span>
                          </div>
                        </div>
                      ) : (
                        // Enrollment details
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Student Name:</span>
                            <span>{selectedRecord.studentName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Student Email:</span>
                            <span>{selectedRecord.studentEmail || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Course:</span>
                            <span>{selectedRecord.courseName || (selectedRecord.course && selectedRecord.course.name) || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Student Phone:</span>
                            <span>{selectedRecord.studentPhone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Status:</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              selectedRecord.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              selectedRecord.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {selectedRecord.status || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">Enrollment Date:</span>
                            <span>{formatDateShort(selectedRecord.createdAt)}</span>
                          </div>
                          
                          {/* Status update form */}
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Update Status</h3>
                            <div className="flex items-center space-x-3">
                              <select
                                value={updatedStatus}
                                onChange={(e) => setUpdatedStatus(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              <button
                                onClick={handleUpdateStatus}
                                disabled={isUpdating}
                                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUpdating ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Updating...</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    <span>Update</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success Modal */}
            <SuccessModal 
              showModal={showSuccessModal} 
              setShowModal={setShowSuccessModal} 
              message={successMessage} 
            />
            
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal 
              showModal={showDeleteModal} 
              setShowModal={setShowDeleteModal} 
              itemName={`${deleteItemType} record`} 
              onConfirm={deleteItemType === 'enquiry' ? confirmDeleteEnquiry : confirmDeleteEnrollment} 
            />
            
            {/* Error Modal */}
            <ErrorModal 
              showModal={showErrorModal} 
              setShowModal={setShowErrorModal} 
              message={errorModalMessage} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EEETechnologies;