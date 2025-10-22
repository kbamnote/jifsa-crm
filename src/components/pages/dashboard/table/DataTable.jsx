import React from "react";
import { FaEdit, FaEye, FaTrash, FaFileExport } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  handleEditLead,
  handleDeleteLead,
  setCurrentPage,
  userRole,
}) => {
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg
          className="w-4 h-4 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg
        className="w-4 h-4 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      unread: { bg: "bg-gray-100", text: "text-gray-800", label: "Unread" },
      read: { bg: "bg-blue-100", text: "text-blue-800", label: "Read" },
      interested: { bg: "bg-green-100", text: "text-green-800", label: "Interested" },
      not_interested: { bg: "bg-red-100", text: "text-red-800", label: "Not Interested" },
    };

    const config = statusConfig[status] || statusConfig["unread"];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // 🧾 EXPORT TO EXCEL FUNCTION
 const exportToExcel = () => {
  const exportData = filteredData.map((lead, index) => ({
    "Sr No.": index + 1,
    Name: lead.fullName || "N/A",
    Email: lead.email || "N/A",
    Phone: lead.phoneNo || "N/A",
    Message: lead.message || "N/A",
    Product: lead.productCompany || "N/A",
    Status: lead.status || "N/A",
    Source: lead.source || "N/A",
    "Assigned To":
      typeof lead.assignedTo === "object"
        ? lead.assignedTo?.name
          ? `${lead.assignedTo.name} (${lead.assignedTo.email})`
          : lead.assignedTo?.email || "N/A"
        : lead.assignedTo || "N/A",
    "Assigned By": lead.assignedByName || "N/A",
    "Created By":
      lead.createdBy?.name
        ? `${lead.createdBy.name} (${lead.createdBy.email})`
        : lead.createdBy?.email || "N/A",
    "Created At": new Date(lead.createdAt).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    "Updated At": new Date(lead.updatedAt).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    ID: lead._id,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });
  saveAs(blob, `Leads_Full_Data_${new Date().toISOString().split("T")[0]}.xlsx`);
};


  // Role-based permissions
  const canEditLeads = ["admin", "manager"].includes(userRole);
  const canEditOwnLeads = userRole === "sales";
  const canDeleteLeads = userRole === "admin";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Lead Records</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} total leads
            </p>
          </div>

          {/* 🧩 Export Button */}
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md"
          >
            <FaFileExport className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Table Section (same as before) */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Sr. No
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort("fullName")}
              >
                <div className="flex items-center">
                  Name
                  {getSortIcon("fullName")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort("phoneNo")}
              >
                <div className="flex items-center">
                  Phone No.
                  {getSortIcon("phoneNo")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Date
                  {getSortIcon("createdAt")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {item.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">{item.fullName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.phoneNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.assignedTo
                      ? typeof item.assignedTo === "string"
                        ? item.assignedTo
                        : item.assignedTo?.name || item.assignedTo?.email
                      : "Not Assigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaEye />
                      </button>
                      {(canEditLeads || canEditOwnLeads) && (
                        <button
                          onClick={() => handleEditLead(item)}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {canDeleteLeads && (
                        <button
                          onClick={() => handleDeleteLead(item._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                  No leads available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
