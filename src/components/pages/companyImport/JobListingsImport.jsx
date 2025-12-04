import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import axios from "axios";
import { Upload, Link, RefreshCw, Download, FileSpreadsheet, Briefcase } from "lucide-react";

const JobListingsImport = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [googleSheetLink, setGoogleSheetLink] = useState("https://docs.google.com/spreadsheets/d/1BMgde4pA0NdkR0G8jLensEa7PhGp1WcytmLKkd5UyrE/edit?usp=sharing");
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, syncing, completed, error
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState("");

  // Fetch job listings from database on component mount
  useEffect(() => {
    fetchJobListings();
  }, []);

  // Fetch job listings from database
  const fetchJobListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("https://elite-backend-production.up.railway.app/companies/all");
      setJobListings(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job listings:", error);
      setError("Failed to fetch job listings: " + (error.response?.data?.message || error.message || "Unknown error"));
      setLoading(false);
    }
  };

  // Handle Excel file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setExcelFile(file);
      setError("");
    }
  };

  // Convert Excel file to JSON
  const convertExcelToJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Fetch Google Sheet data
  const fetchGoogleSheetData = async () => {
    try {
      // Extract spreadsheet ID from the Google Sheets URL
      const spreadsheetId = googleSheetLink.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (!spreadsheetId) {
        throw new Error("Invalid Google Sheets URL. Please check the URL format.");
      }

      // Using Google Sheets export URL to get CSV data
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV to JSON
      const jsonData = parseCSV(csvText);
      return jsonData;
    } catch (error) {
      console.error("Error fetching Google Sheet data:", error);
      throw new Error("Failed to fetch Google Sheet data. " + (error.message || "Make sure the link is correct and the sheet is publicly accessible."));
    }
  };

  // Simple CSV parser
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      throw new Error("CSV file is empty or invalid");
    }
    
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      // Handle quoted fields that may contain commas
      const currentLine = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const obj = {};
      
      for (let j = 0; j < headers.length; j++) {
        // Remove quotes and trim whitespace
        const value = currentLine[j] ? currentLine[j].replace(/"/g, '').trim() : '';
        obj[headers[j]] = value;
      }
      
      result.push(obj);
    }
    
    return result;
  };

  // Sync data to backend (for JSON data)
  const syncJsonData = async (data) => {
    try {
      setStatus("syncing");
      setError("");
      
      const response = await axios.post("https://elite-backend-production.up.railway.app/companies/import", {
        companies: data
      });
      
      if (response.data.success) {
        setStatus("completed");
        setLastSynced(new Date());
        // Refresh the job listings list
        fetchJobListings();
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to import job listings");
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      setStatus("error");
      throw error;
    }
  };

  // Sync Excel file to backend
  const syncExcelFile = async (file) => {
    try {
      setStatus("syncing");
      setError("");
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post("https://elite-backend-production.up.railway.app/companies/import/file", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setStatus("completed");
        setLastSynced(new Date());
        // Refresh the job listings list
        fetchJobListings();
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to import job listings");
      }
    } catch (error) {
      console.error("Error syncing Excel file:", error);
      setStatus("error");
      throw error;
    }
  };

  // Handle Sync From Google Sheet
  const handleSyncFromGoogleSheet = async () => {
    try {
      setError("");
      const data = await fetchGoogleSheetData();
      
      if (!data || data.length === 0) {
        throw new Error("No data found in the Google Sheet");
      }
      
      await syncJsonData(data);
    } catch (error) {
      setStatus("error");
      setError(error.message);
    }
  };

  // Handle Upload Excel & Sync
  const handleUploadAndSync = async () => {
    if (!excelFile) {
      setError("Please select an Excel file first");
      return;
    }

    try {
      setError("");
      await syncExcelFile(excelFile);
    } catch (error) {
      setStatus("error");
      setError(error.response?.data?.message || error.message || "Failed to process Excel file");
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  // Get status badge class
  const getStatusClass = () => {
    switch (status) {
      case "syncing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case "syncing":
        return "Syncing...";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  };

  // Get column configuration for better display
  const getColumnConfig = () => {
    // Define which columns to show and their display names
    const importantColumns = [
      'Job Title',
      'Company Name',
      'Location',
      'Experience Level',
      'Salary Min (₹)',
      'Salary Max (₹)',
      'Category',
      'Date'
    ];
    
    return importantColumns;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Job Listings Import</h1>
        </div>
        
        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="font-medium">Last Synced:</span>
            <span className="text-gray-600">{formatDate(lastSynced)}</span>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Import Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upload Excel Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Upload className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Upload Excel File</h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File (.xlsx, .xls, .csv)
              </label>
              <div className="flex items-center">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileSpreadsheet className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      XLSX, XLS, CSV files only
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {excelFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {excelFile.name}
                </p>
              )}
            </div>
            
            <button
              onClick={handleUploadAndSync}
              disabled={status === "syncing" || !excelFile}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                status === "syncing" || !excelFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {status === "syncing" ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                  Uploading & Syncing...
                </div>
              ) : (
                "Upload Excel & Sync"
              )}
            </button>
          </div>
          
          {/* Google Sheet Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Link className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Google Sheet Import</h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheet Link
              </label>
              <input
                type="text"
                value={googleSheetLink}
                onChange={(e) => setGoogleSheetLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste Google Sheet link here"
              />
              <p className="mt-2 text-sm text-gray-500">
                Make sure the Google Sheet is publicly accessible
              </p>
            </div>
            
            <button
              onClick={handleSyncFromGoogleSheet}
              disabled={status === "syncing"}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                status === "syncing"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {status === "syncing" ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                  Syncing from Google Sheet...
                </div>
              ) : (
                "Sync From Google Sheet"
              )}
            </button>
          </div>
        </div>
        
        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={fetchJobListings}
            disabled={loading}
            className="flex items-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Table
          </button>
        </div>
        
        {/* Job Listings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Job Listings</h2>
            <p className="text-gray-600 text-sm mt-1">
              Showing {jobListings.length} job listings
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : jobListings.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job listings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by importing job listings from Excel or Google Sheets.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {getColumnConfig().map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobListings.map((listing, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {getColumnConfig().map((column) => (
                        <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {String(listing[column] || 'N/A')}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
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

export default JobListingsImport;