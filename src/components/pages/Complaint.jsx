import React, { useEffect, useState } from "react";
import { getComplaint, logCall } from "../utils/Api";
import { Mail, Phone, Eye, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../common/Header";
import SideNavbar from "../common/SideNavbar";
import ClickToCallButton from "../calling/ClickToCallButton";

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Call logging function
  const handleCallLog = async (callData) => {
    try {
      await logCall(callData);
      console.log('Call logged successfully:', callData);
    } catch (error) {
      console.error('Failed to log call:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getComplaint()
      .then((res) => {
        setComplaints(res.data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching complaints:", err);
        setLoading(false);
      });
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = complaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(complaints.length / itemsPerPage);

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
          <p className="text-gray-600 text-lg">Loading complaints...</p>
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

          {/* Main Table */}
          <div className="flex-1 overflow-auto p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Complaints
            </h1>

            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full table-fixed border border-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="w-40 px-4 py-3 text-left font-medium">Full Name</th>
                    <th className="w-24 px-4 py-3 text-left font-medium">Student ID</th>
                    <th className="w-56 px-4 py-3 text-left font-medium">Email</th>
                    <th className="w-32 px-4 py-3 text-left font-medium">Phone</th>
                    <th className="w-64 px-4 py-3 text-left font-medium">Message</th>
                    <th className="w-28 px-4 py-3 text-left font-medium">Date</th>
                    <th className="w-20 px-4 py-3 text-left font-medium">Action</th>
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
                          {item.fullName}
                        </td>
                        <td className="px-4 py-3">
                          {item.studentId}
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
                        <td className="px-4 py-3 truncate" title={item.message}>
                          {item.message}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDateShort(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-indigo-600 hover:text-indigo-800 hover:underline">
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
                          <p className="text-lg font-medium">No complaints found</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaint;