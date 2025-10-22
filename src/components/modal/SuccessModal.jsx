import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ showModal, setShowModal, message, onConfirm }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Success</h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <p className="text-center text-gray-700">
            {message}
          </p>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowModal(false);
                if (onConfirm) onConfirm();
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;