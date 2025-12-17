import React, { useState } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, FaGraduationCap } from "react-icons/fa";
import { addDetail } from "../utils/Api";

const AddLeadModal = ({ showModal, setShowModal, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    alternatePhoneNo: "",
    age: "",
    dob: "",
    address: "",
    message: "",
    fatherName: "",
    contactNo: "",
    experience: "",
    specialisation: "",
    highestDegree: "",
    collegeOrInstituteName: "",
    schoolName: "",
    productCompany: "jifsa",
    callStatus: "not_called",
    interviewRoundStatus: "not_scheduled",
    aptitudeRoundStatus: "not_scheduled",
    hrRoundStatus: "not_scheduled",
    admissionLetter: "not_issued",
    feesStatus: "not_paid",
    paymentMethod: "other",
    feesInstallmentStructure: "one_time"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      await addDetail(submitData);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNo: "",
        alternatePhoneNo: "",
        age: "",
        dob: "",
        address: "",
        message: "",
        fatherName: "",
        contactNo: "",
        experience: "",
        specialisation: "",
        highestDegree: "",
        collegeOrInstituteName: "",
        schoolName: "",
        productCompany: "jifsa",
        callStatus: "not_called",
        interviewRoundStatus: "not_scheduled",
        aptitudeRoundStatus: "not_scheduled",
        hrRoundStatus: "not_scheduled",
        admissionLetter: "not_issued",
        feesStatus: "not_paid",
        paymentMethod: "other",
        feesInstallmentStructure: "one_time"
      });

      onSuccess();
    } catch (err) {
      console.error("Error adding lead:", err);
      setError(err.response?.data?.message || "Failed to add lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 backdrop:blur-lg bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Add New Lead</h2>
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

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Phone Number
                </label>
                <input
                  type="tel"
                  name="alternatePhoneNo"
                  value={formData.alternatePhoneNo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Alternate phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="jifsa">JIFSA</option>
                  <option value="bim">Elite BIM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Family Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter father's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Contact number"
                />
              </div>
            </div>
          </div>

          {/* Education Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-600" />
              Education & Experience
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Degree
                </label>
                <input
                  type="text"
                  name="highestDegree"
                  value={formData.highestDegree}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Bachelor's, Master's"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialisation
                </label>
                <input
                  type="text"
                  name="specialisation"
                  value={formData.specialisation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Field of specialisation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College/Institute Name
                </label>
                <input
                  type="text"
                  name="collegeOrInstituteName"
                  value={formData.collegeOrInstituteName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="College or institute name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="School name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Years of experience or brief description"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message/Notes
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Any additional notes or messages..."
              />
            </div>
          </div>

          {/* CRM Process Fields */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              CRM Process Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Lead"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;