import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download, Calendar, Clock, FileText, FileImage, File, X, ChevronDown, ChevronRight, Users, UserCircle, BarChart3, User, Link as LinkIcon, BarChart3 as BarChart3Icon } from 'lucide-react';
import ReportModal from '../../modal/ReportModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import AttendanceStatsModal from '../../modal/AttendanceStatsModal';
import {
  getReports as fetchReportsApi,
  createReport,
  updateReport,
  deleteReport,
  getAttendanceStats as getAttendanceStatsApi
} from '../../utils/Api';

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [nameFilter, setNameFilter] = useState(''); // Changed to be used as a dropdown option
  
  // Statistics state
  const [attendanceStats, setAttendanceStats] = useState({});
  
  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Accordion state for attendance stats
  const [expandedUsers, setExpandedUsers] = useState({});
  
  // Attendance stats modal state
  const [showAttendanceStatsModal, setShowAttendanceStatsModal] = useState(false);
  
  // Pagination state - Updated to support backend pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Get user role from localStorage or cookies
  useEffect(() => {
    const role = localStorage.getItem('role') || document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1];
    setUserRole(role || '');
  }, []);

  // Fetch reports and attendance stats from API
  useEffect(() => {
    const fetchData = async () => {
      // Only show loading indicator for reports initially
      setLoading(true);
      await Promise.allSettled([
        fetchReports(),
        fetchAttendanceStats()
      ]);
      // Set loading to false after reports are loaded
      // Stats can load in background
    };
    
    fetchData();
  }, [currentPage, itemsPerPage, dateFilter, dayFilter, nameFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (dateFilter) {
        filters.startDate = dateFilter;
        filters.endDate = dateFilter; // Same date for both if only date filter is applied
      }
      if (nameFilter) {
        filters.userName = nameFilter;
      }
      if (dayFilter) {
        filters.day = dayFilter;
      }
      
      const response = await fetchReportsApi(currentPage, itemsPerPage, filters);
      setReports(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
      console.log('Fetched reports:', response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAttendanceStats = async () => {
    try {
      setLoadingStats(true);
      const response = await getAttendanceStatsApi();
      setAttendanceStats(response.data.data || {});
      console.log('Fetched attendance stats:', response.data.data);
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };


  
  // Since we're using backend pagination, we don't need client-side filtering and pagination
  // The reports state already contains the paginated results from the backend
  const paginatedReports = reports;
  
  const handleCreateReport = async (formData) => {
    try {
      const response = await createReport(formData);
      setReports(prev => [response.data.data, ...prev]);
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to create report');
      console.error('Error creating report:', err);
    }
  };

  const handleUpdateReport = async (formData, reportId) => {
    try {
      const response = await updateReport(reportId, formData);
      setReports(prev => prev.map(report => 
        report._id === reportId ? response.data.data : report
      ));
      setShowModal(false);
      setEditingReport(null);
    } catch (err) {
      setError(err.message || 'Failed to update report');
      console.error('Error updating report:', err);
    }
  };

  const handleDeleteReport = async (reportId) => {
    // Open the confirmation modal instead of using window.confirm
    const report = reports.find(r => r._id === reportId);
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDeleteReport = async () => {
    try {
      await deleteReport(reportToDelete._id);
      setReports(prev => prev.filter(report => report._id !== reportToDelete._id));
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete report');
      console.error('Error deleting report:', err);
      setShowDeleteModal(false);
      setReportToDelete(null);
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canCreateUpdateReports = ['admin', 'developer', 'analyst', 'marketing', 'sales', 'counsellor', 'telecaller'].includes(userRole);
  const canDeleteReports = userRole === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header Loading */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-lg w-40"></div>
            </div>
          </div>
          
          {/* Attendance Stats Loading */}
          <div className="mb-8 border rounded-xl overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="h-6 bg-gray-200 rounded w-64 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="p-4 bg-white">
              <div className="mb-3 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters Loading */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          
          {/* Pagination Loading */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-16 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>
          
          {/* Table Loading */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Daily Reports</h1>
              <p className="text-gray-600 mt-1 sm:mt-2">Manage your daily reports and track your work progress</p>
            </div>
            {canCreateUpdateReports && (
              <button
                onClick={() => {
                  setEditingReport(null);
                  setShowModal(true);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Create Report</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Attendance Statistics Button */}
        {userRole === 'admin' && Object.keys(attendanceStats).length > 0 && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Attendance Overview
                </h2>
                <p className="text-gray-600 mt-1">{Object.keys(attendanceStats).length} users tracked</p>
              </div>
              <button
                onClick={() => setShowAttendanceStatsModal(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">View Attendance Stats</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day</label>
            <select
              value={dayFilter}
              onChange={(e) => {
                setDayFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
            >
              <option value="">Select a day...</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
          {userRole === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Name</label>
              <select
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
              >
                <option value="">All Names</option>
                {Array.from(new Set(reports.map(report => report.userId?.name || (report.userName && report.userName.split('@')[0])))).filter(Boolean).map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}
        
        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> reports
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
        
        {/* Reports Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Report</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Link</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Attendance</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
                {userRole === 'admin' && (
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? 7 : 6} className="px-6 py-12 text-center text-base text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p>No reports found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new report</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr key={report._id} className="hover:bg-blue-50 cursor-pointer transition-colors duration-200" onClick={() => {
                    setSelectedReport(report);
                    setShowDetailModal(true);
                  }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.userId?.name || report.userName?.split('@')[0] || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {report.userId?.role || report.userRole || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <div className="line-clamp-2">{report.reportField}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {report.linkField ? (
                        <a 
                          href={report.linkField} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Link
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="space-y-1">
                        {report.attendance?.date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{new Date(report.attendance.date).toLocaleDateString('en-US', { weekday: 'short' })}, {new Date(report.attendance.date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                  })}</span>
                          </div>
                        )}
                        {report.attendance?.morningTime && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span>MT: {report.attendance.morningTime}</span>
                          </div>
                        )}
                        {report.attendance?.eveningTime && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span>ET: {report.attendance.eveningTime}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingReport(report);
                              setShowModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-100"
                            title="Edit Report"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Set the report to delete and open confirmation modal
                              setReportToDelete(report);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-100"
                            title="Delete Report"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {showModal && (
        <ReportModal
          showModal={showModal}
          setShowModal={setShowModal}
          onSubmit={editingReport ? handleUpdateReport : handleCreateReport}
          initialData={editingReport}
          isEditMode={!!editingReport}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          onConfirm={confirmDeleteReport}
          itemName={`report by ${reportToDelete?.userName || 'unknown user'}`}
        />
      )}
      
      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Report Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReport(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <UserCircle className="w-4 h-4 text-blue-500" />
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">{selectedReport.userId?.name || selectedReport.userName?.split('@')[0] || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <User className="w-4 h-4 text-purple-500" />
                    Role
                  </label>
                  <p className="text-gray-900 font-medium">{selectedReport.userId?.role || selectedReport.userRole || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-green-500" />
                    Created At
                  </label>
                  <p className="text-gray-900">{new Date(selectedReport.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Report
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-line">{selectedReport.reportField}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  Link
                </label>
                {selectedReport.linkField ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <a 
                      href={selectedReport.linkField} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                    >
                      {selectedReport.linkField}
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-500">
                    N/A
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Attendance
                </label>
                <div className="space-y-2">
                  {selectedReport.attendance?.date && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{new Date(selectedReport.attendance.date).toLocaleDateString('en-US', { weekday: 'short' })}, {new Date(selectedReport.attendance.date).toLocaleDateString('en-IN', {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric',
                                            })}</span>
                    </div>
                  )}
                  {selectedReport.attendance?.morningTime && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">Morning Time: {selectedReport.attendance.morningTime}</span>
                    </div>
                  )}
                  {selectedReport.attendance?.eveningTime && (
                    <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700">Evening Time: {selectedReport.attendance.eveningTime}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FileImage className="w-4 h-4 text-gray-500" />
                  Files
                </label>
                {selectedReport.uploadFiles && selectedReport.uploadFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedReport.uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {file.fileType?.startsWith('image/') ? (
                          <FileImage className="w-5 h-5 text-blue-500" />
                        ) : file.fileType === 'application/pdf' ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <File className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="truncate max-w-[200px] font-medium" title={file.fileName}>{file.fileName}</span>
                        <button
                          onClick={() => handleDownloadFile(file.fileUrl, file.fileName)}
                          className="ml-auto text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-100"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-500">
                    No files attached
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Attendance Stats Modal */}
      <AttendanceStatsModal
        showModal={showAttendanceStatsModal}
        setShowModal={setShowAttendanceStatsModal}
        attendanceStats={attendanceStats}
        expandedUsers={expandedUsers}
        setExpandedUsers={setExpandedUsers}
      />
    </div>
  );
};

export default ReportPage;