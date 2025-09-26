import React, { useEffect, useState } from "react";
import { getAdmissionForm } from "../utils/Api";
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
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      { label: "Name", field: "fullName" },
                      { label: "Father Name", field: "fatherName" },
                      { label: "Qualification", field: "qualification" },
                      { label: "DOB", field: "dob" },
                      { label: "Phone", field: "phoneNo" },
                      { label: "Email", field: "email" },
                      { label: "Course", field: "course.courseName" },
                      { label: "Created", field: "createdAt" },
                      { label: "Action", field: null },
                    ].map((col, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-2 text-left cursor-pointer"
                        onClick={() =>
                          col.field ? handleSort(col.field) : undefined
                        }
                      >
                        {col.label}
                        {sortField === col.field &&
                          (sortDirection === "asc" ? " ▲" : " ▼")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-2">{item.fullName}</td>
                      <td className="px-4 py-2">{item.fatherName}</td>
                      <td className="px-4 py-2">{item.qualification}</td>
                      <td className="px-4 py-2">
                        {new Date(item.dob).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{item.phoneNo}</td>
                      <td className="px-4 py-2">{item.email}</td>
                      <td className="px-4 py-2">
                        {item.course?.courseName || "-"}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-4 text-gray-500"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
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
