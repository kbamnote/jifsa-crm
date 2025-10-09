import React, { useEffect, useState } from "react";
import { getDetail } from "../../utils/Api";
import Header from "../../common/Header";
import SideNavbar from "../../common/SideNavbar";
import StatsCard from "./StatsCard";
import SearchFilter from "./SearchFilter";
import DataTable from "./table/DataTable";
import ClientModal from "../../modal/ClientModal";
import CallInterface from "../../calling/CallInterface";
import CallHistory from "../../calling/CallHistory";
import IvrInterface from "../../calling/IvrInterface";
import { logCall } from "../../utils/Api";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productFilter, setProductFilter] = useState('All'); // New filter state

  // Call logging function
  const handleCallLog = async (callData) => {
    try {
      await logCall(callData);
      console.log('Call logged successfully:', callData);
    } catch (error) {
      console.error('Failed to log call:', error);
    }
  };

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
      .then((response) => {
        const allData = response.data || [];
        const sortedData = sortData(allData, 'createdAt', 'desc');
        setData(allData);
        setFilteredData(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Apply filters (search + product filter)
  const applyFilters = () => {
    let filtered = [...data];

    // Apply product company filter
    if (productFilter !== 'All') {
      filtered = filtered.filter(item => 
        item.productCompany?.toLowerCase() === productFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortField, sortDirection);
    
    return filtered;
  };

  // Update filtered data when any filter changes
  useEffect(() => {
    const filtered = applyFilters();
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data, sortField, sortDirection, productFilter]);

  // Handle product filter change
  const handleProductFilterChange = (filter) => {
    setProductFilter(filter);
  };

  // Handle column sorting
  const handleSort = (field) => {
    let newDirection = 'desc';
    if (sortField === field && sortDirection === 'desc') {
      newDirection = 'asc';
    }
    setSortField(field);
    setSortDirection(newDirection);
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
       
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
         

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
              productFilter={productFilter}
              onProductFilterChange={handleProductFilterChange}
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