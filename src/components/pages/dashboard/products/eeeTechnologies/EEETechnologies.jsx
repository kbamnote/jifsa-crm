import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrollments, deleteEnrollment, updateEnrollmentDetails, getTeamDetail } from '../../../../utils/Api';
import { Search, Users, ChevronLeft, ChevronRight, Eye, Edit, Trash2, User, Mail, Phone, GraduationCap, X, UserPlus, UserCheck } from "lucide-react";
import UpdateEnrollmentModal from '../../../../modal/UpdateEnrollmentModal';
import SuccessModal from '../../../../modal/SuccessModal';
import DeleteConfirmationModal from '../../../../modal/DeleteConfirmationModal';
import ErrorModal from '../../../../modal/ErrorModal';
import AssignmentModal from '../../../../modal/AssignmentModal';
import Cookies from 'js-cookie';

const EEETechnologies = () => {
  const navigate = useNavigate();
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  
  // Assignment states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [enrollmentToAssign, setEnrollmentToAssign] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  // User information
  const userEmail = Cookies.get("email") || "";
  const userName = Cookies.get("name") || "";
  const userRole = Cookies.get("role") || "";

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

  // Assignment functions
  const handleAssignEnrollmentAction = (enrollment) => {
    // Only allow admin, manager, counsellor, and marketing roles to assign enrollments
    if (!['admin', 'manager', 'counsellor', 'marketing'].includes(userRole.toLowerCase())) {
      return;
    }
    
    setEnrollmentToAssign(enrollment);
    setShowAssignmentModal(true);
    fetchTeamMembers();
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamDetail();
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setErrorModalMessage('Failed to fetch team members');
      setShowErrorModal(true);
    }
  };

  const handleAssignEnrollment = async () => {
    if (!selectedMember) {
      setErrorModalMessage('Please select a team member');
      setShowErrorModal(true);
      return;
    }

    setIsAssigning(true);
    try {
      const selectedTeamMember = teamMembers.find(member => member._id === selectedMember);
      if (!selectedTeamMember) {
        setErrorModalMessage('Selected team member not found');
        setShowErrorModal(true);
        return;
      }

      const assignmentData = {
        assignedTo: selectedTeamMember.email,
        assignedBy: userEmail, // Get email from cookies
        assignedByName: userName // Get name from cookies
      };

      await updateEnrollmentDetails(enrollmentToAssign._id, assignmentData);
      
      // Refresh the enrollment data
      const response = await getEnrollments();
      if (response.data.success) {
        setEnrollmentData(response.data.data);
        // Apply the existing filter logic
        let filtered = response.data.data.filter((item) =>
          Object.values(item).some((value) => {
            if (value && typeof value === 'object') {
              if (value.courseName) {
                return value.courseName.toString().toLowerCase().includes(searchTerm.toLowerCase());
              }
              if (value.course && value.course.name) {
                return value.course.name.toString().toLowerCase().includes(searchTerm.toLowerCase());
              }
              return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
            }
            return value &&
              value.toString().toLowerCase().includes(searchTerm.toLowerCase());
          })
        );
        
        filtered = sortData(filtered, sortField, sortDirection);
        setFilteredData(filtered);
      }
      
      setShowAssignmentModal(false);
      setSelectedMember('');
      setSuccessMessage('Enrollment assigned successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error assigning enrollment:', error);
      setErrorModalMessage(error.response?.data?.message || 'Failed to assign enrollment');
      setShowErrorModal(true);
    } finally {
      setIsAssigning(false);
    }
  };

  // API calls - Fetch enrollment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const enrollmentRes = await getEnrollments();
        
        console.log("Enrollment response:", enrollmentRes);
        
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
        
        setEnrollmentData(enrollmentDataResult);
        
        // Set initial filtered data
        const sorted = sortData(enrollmentDataResult, "createdAt", "desc");
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

  // Search + Sort
  useEffect(() => {
    try {
      let filtered = enrollmentData.filter((item) =>
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
  }, [searchTerm, enrollmentData, sortField, sortDirection]);

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
    navigate(`/enrollment/${record._id}`);
  };

  const handleEditEnrollment = (record) => {
    setSelectedRecord(record);
    setShowUpdateModal(true);
  };

  const handleDeleteEnrollment = async (id) => {
    if (!id) {
      setErrorModalMessage('Cannot delete: Invalid record ID');
      setShowErrorModal(true);
      return;
    }
    
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

  const handleUpdateSuccess = async () => {
    try {
      // Refresh the list
      const enrollmentRes = await getEnrollments();
      
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
      
      setEnrollmentData(enrollmentDataResult);
      
      // Set initial filtered data
      const sorted = sortData(enrollmentDataResult, "createdAt", "desc");
      setFilteredData(sorted);
      
      setShowUpdateModal(false);
      setSuccessMessage('Enrollment updated successfully');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error refreshing enrollment data:', err);
      setErrorModalMessage('Failed to refresh enrollment data');
      setShowErrorModal(true);
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

  // Render table headers for enrollment data
  const renderTableHeaders = () => {
    try {
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
    } catch (error) {
      console.error("Error rendering table headers:", error);
      return null;
    }
  };

  const renderTableRows = () => {
    try {
      if (currentItems.length === 0) {
        return (
          <tr>
            <td colSpan="7" className="text-center py-8 text-gray-500">
              <div className="flex flex-col items-center space-y-3">
                <Users className="w-12 h-12 text-gray-300" />
                <p className="text-lg font-medium">No enrollment records found</p>
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
          <td className="px-4 py-3 truncate" title={item.courseName || 'N/A'}>
            {item.courseName || 'N/A'}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewDetails(item)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="View Enrollment Details"
              >
                <Eye className="w-5 h-5" />
              </button>
              {/* Show assignment icons only for admin, manager, counsellor, and marketing roles */}
              {['admin', 'manager', 'counsellor', 'marketing'].includes(userRole.toLowerCase()) && (
                item.assignedTo ? (
                  <button
                    onClick={() => handleAssignEnrollmentAction(item)}
                    className="text-amber-600 hover:text-amber-900 p-2 rounded-full hover:bg-amber-50 transition-colors"
                    title="Reassign Enrollment"
                  >
                    <UserCheck className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssignEnrollmentAction(item)}
                    className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                    title="Assign Enrollment"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )
              )}
              <button
                onClick={() => handleEditEnrollment(item)}
                className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                title="Edit Enrollment"
              >
                <Edit className="w-5 h-5" />
              </button>
              {item._id && (
                <button
                  onClick={() => handleDeleteEnrollment(item._id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete Enrollment"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </td>
        </tr>
      ));
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

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
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
              EEE Technologies - Enrollment Records
            </h1>

            {/* Search */}
            <div className="mb-6">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search enrollment records..."
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

            <>
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
                itemName="enrollment record" 
                onConfirm={confirmDeleteEnrollment} 
              />
              
              {/* Error Modal */}
              <ErrorModal 
                showModal={showErrorModal} 
                setShowModal={setShowErrorModal} 
                message={errorModalMessage} 
              />
              
              {/* Assignment Modal */}
              <AssignmentModal
                showModal={showAssignmentModal}
                setShowModal={setShowAssignmentModal}
                itemToAssign={enrollmentToAssign}
                itemType="enrollment"
                teamMembers={teamMembers}
                selectedMember={selectedMember}
                setSelectedMember={setSelectedMember}
                onAssign={handleAssignEnrollment}
                isAssigning={isAssigning}
                userRole={userRole}
              />
            </>
            
            {/* Update Enrollment Modal */}
            <UpdateEnrollmentModal
              showModal={showUpdateModal}
              setShowModal={setShowUpdateModal}
              selectedRecord={selectedRecord}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EEETechnologies;