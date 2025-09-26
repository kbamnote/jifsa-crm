import React, { useEffect, useState } from "react";
import { getAdmissionForm } from "../utils/Api";
import { Search, Users, ChevronLeft, ChevronRight, Eye, Calendar, Mail, Phone, User, GraduationCap } from "lucide-react";
import Header from "../common/Header";
import SideNavbar from "../common/SideNavbar";
import ClientModal from "../modal/ClientModal";

const Admission = () => {
  const [data, setData] = useState([]);
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

  // API call
  useEffect(() => {
    setLoading(true);
    getAdmissionForm()
      .then((res) => {
        const sorted = res.data.reverse();
        setData(sorted);
        setFilteredData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admission forms:", err);
        setLoading(false);
      });
  }, []);

  // Search + Sort
  useEffect(() => {
    let filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    filtered = sortData(filtered, sortField, sortDirection);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data, sortField, sortDirection]);

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
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admission records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <SideNavbar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <div className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex-1">
                <Header />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Admission Records
            </h1>

            {/* Search */}
            <div className="mb-6">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search admission records..."
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
                      { label: "Name", field: "fullName", width: "w-40" },
                      { label: "Father Name", field: "fatherName", width: "w-40" },
                      { label: "Qualification", field: "qualification", width: "w-32" },
                      { label: "DOB", field: "dob", width: "w-28" },
                      { label: "Phone", field: "phoneNo", width: "w-32" },
                      { label: "Email", field: "email", width: "w-56" },
                      { label: "Course", field: "course.courseName", width: "w-40" },
                      { label: "Created", field: "createdAt", width: "w-28" },
                      { label: "Action", field: null, width: "w-20" },
                    ].map((col, idx) => (
                      <th
                        key={idx}
                        className={`${col.width} px-4 py-3 text-left font-medium ${
                          col.field ? 'cursor-pointer hover:bg-blue-700 transition' : ''
                        }`}
                        onClick={() =>
                          col.field ? handleSort(col.field) : undefined
                        }
                      >
                        <div className="flex items-center space-x-1">
                          <span>{col.label}</span>
                          {sortField === col.field && (
                            <span className="text-blue-200">
                              {sortDirection === "asc" ? "▲" : "▼"}
                            </span>
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
                      <td colSpan="9" className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center space-y-3">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="text-lg font-medium">No admission records found</p>
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
                Page {currentPage} of {totalPages}
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

            {/* Modal */}
            <ClientModal
              showModal={showModal}
              selectedRecord={selectedRecord}
              setShowModal={setShowModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admission;