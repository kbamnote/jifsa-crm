import React from "react";
import { Database, User, Mail, Phone, MessageSquare, Calendar, BookOpen, FileText, Image as ImageIcon, Eye } from "lucide-react";

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

  // Determine data type
  const isBimData = selectedRecord.source === 'bim' || selectedRecord.course;
  const isPaymentData = selectedRecord.uploadImg !== undefined;
  const isPDF = (url) => url?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isPaymentData ? (
                <FileText className="w-5 h-5 text-purple-600" />
              ) : isBimData ? (
                <Database className="w-5 h-5 text-blue-600" />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                {isPaymentData ? 'Payment Document Details' : 'Elite Client Details'}
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
          {/* Payment Data Display */}
          {isPaymentData ? (
            <>
              <div className="mb-6">
                {isPDF(selectedRecord.uploadImg) ? (
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-12 text-center">
                    <FileText className="w-20 h-20 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold mb-4">PDF Document</p>
                    <a
                      href={selectedRecord.uploadImg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Eye className="w-5 h-5" />
                      Open PDF
                    </a>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={selectedRecord.uploadImg}
                      alt={selectedRecord.name}
                      className="w-full max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Document Name</label>
                  <p className="text-lg font-bold text-gray-800">{selectedRecord.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Details</label>
                  <p className="text-gray-700">{selectedRecord.details}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Upload Date
                  </label>
                  <p className="text-gray-700">{formatDate(selectedRecord.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Document Type</label>
                  {isPDF(selectedRecord.uploadImg) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FileText className="w-3 h-3 mr-1" />
                      PDF Document
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Image
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Client Data Display (Original) */
            <>
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone No.</label>
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
                    Date Posted
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
            </>
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