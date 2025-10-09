import React from "react";
import { Search, Filter, Download } from "lucide-react";

const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  sortField, 
  sortDirection 
}) => {
  const getSortLabel = (field) => {
    switch (field) {
      case 'createdAt': return 'Date Created';
      case 'firstName': return 'First Name';
      case 'lastName': return 'Last Name';
      case 'email': return 'Email';
      default: return 'Date Created';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients, email, phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            Sorted by: <span className="font-medium">
              {getSortLabel(sortField)} ({sortDirection === 'desc' ? 'Latest First' : 'Oldest First'})
            </span>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;