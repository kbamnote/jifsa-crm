import React from 'react';
import { X, Users, UserCircle, BarChart3, Calendar, Clock } from 'lucide-react';

const AttendanceStatsModal = ({ 
  showModal, 
  setShowModal, 
  attendanceStats = {},
  expandedUsers = {},
  setExpandedUsers = () => {}
}) => {
  // Function to toggle expansion of a specific user
  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Function to toggle expansion of all users
  const toggleExpandAll = () => {
    const allExpanded = Object.values(expandedUsers).every(v => v);
    const newExpandedState = {};
    Object.keys(attendanceStats).forEach(userId => {
      newExpandedState[userId] = !allExpanded;
    });
    setExpandedUsers(newExpandedState);
  };

  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={() => setShowModal(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Attendance Statistics
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Expand/Collapse All Button */}
          <div className="mb-4">
            <button
              onClick={toggleExpandAll}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              {Object.values(expandedUsers).every(v => v) ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
          
          {/* Attendance Stats List */}
          {Object.keys(attendanceStats).length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No attendance statistics available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(attendanceStats).map(([userId, stats]) => {
                const isExpanded = expandedUsers[userId] || false;
                
                return (
                  <div key={userId} className="border rounded-lg overflow-hidden">
                    <div 
                      className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors"
                      onClick={() => toggleUserExpansion(userId)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">
                          {stats.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{stats.name}</h4>
                          <p className="text-xs text-gray-600">{stats.totalDays} days tracked</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}%</p>
                          <p className="text-xs text-gray-500">Attendance</p>
                        </div>
                        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          {isExpanded ? (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="font-medium text-green-800">Present Days</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700 text-center">{stats.presentDays}</p>
                            <p className="text-xs text-green-600 text-center mt-1">days</p>
                          </div>
                          
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-red-600" />
                              </div>
                              <span className="font-medium text-red-800">Absent Days</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700 text-center">{stats.absentDays}</p>
                            <p className="text-xs text-red-600 text-center mt-1">days</p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="font-medium text-blue-800">Total Days</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700 text-center">{stats.totalDays}</p>
                            <p className="text-xs text-blue-600 text-center mt-1">overall</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${stats.totalDays > 0 ? (stats.presentDays / stats.totalDays) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Attendance Rate</span>
                            <span>{stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatsModal;