import React from "react";
import { Database, User, Mail, Phone, MessageSquare, Calendar, BookOpen } from "lucide-react";

const ClientModal = ({ showModal, selectedRecord, setShowModal }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!showModal || !selectedRecord) return null;

  // Determine if this is BIM data based on the source field or presence of BIM-specific fields
  const isBimData = selectedRecord.source === 'bim' || selectedRecord.course;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isBimData ? (
                <Database className="w-5 h-5 text-blue-600" />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                Elite Client Details
              </h3>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <p className="text-gray-900 font-medium">{selectedRecord.fullName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-blue-600">{selectedRecord.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <p className="text-gray-900">{selectedRecord.phoneNo}</p>
            </div>
            
            {isBimData ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Course</label>
                  <p className="text-gray-900">{selectedRecord.course || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Contact No</label>
                  <p className="text-gray-900">{selectedRecord.contactNo}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Father Name</label>
                  <p className="text-gray-900">{selectedRecord.fatherName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Contact No</label>
                  <p className="text-gray-900">{selectedRecord.contactNo}</p>
                </div>
              </>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              Message
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900">{selectedRecord.message}</p>
            </div>
          </div>
          
          {selectedRecord.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Date Created
              </label>
              <p className="text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
            </div>
          )}
          
          {isBimData && selectedRecord.source && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                <Database className="w-4 h-4 mr-1" />
                Data Source
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Elite BIM
              </span>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;