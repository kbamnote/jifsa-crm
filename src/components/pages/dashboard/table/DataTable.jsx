import React from 'react';

const DataTable = ({
  currentItems,
  filteredData,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  itemsPerPage,
  sortField,
  sortDirection,
  handleSort,
  handleViewDetails,
  setCurrentPage,
  productFilter,
  onProductFilterChange
}) => {
  
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Filter Section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Data Records</h3>
          
          {/* Product Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by Product:</label>
            <select
              value={productFilter}
              onChange={(e) => onProductFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="All">All</option>
              <option value="JIFSA">JIFSA</option>
              <option value="Elite-BIM">Elite-BIM</option>
            </select>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-2 text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} results
          {productFilter !== 'All' && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Filtered: {productFilter}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                S.No
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center">
                  Full Name
                  {getSortIcon('fullName')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {getSortIcon('email')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('phoneNo')}
              >
                <div className="flex items-center">
                  Phone
                  {getSortIcon('phoneNo')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('productCompany')}
              >
                <div className="flex items-center">
                  Product Company
                  {getSortIcon('productCompany')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Date
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.phoneNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.productCompany === 'JIFSA' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.productCompany}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="hidden sm:flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;