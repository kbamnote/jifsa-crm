import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, X, Info } from "lucide-react";
import { importCompaniesFromExcel, getAllCompanies } from "../../utils/Api";

const CompanyImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is Excel
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        setUploadResult({
          success: false,
          message: "Please select a valid Excel file (.xlsx or .xls)",
        });
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({
        success: false,
        message: "Please select a file first",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("excelFile", selectedFile);

      // Send request to backend
      const response = await importCompaniesFromExcel(formData);
      const result = response.data;
      console.log("Import response:", result);

      if (result.success) {
        setUploadResult({
          success: true,
          message: `Successfully imported ${result.data.length} companies`,
          errors: result.errors || []
        });
        // Refresh the company list
        fetchCompanies();
      } else {
        setUploadResult({
          success: false,
          message: result.message || "Failed to import companies",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResult({
        success: false,
        message: "An error occurred while uploading the file",
        errorDetails: error.response?.data || error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch companies from backend
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await getAllCompanies();
      const result = response.data;
      console.log("Companies response:", result);

      if (result.success) {
        setCompanies(result.data);
      } else {
        setUploadResult({
          success: false,
          message: "Failed to fetch companies",
        });
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setUploadResult({
        success: false,
        message: "An error occurred while fetching companies",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load companies on component mount
  React.useEffect(() => {
    fetchCompanies();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format array fields for display
  const formatArrayField = (array) => {
    if (!array || array.length === 0) return "N/A";
    return array.join(", ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Company Job Data</h1>
        <p className="text-gray-600 mb-8">
          Import company job data from Excel files and manage job postings
        </p>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Import Excel Data</h2>
          
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 transition-colors hover:border-blue-400">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="flex flex-col items-center">
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your Excel file here
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse files (Supports .xlsx and .xls)
              </p>
              
              <label className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </label>
              
              {selectedFile && (
                <div className="mt-4 flex items-center bg-blue-50 rounded-lg px-4 py-2">
                  <FileText className="text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`px-8 py-3 rounded-lg font-medium text-white ${
                !selectedFile || isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } transition-colors`}
            >
              {isUploading ? "Uploading..." : "Import Companies"}
            </button>
          </div>
          
          {/* Result Message */}
          {uploadResult && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                uploadResult.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <div className="flex items-start">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span>{uploadResult.message}</span>
                  
                  {/* Display errors if any */}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center text-sm font-medium">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Import Warnings:</span>
                      </div>
                      <ul className="mt-1 ml-5 list-disc text-sm">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li>+ {uploadResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {/* Display detailed error information */}
                  {uploadResult.errorDetails && (
                    <div className="mt-3 text-sm">
                      <div className="font-medium">Error Details:</div>
                      <pre className="mt-1 whitespace-pre-wrap bg-red-50 p-2 rounded">
                        {JSON.stringify(uploadResult.errorDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Company Jobs</h2>
            <button
              onClick={fetchCompanies}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No company jobs found</p>
              <p className="text-gray-400 mt-2">
                Import an Excel file to see company job data here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {company.company?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.company?.website || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.location?.join(", ") || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.jobType || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.experienceLevel || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.salary?.min && company.salary?.max 
                            ? `${company.salary.min} - ${company.salary.max} ${company.salary.currency || ''}` 
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.category || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(company.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyImport;