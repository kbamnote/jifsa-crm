import React from 'react';
import { X } from 'lucide-react';

const AssignmentModal = ({ 
  showModal, 
  setShowModal, 
  leadToAssign, 
  selectedMember, 
  setSelectedMember, 
  isAssigning, 
  userRole, 
  getFilteredTeamMembers, 
  handleCloseAssignmentModal, 
  handleAssignLead 
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {userRole.toLowerCase() === 'counsellor' ? 'Assign Lead to Telecaller' : 'Assign Lead'}
            </h3>
            <button
              onClick={handleCloseAssignmentModal}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              disabled={isAssigning}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Assigning lead:</p>
            <p className="font-semibold text-gray-900">{leadToAssign?.fullName || 'N/A'}</p>
            <p className="text-sm text-gray-600">{leadToAssign?.email || 'N/A'}</p>
          </div>

          {/* Show current assignment if exists */}
          {leadToAssign?.assignedTo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Currently assigned to:{' '}
                <span className="font-semibold">
                  {typeof leadToAssign.assignedTo === 'string'
                    ? leadToAssign.assignedTo
                    : (leadToAssign.assignedTo?.name || leadToAssign.assignedTo?.email || 'N/A')}
                </span>
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {userRole.toLowerCase() === 'counsellor' ? 'Assign to Telecaller' : 'Assign to Team Member'}
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAssigning}
            >
              <option value="">Select a team member</option>
              {getFilteredTeamMembers().map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email}) [{member.role}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCloseAssignmentModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              disabled={isAssigning}
            >
              Cancel
            </button>
            <button
              onClick={handleAssignLead}
              disabled={!selectedMember || isAssigning}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isAssigning ? 'Assigning...' : (leadToAssign?.assignedTo ? 'Reassign Lead' : (userRole.toLowerCase() === 'counsellor' ? 'Assign to Telecaller' : 'Assign Lead'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;