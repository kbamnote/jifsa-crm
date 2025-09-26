import React from "react";

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Client Details</h3>
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
              <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
              <p className="text-gray-900 font-medium">{selectedRecord.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
              <p className="text-gray-900 font-medium">{selectedRecord.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-blue-600">{selectedRecord.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <p className="text-gray-900">{selectedRecord.phoneNo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Father Name</label>
              <p className="text-gray-900">{selectedRecord.fatherName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contact No</label>
              <p className="text-gray-900">{selectedRecord.contactNo}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Message</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900">{selectedRecord.message}</p>
            </div>
          </div>
          
          {selectedRecord.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date Created</label>
              <p className="text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
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