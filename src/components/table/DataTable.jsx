import React from "react";
import {
  Mail,
  Phone,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  UserCheck
} from "lucide-react";
import ClickToCallButton from "../calling/ClickToCallButton";
import { logCall } from "../utils/Api";

const DataTable = ({
  currentItems,
  filteredData,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  itemsPerPage,
  sortField,
  sortDirection,
  handleSort,
  handleViewDetails,
  setCurrentPage
}) => {
  // Call logging function
  const handleCallLog = async (callData) => {
    try {
      await logCall(callData);
      console.log('Call logged successfully:', callData);
    } catch (error) {
      console.error('Failed to log call:', error);
    }
  };
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-blue-200 opacity-60" />;
    }
    return sortDirection === 'desc' 
      ? <ArrowDown className="w-4 h-4 text-blue-200" />
      : <ArrowUp className="w-4 h-4 text-blue-200" />;
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Client Records</h2>
        <p className="text-sm text-gray-600 mt-1">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border border-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th 
                className="w-32 px-4 py-3 text-left font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center space-x-2">
                  <span>First Name</span>
                  {getSortIcon('firstName')}
                </div>
              </th>
              <th 
                className="w-32 px-4 py-3 text-left font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('lastName')}
              >
                <div className="flex items-center space-x-2">
                  <span>Last Name</span>
                  {getSortIcon('lastName')}
                </div>
              </th>
              <th 
                className="w-56 px-4 py-3 text-left font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-2">
                  <span>Email</span>
                  {getSortIcon('email')}
                </div>
              </th>
              <th className="w-32 px-4 py-3 text-left font-medium">Phone</th>
              <th className="w-36 px-4 py-3 text-left font-medium">Father Name</th>
              <th className="w-32 px-4 py-3 text-left font-medium">Contact No</th>
              <th className="w-64 px-4 py-3 text-left font-medium">Message</th>
              <th 
                className="w-28 px-4 py-3 text-left font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-2">
                  <span>Date Added</span>
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="w-20 px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr
                  key={item._id}
                  className={`border-t hover:bg-blue-50 transition ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-3 truncate" title={item.firstName}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate font-medium text-gray-900">{item.firstName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate" title={item.lastName}>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-gray-700">{item.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-gray-700" title={item.email}>{item.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-gray-700">{item.phoneNo}</span>
                      <ClickToCallButton 
                        phoneNumber={item.phoneNo}
                        customerName={`${item.firstName} ${item.lastName}`}
                        onCallLog={handleCallLog}
                        size="xs"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate text-gray-700" title={item.fatherName}>
                    {item.fatherName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">{item.contactNo}</span>
                      <ClickToCallButton 
                        phoneNumber={item.contactNo}
                        customerName={`${item.firstName} ${item.lastName}`}
                        onCallLog={handleCallLog}
                        size="xs"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate text-gray-700" title={item.message}>
                    {item.message}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
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
                <td
                  colSpan="9"
                  className="text-center py-8 text-gray-500"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Users className="w-12 h-12 text-gray-300" />
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-6 pb-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          <span className="text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;