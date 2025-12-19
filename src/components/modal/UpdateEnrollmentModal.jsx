import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, FaGraduationCap, FaCity, FaFlag, FaHashtag } from "react-icons/fa";
import { updateEnrollmentDetails, updateEnrollmentStatus } from "../utils/Api";

const UpdateEnrollmentModal = ({ showModal, setShowModal, selectedRecord, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Basic fields
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    courseName: "",
    message: "",
    productCompany: "EEE-Technologies",
    
    // Status fields
    status: "pending",
    callStatus: "not_called",
    interviewRoundStatus: "not_scheduled",
    aptitudeRoundStatus: "not_scheduled",
    hrRoundStatus: "not_scheduled",
    admissionLetter: "not_issued",
    feesStatus: "not_paid",
    paymentMethod: "other",
    feesInstallmentStructure: "one_time",
    
    // Additional info
    age: "",
    gender: "",
    location: "",
    qualification: "",
    
    // Tracking fields
    feedback: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form with existing data
  useEffect(() => {
    if (selectedRecord) {
      setFormData({
        // Basic fields
        studentName: selectedRecord.studentName || "",
        studentEmail: selectedRecord.studentEmail || "",
        studentPhone: selectedRecord.studentPhone || "",
        courseName: selectedRecord.courseName || "",
        message: selectedRecord.message || "",
        productCompany: selectedRecord.productCompany || "EEE-Technologies",
        
        // Status fields
        status: selectedRecord.status || "pending",
        callStatus: selectedRecord.callStatus || "not_called",
        interviewRoundStatus: selectedRecord.interviewRoundStatus || "not_scheduled",
        aptitudeRoundStatus: selectedRecord.aptitudeRoundStatus || "not_scheduled",
        hrRoundStatus: selectedRecord.hrRoundStatus || "not_scheduled",
        admissionLetter: selectedRecord.admissionLetter || "not_issued",
        feesStatus: selectedRecord.feesStatus || "not_paid",
        paymentMethod: selectedRecord.paymentMethod || "other",
        feesInstallmentStructure: selectedRecord.feesInstallmentStructure || "one_time",
        
        // Additional info
        age: selectedRecord.age || "",
        gender: selectedRecord.gender || "",
        location: selectedRecord.location || "",
        qualification: selectedRecord.qualification || "",
        
        // Tracking fields
        feedback: selectedRecord.feedback || "",
        city: selectedRecord.city || "",
        state: selectedRecord.state || "",
        pincode: selectedRecord.pincode || ""
      });
    }
  }, [selectedRecord]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare data - remove empty fields
      const submitData = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});

      // Separate status fields from other details
      const statusFields = [
        'status', 'callStatus', 'interviewRoundStatus', 'aptitudeRoundStatus', 
        'hrRoundStatus', 'admissionLetter', 'feesStatus', 'paymentMethod', 'feesInstallmentStructure'
      ];
      
      const statusData = {};
      const detailsData = {};
      
      Object.keys(submitData).forEach(key => {
        if (statusFields.includes(key)) {
          statusData[key] = submitData[key];
        } else {
          detailsData[key] = submitData[key];
        }
      });

      // Update status fields
      if (Object.keys(statusData).length > 0) {
        await updateEnrollmentStatus(selectedRecord._id, statusData);
      }

      // Update other details
      if (Object.keys(detailsData).length > 0) {
        await updateEnrollmentDetails(selectedRecord._id, detailsData);
      }

      onSuccess();
    } catch (err) {
      console.error("Error updating enrollment:", err);
      setError(err.response?.data?.message || "Failed to update enrollment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal || !selectedRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Update Enrollment</h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Status Update */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Enrollment Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="productCompany"
                  value={formData.productCompany}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="JIFSA">JIFSA</option>
                  <option value="Elite-BIM">Elite BIM</option>
                  <option value="Elite-BIFS">Elite BIFS</option>
                  <option value="EEE-Technologies">EEE Technologies</option>
                  <option value="Elite-Jobs">Elite Jobs</option>
                  <option value="Elite-Cards">Elite Cards</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Status
                </label>
                <select
                  name="callStatus"
                  value={formData.callStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not_called">Not Called</option>
                  <option value="called">Called</option>
                  <option value="follow_up_required">Follow Up Required</option>
                  <option value="not_reachable">Not Reachable</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Round Status
                </label>
                <select
                  name="interviewRoundStatus"
                  value={formData.interviewRoundStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aptitude Round Status
                </label>
                <select
                  name="aptitudeRoundStatus"
                  value={formData.aptitudeRoundStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HR Round Status
                </label>
                <select
                  name="hrRoundStatus"
                  value={formData.hrRoundStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not_scheduled">Not Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Letter
                </label>
                <select
                  name="admissionLetter"
                  value={formData.admissionLetter}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not_issued">Not Issued</option>
                  <option value="issued">Issued</option>
                  <option value="received">Received</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fees Status
                </label>
                <select
                  name="feesStatus"
                  value={formData.feesStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not_paid">Not Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="other">Other</option>
                  <option value="UPI">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fees Installment Structure
                </label>
                <select
                  name="feesInstallmentStructure"
                  value={formData.feesInstallmentStructure}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="one_time">One Time</option>
                  <option value="two_installments">Two Installments</option>
                  <option value="three_installments">Three Installments</option>
                  <option value="four_installments">Four Installments</option>
                  <option value="EMI">EMI</option>
                  <option value="Loan">Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-indigo-600" />
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="studentPhone"
                  value={formData.studentPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter course name"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-indigo-600" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter qualification"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaEnvelope className="mr-2 text-indigo-600" />
              Message
            </h3>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter message"
            ></textarea>
          </div>

          {/* Tracking Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-indigo-600" />
              Tracking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter feedback"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEnrollmentModal;