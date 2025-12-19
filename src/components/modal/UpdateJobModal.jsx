import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaGraduationCap, FaBriefcase, FaCalendarAlt, FaPhone, FaGlobe } from "react-icons/fa";

const UpdateJobModal = ({ showModal, setShowModal, selectedJob, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Basic job information
    "Job Title": "",
    "Job Description": "",
    "Job Type": "",
    "Experience Level": "",
    "Min Education": "",
    "Category": "",
    "Openings": "",
    "Notice Period": "",
    "Year of Passing": "",
    "Direct Link": "",
    "Work Type": "",
    "Interview Type": "",
    
    // Company information
    "Company Name": "",
    "Company Website": "",
    "Company Description": "",
    
    // Location
    "Location": "",
    
    // Salary
    "Salary Min (₹)": "",
    "Salary Max (₹)": "",
    
    // Status fields
    "Status": "",
    "Call Status": "",
    
    // Additional fields
    "Skills": "",
    "Requirements": "",
    "Responsibilities": ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form with existing data
  useEffect(() => {
    if (selectedJob) {
      setFormData({
        "Job Title": selectedJob["Job Title"] || "",
        "Job Description": selectedJob["Job Description"] || "",
        "Job Type": selectedJob["Job Type"] || "",
        "Experience Level": selectedJob["Experience Level"] || "",
        "Min Education": selectedJob["Min Education"] || "",
        "Category": selectedJob["Category"] || "",
        "Openings": selectedJob["Openings"] || "",
        "Notice Period": selectedJob["Notice Period"] || "",
        "Year of Passing": selectedJob["Year of Passing"] || "",
        "Direct Link": selectedJob["Direct Link"] || "",
        "Work Type": selectedJob["Work Type"] || "",
        "Interview Type": selectedJob["Interview Type"] || "",
        "Company Name": selectedJob["Company Name"] || "",
        "Company Website": selectedJob["Company Website"] || "",
        "Company Description": selectedJob["Company Description"] || "",
        "Location": Array.isArray(selectedJob["Location"]) ? selectedJob["Location"].join(", ") : selectedJob["Location"] || "",
        "Salary Min (₹)": selectedJob["Salary Min (₹)"] || "",
        "Salary Max (₹)": selectedJob["Salary Max (₹)"] || "",
        "Status": selectedJob["Status"] || "",
        "Call Status": selectedJob["Call Status"] || "",
        "Skills": Array.isArray(selectedJob["Skills"]) ? selectedJob["Skills"].join(", ") : selectedJob["Skills"] || "",
        "Requirements": Array.isArray(selectedJob["Requirements"]) ? selectedJob["Requirements"].join(", ") : selectedJob["Requirements"] || "",
        "Responsibilities": Array.isArray(selectedJob["Responsibilities"]) ? selectedJob["Responsibilities"].join(", ") : selectedJob["Responsibilities"] || ""
      });
    }
  }, [selectedJob]);

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
      // Prepare data - convert comma-separated values back to arrays where appropriate
      const submitData = { ...formData };
      
      // Convert location to array if it contains commas
      if (submitData["Location"] && submitData["Location"].includes(",")) {
        submitData["Location"] = submitData["Location"].split(",").map(item => item.trim());
      }
      
      // Convert skills to array if it contains commas
      if (submitData["Skills"] && submitData["Skills"].includes(",")) {
        submitData["Skills"] = submitData["Skills"].split(",").map(item => item.trim());
      }
      
      // Convert requirements to array if it contains commas
      if (submitData["Requirements"] && submitData["Requirements"].includes(",")) {
        submitData["Requirements"] = submitData["Requirements"].split(",").map(item => item.trim());
      }
      
      // Convert responsibilities to array if it contains commas
      if (submitData["Responsibilities"] && submitData["Responsibilities"].includes(",")) {
        submitData["Responsibilities"] = submitData["Responsibilities"].split(",").map(item => item.trim());
      }

      await onSuccess(submitData);
    } catch (err) {
      console.error("Error updating job:", err);
      setError("Failed to update job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal || !selectedJob) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Update Job Details</h2>
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

          {/* Job Status */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Job Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="Status"
                  value={formData["Status"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="on hold">On Hold</option>
                  <option value="filled">Filled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Status
                </label>
                <select
                  name="Call Status"
                  value={formData["Call Status"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Call Status</option>
                  <option value="not_called">Not Called</option>
                  <option value="called">Called</option>
                  <option value="follow_up_required">Follow Up Required</option>
                  <option value="not_reachable">Not Reachable</option>
                </select>
              </div>
            </div>
          </div>
          {/* Basic Job Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaBriefcase className="mr-2 text-blue-600" />
              Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="Job Title"
                  value={formData["Job Title"]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="Category"
                  value={formData["Category"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter job category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <input
                  type="text"
                  name="Job Type"
                  value={formData["Job Type"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Full-time, Part-time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <input
                  type="text"
                  name="Experience Level"
                  value={formData["Experience Level"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 1-3 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Education
                </label>
                <input
                  type="text"
                  name="Min Education"
                  value={formData["Min Education"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Bachelor's Degree"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Openings
                </label>
                <input
                  type="number"
                  name="Openings"
                  value={formData["Openings"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Number of openings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Period
                </label>
                <input
                  type="text"
                  name="Notice Period"
                  value={formData["Notice Period"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 30 days"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Passing
                </label>
                <input
                  type="text"
                  name="Year of Passing"
                  value={formData["Year of Passing"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 2023-2024"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  name="Job Description"
                  value={formData["Job Description"]}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Enter detailed job description..."
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaBuilding className="mr-2 text-blue-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="Company Name"
                  value={formData["Company Name"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGlobe className="text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="Company Website"
                    value={formData["Company Website"]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  name="Company Description"
                  value={formData["Company Description"]}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Enter company description..."
                />
              </div>
            </div>
          </div>

          {/* Location & Salary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" />
              Location & Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="Location"
                  value={formData["Location"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter location(s), comma-separated for multiple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillWave className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="Salary Min (₹)"
                    value={formData["Salary Min (₹)"]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., ₹15,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillWave className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="Salary Max (₹)"
                    value={formData["Salary Max (₹)"]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., ₹25,000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" />
              Work Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Type
                </label>
                <input
                  type="text"
                  name="Work Type"
                  value={formData["Work Type"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Remote, On-site, Hybrid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type
                </label>
                <input
                  type="text"
                  name="Interview Type"
                  value={formData["Interview Type"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Online, In-person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Link/Contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="Direct Link"
                    value={formData["Direct Link"]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Email or contact information"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-600" />
              Skills & Requirements
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="Skills"
                  value={formData["Skills"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (comma-separated)
                </label>
                <input
                  type="text"
                  name="Requirements"
                  value={formData["Requirements"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 2+ years experience, Bachelor's degree"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities (comma-separated)
                </label>
                <input
                  type="text"
                  name="Responsibilities"
                  value={formData["Responsibilities"]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Develop web applications, Write unit tests"
                />
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
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Job"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateJobModal;