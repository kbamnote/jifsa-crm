import React, { useEffect, useState, useRef } from "react";
import { getAdmissionForm, getComplaint, getDetail } from "../../../../utils/Api";
import { Search, Users, ChevronLeft, ChevronRight, Eye, Calendar, Mail, Phone, User, GraduationCap, MessageSquare, Paperclip, Upload, X } from "lucide-react";
import ClientModal from "../../../../modal/ClientModal";
import MailModal from "../../../../modal/MailModal";
import FileSelectionModal from "../../../../modal/FileSelectionModal";

const JIFSA = () => {
  const [enquiryData, setEnquiryData] = useState([]);
  const [complaintData, setComplaintData] = useState([]);
  const [admissionData, setAdmissionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Enquiry"); // Enquiry, Complaint, Admission
  
  // Added state for mail modal
  const [showMailModal, setShowMailModal] = useState(false);
  const [recordToShare, setRecordToShare] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  
  // Ref for file input
  const fileInputRef = useRef(null);

  // Sorting helper
  const sortData = (dataToSort, field, direction) => {
    return [...dataToSort].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (field === "createdAt" || field === "dob") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

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
  };

  // API calls - Fetch all data
  useEffect(() => {
    setLoading(true);
    Promise.all([getDetail(), getComplaint(), getAdmissionForm()])
      .then(([enquiryRes, complaintRes, admissionRes]) => {
        // Filter only JIFSA data for enquiry
        const jifsaEnquiry = enquiryRes.data.filter(
          item => item.productCompany === 'JIFSA'
        );
        
        setEnquiryData(jifsaEnquiry);
        setComplaintData(complaintRes.data);
        setAdmissionData(admissionRes.data);
        
        // Set initial filtered data based on active tab
        const sorted = sortData(jifsaEnquiry, "createdAt", "desc");
        setFilteredData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "Enquiry":
        return enquiryData;
      case "Complaint":
        return complaintData;
      case "Admission":
        return admissionData;
      default:
        return [];
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setCurrentPage(1);
    setSortField("createdAt");
    setSortDirection("desc");
    
    const data = tab === "Enquiry" ? enquiryData : 
                 tab === "Complaint" ? complaintData : 
                 admissionData;
    
    const sorted = sortData(data, "createdAt", "desc");
    setFilteredData(sorted);
  };

  // Search + Sort
  useEffect(() => {
    const currentData = getCurrentData();
    let filtered = currentData.filter((item) =>
      Object.values(item).some((value) => {
        if (value && typeof value === 'object' && value.courseName) {
          return value.courseName.toString().toLowerCase().includes(searchTerm.toLowerCase());
        }
        return value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );

    filtered = sortData(filtered, sortField, sortDirection);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, enquiryData, complaintData, admissionData, sortField, sortDirection, activeTab]);

  // Handle sort
  const handleSort = (field) => {
    let newDirection = "desc";
    if (sortField === field && sortDirection === "desc") {
      newDirection = "asc";
    }
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // Added handleShare function
  const handleShare = (record) => {
    setRecordToShare(record);
    // Set the selected lead as the only lead to show in the modal
    setSelectedLeads([record]);
    setShowMailModal(true);
  };
  
  // Added state for file selection modal
  const [showFileSelectionModal, setShowFileSelectionModal] = useState(false);
  const [mailAttachments, setMailAttachments] = useState([]);
  
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
  const isImageFile = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };
  
  // Function to handle file upload from device
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the actual file object so it can be sent via FormData
      const attachment = {
        name: file.name,
        file: file, // Store the actual file object
        url: URL.createObjectURL(file), // Temporary URL for preview
        isImage: file.type.startsWith('image/')
      };
      setMailAttachments([attachment]);
      
      // Reset the file input
      e.target.value = '';
    }
  };
  
  // Function to remove attachment
  const removeAttachment = () => {
    setMailAttachments([]);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "▲" : "▼";
  };

  // Render table based on active tab
  const renderTableHeaders = () => {
    if (activeTab === "Enquiry") {
      return (
        <tr>
          {[
            { label: "Name", field: "fullName", width: "w-40" },
            { label: "Email", field: "email", width: "w-56" },
            { label: "Phone", field: "phoneNo", width: "w-32" },
            { label: "Experience", field: "experience", width: "w-28" },
            { label: "Specialisation", field: "specialisation", width: "w-40" },
            { label: "Created", field: "createdAt", width: "w-28" },
            { label: "Action", field: null, width: "w-20" },
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
    } else if (activeTab === "Complaint") {
      return (
        <tr>
          {[
            { label: "Name", field: "fullName", width: "w-40" },
            { label: "Email", field: "email", width: "w-56" },
            { label: "Phone", field: "phoneNo", width: "w-32" },
            { label: "Student ID", field: "studentId", width: "w-32" },
            { label: "Message", field: "message", width: "w-64" },
            { label: "Date/Time", field: "createdAt", width: "w-28" },
            { label: "Action", field: null, width: "w-20" },
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
            { label: "Name", field: "fullName", width: "w-40" },
            { label: "Father Name", field: "fatherName", width: "w-40" },
            { label: "Qualification", field: "qualification", width: "w-32" },
            { label: "DOB", field: "dob", width: "w-28" },
            { label: "Phone", field: "phoneNo", width: "w-32" },
            { label: "Email", field: "email", width: "w-56" },
            { label: "Course", field: "course.courseName", width: "w-40" },
            { label: "Date/Time", field: "createdAt", width: "w-28" },
            { label: "Action", field: null, width: "w-20" },
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
  };

  const renderTableRows = () => {
    if (currentItems.length === 0) {
      const colSpan = activeTab === "Enquiry" ? 7 : activeTab === "Complaint" ? 6 : 9;
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
          key={item._id}
          className={`border-t hover:bg-blue-50 transition ${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          }`}
        >
          <td className="px-4 py-3 truncate" title={item.fullName}>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.fullName}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate" title={item.email}>{item.email}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.phoneNo}</span>
            </div>
          </td>
          <td className="px-4 py-3 truncate">{item.experience || "N/A"}</td>
          <td className="px-4 py-3 truncate" title={item.specialisation}>
            {item.specialisation || "N/A"}
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
              <button
                onClick={() => handleShare(item)}
                className="text-green-600 hover:text-green-800 hover:underline"
              >
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Mail</span>
                </div>
              </button>
            </div>
          </td>
        </tr>
      ));
    } else if (activeTab === "Complaint") {
      return currentItems.map((item, index) => (
        <tr
          key={item._id}
          className={`border-t hover:bg-blue-50 transition ${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          }`}
        >
          <td className="px-4 py-3 truncate" title={item.fullName}>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.fullName}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate" title={item.email}>{item.email}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.phoneNo}</span>
            </div>
          </td>
          <td className="px-4 py-3 truncate">{item.studentId || "N/A"}</td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate" title={item.message}>
                {item.message?.substring(0, 50)}
                {item.message?.length > 50 ? "..." : ""}
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
              <button
                onClick={() => handleShare(item)}
                className="text-green-600 hover:text-green-800 hover:underline"
              >
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Mail</span>
                </div>
              </button>
            </div>
          </td>
        </tr>
      ));
    } else {
      return currentItems.map((item, index) => (
        <tr
          key={item._id}
          className={`border-t hover:bg-blue-50 transition ${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          }`}
        >
          <td className="px-4 py-3 truncate" title={item.fullName}>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.fullName}</span>
            </div>
          </td>
          <td className="px-4 py-3 truncate" title={item.fatherName}>
            {item.fatherName}
          </td>
          <td className="px-4 py-3 truncate" title={item.qualification}>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.qualification}</span>
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{formatDateShort(item.dob)}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.phoneNo}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate" title={item.email}>{item.email}</span>
            </div>
          </td>
          <td className="px-4 py-3 truncate" title={item.course?.courseName || "-"}>
            {item.course?.courseName || "-"}
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
              <button
                onClick={() => handleShare(item)}
                className="text-green-600 hover:text-green-800 hover:underline"
              >
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Mail</span>
                </div>
              </button>
            </div>
          </td>
        </tr>
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse">
          {/* Header */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 flex space-x-2">
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          </div>
          
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-12 bg-gray-200"></div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-16 bg-gray-100"></div>
              ))}
            </div>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex justify-between">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
      
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              JIFSA
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
                    activeTab === 'Complaint'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange('Complaint')}
                >
                  Complaint ({complaintData.length})
                </button>
                <button
                  type="button"
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'Admission'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange('Admission')}
                >
                  Admission ({admissionData.length})
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

            {/* Modal */}
            <ClientModal
              showModal={showModal}
              selectedRecord={selectedRecord}
              setShowModal={setShowModal}
            />
            
            {/* Added MailModal */}
            <MailModal
              showModal={showMailModal}
              setShowModal={setShowMailModal}
              attachmentFile={mailAttachments.length > 0 ? mailAttachments[0] : null}
              imageToShare={recordToShare}
              selectedLeads={selectedLeads}
              onAttachmentClick={handleSelectAttachment}
              mode="send"
            />
            
            {/* File selection modal */}
            {showFileSelectionModal && (
              <FileSelectionModal 
                onClose={() => setShowFileSelectionModal(false)}
                onFileSelect={handleFileSelectFromGallery}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JIFSA;