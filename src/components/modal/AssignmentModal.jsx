import React from 'react';
import { X } from 'lucide-react';

const AssignmentModal = ({
  showModal,
  setShowModal,
  itemToAssign,
  itemType, // 'lead' or 'enrollment'
  teamMembers,
  selectedMember,
  setSelectedMember,
  onAssign,
  isAssigning,
  userRole
}) => {
  if (!showModal) return null;

  // Filter team members based on user role
  const filteredMembers = teamMembers.filter(member => {
    // Admin can assign to any team member except admin
    if (userRole.toLowerCase() === 'admin') {
      return member.role !== 'admin';
    }
    // Counsellor can only assign to telecaller
    else if (userRole.toLowerCase() === 'counsellor') {
      return member.role === 'telecaller';
    }
    // Other roles can assign to sales
    else {
      return member.role === 'sales';
    }
  });

  const getItemTitle = () => {
    if (itemType === 'lead') {
      return itemToAssign?.fullName || 'N/A';
    } else {
      return itemToAssign?.studentName || 'N/A';
    }
  };

  const getItemSubtitle = () => {
    if (itemType === 'lead') {
      return itemToAssign?.email || 'N/A';
    } else {
      return itemToAssign?.courseName || 'N/A';
    }
  };

  const getAssignmentLabel = () => {
    if (userRole.toLowerCase() === 'counsellor') {
      return 'Assign to Telecaller';
    } else if (itemType === 'lead') {
      return itemToAssign?.assignedTo ? 'Reassign Lead' : 'Assign Lead';
    } else {
      return itemToAssign?.assignedTo ? 'Reassign Enrollment' : 'Assign Enrollment';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            {userRole.toLowerCase() === 'counsellor' ? 'Assign to Telecaller' : `Assign ${itemType === 'lead' ? 'Lead' : 'Enrollment'}`}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700">Assigning {itemType}: {getItemTitle()}</p>
            <p className="text-sm text-gray-600">{getItemSubtitle()}</p>
          </div>
          
          {/* Show current assignment if exists */}
          {itemToAssign?.assignedTo && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Currently assigned to: <span className="font-semibold">
                  {typeof itemToAssign.assignedTo === 'string'
                    ? (itemToAssign.assignedToName || itemToAssign.assignedTo)
                    : (itemToAssign.assignedTo?.name || itemToAssign.assignedTo?.email || itemToAssign.assignedTo || 'N/A')}
                </span>
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {userRole.toLowerCase() === 'counsellor' ? 'Assign to Telecaller' : 'Assign to Team Member'}
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isAssigning}
            >
              <option value="">Select a team member</option>
              {filteredMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email}) [{member.role}]
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isAssigning}
            >
              Cancel
            </button>
            <button
              onClick={onAssign}
              disabled={!selectedMember || isAssigning}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Assigning...' : getAssignmentLabel()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;