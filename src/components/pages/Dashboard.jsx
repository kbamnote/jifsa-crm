import React, { useEffect, useState } from "react";
import { getDetail } from "../utils/Api";
import Header from "../common/Header";
import SideNavbar from "../common/SideNavbar"; // Import the new component
import StatsCard from "../pages/StatsCard";
import SearchFilter from "../pages/SearchFilter";
import DataTable from "../table/DataTable";
import ClientModal from "../modal/ClientModal";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [sidebarOpen, setSidebarOpen] = useState(false); // New state for sidebar

  // Enhanced sorting function
  const sortData = (dataToSort, field, direction) => {
    return [...dataToSort].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle date fields
      if (field === 'createdAt' || field === 'updatedAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      // Handle string fields (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Sorting logic
      if (direction === 'desc') {
        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
        return 0;
      } else {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      }
    });
  };

  // API call to fetch data
  useEffect(() => {
    setLoading(true);
    getDetail()
      .then((res) => {
        const sortedData = res.data.reverse();
        setData(sortedData);
        setFilteredData(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Search functionality with maintained sorting
  useEffect(() => {
    let filtered = data.filter(item =>
      Object.values(item).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    filtered = sortData(filtered, sortField, sortDirection);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data, sortField, sortDirection]);

  // Handle column sorting
  const handleSort = (field) => {
    let newDirection = 'desc';
    if (sortField === field && sortDirection === 'desc') {
      newDirection = 'asc';
    }
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = sortData(filteredData, field, newDirection);
    setFilteredData(sorted);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Layout with sidebar */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <SideNavbar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header with hamburger menu */}
          <div className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Header content */}
              <div className="flex-1">
                <Header />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto p-6">
            <StatsCard data={data} />

            <SearchFilter 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortField={sortField}
              sortDirection={sortDirection}
            />

            <DataTable 
              currentItems={currentItems}
              filteredData={filteredData}
              currentPage={currentPage}
              totalPages={totalPages}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              itemsPerPage={itemsPerPage}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              handleViewDetails={handleViewDetails}
              setCurrentPage={setCurrentPage}
            />

            <ClientModal 
              showModal={showModal}
              selectedRecord={selectedRecord}
              setShowModal={setShowModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;