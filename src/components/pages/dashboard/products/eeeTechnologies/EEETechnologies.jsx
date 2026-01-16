import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Eye, UserCheck, TrendingUp, Clock, Filter, Search, UserPlus, Mail, X, Calendar, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEnrollments, deleteEnrollment, updateEnrollmentStatus, updateEnrollmentDetails, updateEnrollmentEducation, addEnrollmentRemark, getTeamDetail } from '../../../../utils/Api';
import Cookies from "js-cookie";
import UpdateEnrollmentModal from '../../../../modal/UpdateEnrollmentModal';
import SuccessModal from '../../../../modal/SuccessModal';
import DeleteConfirmationModal from '../../../../modal/DeleteConfirmationModal';
import ErrorModal from '../../../../modal/ErrorModal';
import MailModal from '../../../../modal/MailModal';
import FileSelectionModal from '../../../../modal/FileSelectionModal';
import AssignmentModal from '../../../../modal/AssignmentModal';
import RemarkModal from '../../../../modal/RemarkModal';
import AllRemarksModal from '../../../../modal/AllRemarksModal';

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
  
  // Mail modal states
  const [showMailModal, setShowMailModal] = useState(false);
  const [enrollmentToShare, setEnrollmentToShare] = useState(null);
  const [mailAttachments, setMailAttachments] = useState([]);
  
  // Assignment states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [enrollmentToAssign, setEnrollmentToAssign] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  // File selection modal state
  const [showFileSelectionModal, setShowFileSelectionModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [newRemark, setNewRemark] = useState('');
  const [showAllRemarksModal, setShowAllRemarksModal] = useState(false);
  const [currentEnrollmentAllRemarks, setCurrentEnrollmentAllRemarks] = useState(null);
  
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

  const handleMailAction = (enrollment) => {
    setEnrollmentToShare(enrollment);
    setShowMailModal(true);
  };

  // Function to handle attachment selection
  const handleSelectAttachment = () => {
    setShowFileSelectionModal(true);
  };

  // Function to handle file selection from gallery
  const handleFileSelectFromGallery = (file) => {
    // Create attachment object similar to ImgAndFiles.jsx
    const attachment = {
      name: file.name,
      url: file.imageUrl,
      isImage: isImageFile(file.imageUrl)
    };
    setMailAttachments([attachment]);
    setShowFileSelectionModal(false);
  };

  // Helper function to determine if a file is an image (copied from ImgAndFiles.jsx)
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  // Helper function to get file icon based on type (copied from ImgAndFiles.jsx)
  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      'pdf': '📑',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📽️',
      'pptx': '📽️',
      'zip': '📦',
      'rar': '📦',
    };
    
    return iconMap[extension] || '📄';
  };

  // Helper function to format file size (copied from ImgAndFiles.jsx)
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format date (copied from ImgAndFiles.jsx)
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to truncate filename (copied from ImgAndFiles.jsx)
  const truncateFileName = (fileName, maxLength = 20) => {
    if (!fileName) return '';
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength - 3) + '...';
  };

  // Helper function to format file type display (copied from ImgAndFiles.jsx)
  const formatFileType = (fileName) => {
    if (!fileName) return 'Unknown';
    return fileName.split('.').pop().toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamDetail();
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  // Function to handle assignment
  const handleAssignEnrollment = async () => {
    if (!selectedMember) return;

    const selectedTeamMember = teamMembers.find(m => m._id === selectedMember);
    if (!selectedTeamMember) {
      setErrorModalMessage('Selected team member not found');
      setShowErrorModal(true);
      return;
    }

    let isAllowed = false;
    if (userRole.toLowerCase() === 'admin') {
      isAllowed = selectedTeamMember.role !== 'admin';
    } else if (userRole.toLowerCase() === 'counsellor') {
      isAllowed = selectedTeamMember.role === 'telecaller';
    } else {
      isAllowed = selectedTeamMember.role === 'sales';
    }

    if (!isAllowed) {
      setErrorModalMessage('You are not allowed to assign enrollments to this team member based on your role.');
      setShowErrorModal(true);
      return;
    }

    setIsAssigning(true);
    try {
      const assignmentData = {
        assignedTo: selectedTeamMember.email,
        assignedBy: userEmail
      };
      await updateEnrollmentDetails(enrollmentToAssign._id, assignmentData);

      setShowAssignmentModal(false);
      setSelectedMember('');
      setEnrollmentToAssign(null);
      fetchEnrollmentData(); // Refresh the data
    } catch (error) {
      console.error('Error assigning enrollment:', error);
      setErrorModalMessage('Failed to assign enrollment: ' + (error.response?.data?.message || error.message || 'Please try again.'));
      setShowErrorModal(true);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);
    setEnrollmentToAssign(null);
    setSelectedMember('');
    setIsAssigning(false);
  };

  // Function to update education status
  const handleEducationToggle = async (enrollmentId, educationField) => {
    try {
      const response = await updateEnrollmentEducation(enrollmentId, educationField);
      if (response.data.success) {
        // Update the local state to reflect the change
        setEnrollmentData(prevData => 
          prevData.map(enrollment => 
            enrollment._id === enrollmentId 
              ? { ...enrollment, education: response.data.data.education }
              : enrollment
          )
        );
        setFilteredData(prevData => 
          prevData.map(enrollment => 
            enrollment._id === enrollmentId 
              ? { ...enrollment, education: response.data.data.education }
              : enrollment
          )
        );
      }
    } catch (error) {
      console.error(`Error updating ${educationField} education:`, error);
      setErrorModalMessage(`Failed to update ${educationField} education`);
      setShowErrorModal(true);
    }
  };

  // Function to open remarks modal
  const openRemarksModal = (enrollment) => {
    setCurrentEnrollment(enrollment);
    setCurrentEnrollmentAllRemarks(enrollment);
    if (!enrollment.remarks || enrollment.remarks.length === 0) {
      setShowRemarksModal(true);
    } else {
      setShowAllRemarksModal(true);
    }
  };

  // Function to add a remark
  const addRemarkToEnrollment = async (remarkData) => {
    try {
      const response = await addEnrollmentRemark(remarkData.leadId, {
        message: remarkData.message,
        status: remarkData.status,
        reminderDate: remarkData.reminderDate
      });
      
      // Update the local state
      setEnrollmentData(prev => prev.map(enrollment => {
        if (enrollment._id === remarkData.leadId) {
          return { ...response.data.updatedEnrollment };
        }
        return enrollment;
      }));
      
      setFilteredData(prev => prev.map(enrollment => {
        if (enrollment._id === remarkData.leadId) {
          return { ...response.data.updatedEnrollment };
        }
        return enrollment;
      }));
      
      // Close the modal
      setShowRemarksModal(false);
      setShowAllRemarksModal(false);
      setCurrentEnrollment(null);
      setCurrentEnrollmentAllRemarks(null);
    } catch (error) {
      console.error('Error adding remark:', error);
      setErrorModalMessage(error.message || 'Failed to add remark');
      setShowErrorModal(true);
    }
  };

  const handleRemarkSubmit = async (remarkData) => {
    await addRemarkToEnrollment(remarkData);
  };

  // API calls - Fetch enrollment data
  const fetchEnrollmentData = async () => {
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
            
            // Check if it's a createdBy object
            if (value.name && value.email) {
              return (value.name.toString() + ' ' + value.email).toLowerCase().includes(searchTerm.toLowerCase());
            }
            
            // For other objects, convert to JSON string and search
            return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
          }
          return value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        }) ||
        // Also search in specific new fields
        (item.qualification && item.qualification.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.experience && item.experience.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.highestDegree && item.highestDegree.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.collegeOrInstituteName && item.collegeOrInstituteName.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.source && item.source.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.createdBy?.name && item.createdBy.name.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.updatedBy?.name && item.updatedBy.name.toString().toLowerCase().includes(searchTerm.toLowerCase()))
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


  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "▲" : "▼";
  };

  // Render table headers for enrollment data
  const renderTableHeaders = () => {
    try {
      return (
        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
          {[
            { label: "Student Name", field: "studentName", width: "w-48" },
            { label: "Email", field: "studentEmail", width: "w-64" },
            { label: "Phone No.", field: "studentPhone", width: "w-36" },
            { label: "Status", field: "status", width: "w-28" },
            { label: "Education", field: null, width: "w-48" },
            { label: "Remarks", field: null, width: "w-28" },
            { label: "Date", field: "createdAt", width: "w-36" },
            { label: "Action", field: null, width: "w-36" },
          ].map((col, idx) => (
            <th
              key={idx}
              className={`${col.width} px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100 ${col.field ? 'cursor-pointer hover:bg-blue-200' : ''}`}
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
            <td colSpan="8" className="text-center py-8 text-gray-500">
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
          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 hover:shadow-sm relative`}
        >
          {/* Student Name */}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {item.studentName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{item.studentName || 'Unnamed Student'}</div>
                <div className="text-xs text-blue-600 font-semibold uppercase">{item.productCompany || 'N/A'}</div>
              </div>
            </div>
          </td>
          
          {/* Email */}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-xs text-gray-900 flex items-center gap-1">
              <Mail className="w-3 h-3 text-gray-400" />
              {item.studentEmail || 'N/A'}
            </div>
          </td>
          
          {/* Phone No. */}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Phone className="w-3 h-3 text-gray-400" />
              {item.studentPhone || 'N/A'}
            </div>
          </td>
          
          {/* Status */}
          <td className="px-4 py-3 whitespace-nowrap">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'confirmed' ? 'bg-green-100 text-green-800' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} shadow-sm`}>
              {item.status || 'N/A'}
            </span>
          </td>
          
          {/* Education */}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex flex-wrap gap-1 max-w-[120px]">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={item.education?.tenth || false}
                  onChange={() => handleEducationToggle(item._id, 'tenth')}
                  className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">10th</span>
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={item.education?.twelfth || false}
                  onChange={() => handleEducationToggle(item._id, 'twelfth')}
                  className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">12th</span>
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={item.education?.undergraduate || false}
                  onChange={() => handleEducationToggle(item._id, 'undergraduate')}
                  className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">UG</span>
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={item.education?.postgraduate || false}
                  onChange={() => handleEducationToggle(item._id, 'postgraduate')}
                  className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">PG</span>
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={item.education?.phd || false}
                  onChange={() => handleEducationToggle(item._id, 'phd')}
                  className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">PhD</span>
              </label>
            </div>
          </td>
          
          {/* Remarks */}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex flex-col space-y-1">
              {(!item.remarks || item.remarks.length === 0) ? (
                <button
                  onClick={() => openRemarksModal(item)}
                  className="px-2 py-1 cursor-pointer bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-semibold hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  Add Remark
                </button>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">
                    <span 
                      className="cursor-pointer px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-xs font-semibold hover:from-green-200 hover:to-emerald-200 transition-all duration-200 shadow-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openRemarksModal(item);
                      }}
                    >
                      All Remarks <span className="px-1 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium ml-1 text-[8px]">
                        {item.remarks.length}
                      </span>
                    </span>
                  </div>
                  {/* Show conversation status */}
                  {item.remarks.length > 0 && (
                    <div className="text-[10px] sm:text-xs">
                      {(() => {
                        const lastRemark = item.remarks[item.remarks.length - 1];
                        const isClosed = lastRemark.status === 'rejected' || lastRemark.status === 'confirm_selected';
                        
                        return isClosed ? (
                          <span className="px-1 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-800 font-medium text-[10px] sm:text-xs">
                            Closed
                          </span>
                        ) : (
                          <span className="px-1 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-green-100 to-teal-100 text-green-800 font-medium text-[10px] sm:text-xs">
                            Active
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </td>
          
          {/* Date */}
          <td className="px-4 py-3 whitespace-nowrap text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">{formatDateShort(item.createdAt)}</span>
            </div>
          </td>
          
          {/* Action */}
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleViewDetails(item)}
                className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                title="View Enrollment Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMailAction(item)}
                className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                title="Send Mail"
              >
                <Mail className="w-4 h-4" />
              </button>
              {/* Show assignment icons only for admin, manager, counsellor, and marketing roles */}
              {['admin', 'manager', 'counsellor', 'marketing'].includes(userRole.toLowerCase()) && (
                item.assignedTo ? (
                  <button
                    onClick={() => handleAssignEnrollmentAction(item)}
                    className="text-amber-600 hover:text-amber-900 p-1.5 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                    title="Reassign Enrollment"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssignEnrollmentAction(item)}
                    className="text-green-600 hover:text-green-900 p-1.5 rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                    title="Assign Enrollment"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )
              )}
              <button
                onClick={() => handleEditEnrollment(item)}
                className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                title="Edit Enrollment"
              >
                <Edit className="w-4 h-4" />
              </button>
              {item._id && userRole.toLowerCase() === 'admin' && (
                <button
                  onClick={() => handleDeleteEnrollment(item._id)}
                  className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  title="Delete Enrollment"
                >
                  <Trash2 className="w-4 h-4" />
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
          <td colSpan="8" className="text-center py-8 text-red-500">
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-bold text-gray-900">EEE Technologies - Enrollment Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    {renderTableHeaders()}
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {renderTableRows()}
                  </tbody>
                </table>
              </div>
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
              
              {/* Mail Modal */}
              <MailModal
                showModal={showMailModal}
                setShowModal={setShowMailModal}
                attachmentFile={mailAttachments.length > 0 ? mailAttachments[0] : null}
                imageToShare={enrollmentToShare}
                selectedLeads={enrollmentToShare ? [enrollmentToShare] : []}
                onAttachmentClick={handleSelectAttachment}
                mode="send"
              />
              
              {/* File Selection Modal */}
              <FileSelectionModal
                isOpen={showFileSelectionModal}
                onClose={() => setShowFileSelectionModal(false)}
                onFileSelect={handleFileSelectFromGallery}
              />

              {/* Remark Modal */}
              {showRemarksModal && currentEnrollment && (
                <RemarkModal
                  showModal={showRemarksModal}
                  setShowModal={setShowRemarksModal}
                  lead={currentEnrollment}
                  onSubmit={handleRemarkSubmit}
                  onCancel={() => {
                    setShowRemarksModal(false);
                    setCurrentEnrollment(null);
                  }}
                />
              )}

              {/* All Remarks Modal */}
              {showAllRemarksModal && currentEnrollmentAllRemarks && (
                <AllRemarksModal
                  showModal={showAllRemarksModal}
                  setShowModal={setShowAllRemarksModal}
                  lead={currentEnrollmentAllRemarks}
                  allRemarks={currentEnrollmentAllRemarks.remarks || []}
                  onSubmit={handleRemarkSubmit}
                  onCancel={() => {
                    setShowAllRemarksModal(false);
                    setCurrentEnrollmentAllRemarks(null);
                  }}
                />
              )}
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