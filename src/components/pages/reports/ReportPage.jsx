import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download, Calendar, Clock, FileText, FileImage, File, X } from 'lucide-react';
import ReportModal from '../../modal/ReportModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import {
  getReports as fetchReportsApi,
  createReport,
  updateReport,
  deleteReport
} from '../../utils/Api';

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  
  // Statistics state
  const [attendanceStats, setAttendanceStats] = useState({});
  
  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get user role from localStorage or cookies
  useEffect(() => {
    const role = localStorage.getItem('role') || document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1];
    setUserRole(role || '');
  }, []);

  // Fetch reports from API
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetchReportsApi();
      setReports(response.data.data || []);
      calculateAttendanceStats(response.data.data || []);
      console.log('Fetched reports:', response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (reports) => {
    const stats = {};
    
    reports.forEach(report => {
      const userId = report.userId._id || report.userId;
      const userName = report.userId?.name || report.userName;
      
      if (!stats[userId]) {
        stats[userId] = {
          name: userName,
          presentDays: 0,
          absentDays: 0,
          totalDays: 0
        };
      }
      
      // Count as present if there's a report with attendance date
      if (report.attendance?.date) {
        stats[userId].presentDays += 1;
      } else {
        stats[userId].absentDays += 1;
      }
      
      stats[userId].totalDays += 1;
    });
    
    setAttendanceStats(stats);
  };
  
  // Apply filters
  const filteredReports = reports.filter(report => {
    const reportDate = report.attendance?.date ? new Date(report.attendance.date) : null;
    const reportDay = reportDate ? reportDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() : '';
    const reportUserName = report.userId?.name || report.userName;
    
    // Date filter
    if (dateFilter && reportDate) {
      const filterDate = new Date(dateFilter);
      if (
        reportDate.getDate() !== filterDate.getDate() ||
        reportDate.getMonth() !== filterDate.getMonth() ||
        reportDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }
    
    // Day filter - match the selected day option with the report day
    if (dayFilter && reportDay.indexOf(dayFilter) === -1) {
      return false;
    }
    
    // Name filter
    if (nameFilter && reportUserName.toLowerCase().indexOf(nameFilter.toLowerCase()) === -1) {
      return false;
    }
    
    return true;
  });
  
  // Pagination calculations
  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);
  
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(item => (
                <div key={item} className="bg-white rounded-xl shadow-md p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Daily Reports</h1>
            <p className="text-gray-600 mt-2">
              Manage your daily reports and track your work progress
            </p>
          </div>
          {canCreateUpdateReports && (
            <button
              onClick={() => {
                setEditingReport(null);
                setShowModal(true);
              }}
              className="mt-4 sm:mt-0 flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Create Report</span>
            </button>
          )}
        </div>
        
        {/* Attendance Statistics */}
        {userRole === 'admin' && Object.keys(attendanceStats).length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(attendanceStats).map(([userId, stats]) => (
              <div key={userId} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">{stats.name}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-green-600">Present: {stats.presentDays} days</p>
                  <p className="text-red-600">Absent: {stats.absentDays} days</p>
                  <p className="text-gray-600">Total: {stats.totalDays} days</p>
                  <p className="text-blue-600 font-medium">
                    {stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Day</label>
            <select
              value={dayFilter}
              onChange={(e) => {
                setDayFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a day...</option>
              <option value="monday">Mon</option>
              <option value="tuesday">Tue</option>
              <option value="wednesday">Wed</option>
              <option value="thursday">Thu</option>
              <option value="friday">Fri</option>
              <option value="saturday">Sat</option>
              <option value="sunday">Sun</option>
            </select>
          </div>
          {userRole === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Name</label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                placeholder="Enter name to search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> reports
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
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                {userRole === 'admin' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? 9 : 8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                    setSelectedReport(report);
                    setShowDetailModal(true);
                  }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.userId?.name || report.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.userId?.role || report.userRole || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="line-clamp-2">{report.reportField}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
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
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {report.attendance?.date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{new Date(report.attendance.date).toLocaleDateString('en-US', { weekday: 'short' })}, {new Date(report.attendance.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {report.attendance?.morningTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>MT: {report.attendance.morningTime}</span>
                          </div>
                        )}
                        {report.attendance?.eveningTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>ET: {report.attendance.eveningTime}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.uploadFiles && report.uploadFiles.length > 0 ? (
                        <div className="space-y-1">
                          {report.uploadFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              {file.fileType?.startsWith('image/') ? (
                                <FileImage className="w-4 h-4 text-blue-600" />
                              ) : file.fileType === 'application/pdf' ? (
                                <FileText className="w-4 h-4 text-red-600" />
                              ) : (
                                <File className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="truncate max-w-[100px]" title={file.fileName}>{file.fileName}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(file.fileUrl, file.fileName);
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        'No files'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingReport(report);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
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
                            className="text-red-600 hover:text-red-900 transition-colors"
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
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Report Details</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReport(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedReport.userId?.name || selectedReport.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedReport.userEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-gray-900">{selectedReport.userId?.role || selectedReport.userRole || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.reportField}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                {selectedReport.linkField ? (
                  <a 
                    href={selectedReport.linkField} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {selectedReport.linkField}
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
                <div className="space-y-1">
                  {selectedReport.attendance?.date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(selectedReport.attendance.date).toLocaleDateString('en-US', { weekday: 'short' })}, {new Date(selectedReport.attendance.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedReport.attendance?.morningTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>MT: {selectedReport.attendance.morningTime}</span>
                    </div>
                  )}
                  {selectedReport.attendance?.eveningTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>ET: {selectedReport.attendance.eveningTime}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Files</label>
                {selectedReport.uploadFiles && selectedReport.uploadFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedReport.uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {file.fileType?.startsWith('image/') ? (
                          <FileImage className="w-4 h-4 text-blue-600" />
                        ) : file.fileType === 'application/pdf' ? (
                          <FileText className="w-4 h-4 text-red-600" />
                        ) : (
                          <File className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="truncate max-w-[200px]" title={file.fileName}>{file.fileName}</span>
                        <button
                          onClick={() => handleDownloadFile(file.fileUrl, file.fileName)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-900">No files</p>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;