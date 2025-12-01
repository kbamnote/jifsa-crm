import React, { useEffect, useState } from "react";
import { getDetail, logCall } from "../../../../utils/Api";
import { Mail, Phone, Eye, Users, ChevronLeft, ChevronRight, User, Search, Briefcase } from "lucide-react";
import ClickToCallButton from "../../../../calling/ClickToCallButton";
import ClientModal from "../../../../modal/ClientModal";

const EliteBim = () => {
  const [enquiryData, setEnquiryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Call logging function
  const handleCallLog = async (callData) => {
    try {
      await logCall(callData);
      console.log('Call logged successfully:', callData);
    } catch (error) {
      console.error('Failed to log call:', error);
    }
  };

  // Sorting helper
  const sortData = (dataToSort, field, direction) => {
    return [...dataToSort].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (field === "createdAt" || field === "updatedAt") {
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

  // Fetch only Elite-BIM data
  useEffect(() => {
    setLoading(true);
    getDetail()
      .then((res) => {
        // Filter only Elite-BIM data
        const eliteBimData = res.data.filter(
          item => item.productCompany === 'Elite-BIM'
        );
        
        const sorted = sortData(eliteBimData, "createdAt", "desc");
        setEnquiryData(eliteBimData);
        setFilteredData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Elite-BIM data:", err);
        setLoading(false);
      });
  }, []);

  // Search + Sort
  useEffect(() => {
    let filtered = enquiryData.filter((item) =>
      Object.values(item).some((value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    filtered = sortData(filtered, sortField, sortDirection);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, enquiryData, sortField, sortDirection]);

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

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "▲" : "▼";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse">
          {/* Header */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
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
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Elite BIM - Data Management
        </h1>
      </div>

      {/* Tab Section */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg shadow-sm bg-white p-1" role="group">
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-md transition-colors"
          >
            Enquiry ({enquiryData.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Elite-BIM enquiries..."
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
            <tr>
              {[
                { label: "Full Name", field: "fullName", width: "w-40" },
                { label: "Email", field: "email", width: "w-56" },
                { label: "Phone", field: "phoneNo", width: "w-32" },
                { label: "Experience", field: "experience", width: "w-28" },
                { label: "Specialisation", field: "specialisation", width: "w-40" },
                { label: "Date/Time", field: "createdAt", width: "w-36" },
                { label: "Action", field: null, width: "w-24" },
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
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
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
                      <ClickToCallButton 
                        phoneNumber={item.phoneNo}
                        customerName={item.fullName}
                        onCallLog={handleCallLog}
                        size="xs"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{item.experience || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate" title={item.specialisation}>
                    {item.specialisation || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {formatDateShort(item.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => handleViewDetails(item)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </div>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center space-y-3">
                    <Users className="w-12 h-12 text-gray-300" />
                    <p className="text-lg font-medium">No Elite-BIM enquiries found</p>
                    {searchTerm && (
                      <p className="text-sm text-gray-400">
                        Try adjusting your search criteria
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
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
    </div>
  );
};

export default EliteBim;