import React from "react";
import { FaTimes, FaBuilding, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, FaClock, FaImage, FaEdit } from "react-icons/fa";

const B2BDetailsModal = ({ showModal, selectedRecord, setShowModal, onEdit }) => {
  if (!showModal || !selectedRecord) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      'inactive': { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' }
    };

    // If status is not in our predefined config, create a default badge
    if (!status || !statusConfig[status.toLowerCase()]) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {status || 'N/A'}
        </span>
      );
    }

    const config = statusConfig[status.toLowerCase()];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 backdrop:blur-lg bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">B2B Record Details</h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Image and Basic Info */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex flex-col items-center">
                  {selectedRecord.image ? (
                    <img 
                      src={selectedRecord.image} 
                      alt={selectedRecord.instituteName}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <FaBuilding className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-800 text-center">
                    {selectedRecord.instituteName}
                  </h3>
                  <p className="text-gray-600 mt-1 text-center">
                    {selectedRecord.clientName}
                  </p>
                  <div className="mt-3">
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Added By</h4>
                <div className="flex items-center mb-2">
                  <FaUser className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{selectedRecord.createdBy}</span>
                </div>
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-700 capitalize">{selectedRecord.creatorRole}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:w-2/3">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Institute Information</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Institute Name</div>
                    <div className="w-2/3 font-medium">{selectedRecord.instituteName || 'N/A'}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Client Name</div>
                    <div className="w-2/3 font-medium">{selectedRecord.clientName || 'N/A'}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Email</div>
                    <div className="w-2/3 font-medium">
                      {selectedRecord.instituteEmail ? (
                        <a href={`mailto:${selectedRecord.instituteEmail}`} className="text-blue-600 hover:underline">
                          {selectedRecord.instituteEmail}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Phone</div>
                    <div className="w-2/3 font-medium">
                      {selectedRecord.phoneNo ? (
                        <a href={`tel:${selectedRecord.phoneNo}`} className="text-blue-600 hover:underline">
                          {selectedRecord.phoneNo}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Location</div>
                    <div className="w-2/3 font-medium">{selectedRecord.location || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Visit Information</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Visiting Date</div>
                    <div className="w-2/3 font-medium flex items-center">
                      <FaCalendar className="w-4 h-4 text-gray-500 mr-2" />
                      {formatDate(selectedRecord.visitingDate)}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Visiting Time</div>
                    <div className="w-2/3 font-medium flex items-center">
                      <FaClock className="w-4 h-4 text-gray-500 mr-2" />
                      {formatTime(selectedRecord.visitingTime)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Updated At</div>
                    <div className="w-2/3 font-medium">
                      {formatDate(selectedRecord.createdAt)}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600">Last Updated</div>
                    <div className="w-2/3 font-medium">
                      {formatDate(selectedRecord.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={() => onEdit(selectedRecord)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <FaEdit className="w-4 h-4" />
            <span>Edit Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default B2BDetailsModal;