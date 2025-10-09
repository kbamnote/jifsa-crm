import React, { useEffect, useState } from "react";
import { getDetail } from "../utils/Api";
import Header from "../common/Header";
import SideNavbar from "../common/SideNavbar"; // Import the new component
import StatsCard from "../pages/StatsCard";
import SearchFilter from "../pages/SearchFilter";
import DataTable from "../table/DataTable";
import ClientModal from "../modal/ClientModal";
import CallInterface from "../calling/CallInterface";
import CallHistory from "../calling/CallHistory";
import IvrInterface from "../calling/IvrInterface";
import { logCall } from "../utils/Api";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [bimData, setBimData] = useState([]);
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
  const [activeDataSource, setActiveDataSource] = useState('jifsa'); // 'jifsa' or 'bim'

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
    Promise.all([getDetail()])
      .then(([jifsaRes, bimRes]) => {
        const jifsaData = jifsaRes.data.map(item => ({ ...item, source: 'jifsa' }));
        const bimData = bimRes.data.map(item => ({ ...item, source: 'bim' }));
        
        setBimData(bimData);
        
        // Set initial data based on active data source
        const allData = activeDataSource === 'jifsa' ? jifsaData : bimData;
        const sortedData = allData.reverse();
        setData(allData);
        setFilteredData(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Handle data source change
  const handleDataSourceChange = (source) => {
    setActiveDataSource(source);
    let newData = source === 'jifsa' ? data : bimData;
    
    // Filter based on search term
    if (searchTerm) {
      newData = newData.filter(item =>
        Object.values(item).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Sort the data
    newData = sortData(newData, sortField, sortDirection);
    
    setFilteredData(newData);
    setCurrentPage(1);
  };

  // Search functionality with maintained sorting
  useEffect(() => {
    const currentDataSet = activeDataSource === 'jifsa' ? data : bimData;
    let filtered = currentDataSet.filter(item =>
      Object.values(item).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    filtered = sortData(filtered, sortField, sortDirection);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data, bimData, sortField, sortDirection, activeDataSource]);

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
            {/* Data source selector */}
            <div className="mb-4 flex justify-end">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    activeDataSource === 'jifsa'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-200`}
                  onClick={() => handleDataSourceChange('jifsa')}
                >
                  Jifsa Data
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    activeDataSource === 'bim'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-200`}
                  onClick={() => handleDataSourceChange('bim')}
                >
                  Elite BIM Data
                </button>
              </div>
            </div>

            {/* Call Interface and IVR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <CallInterface onCallLog={handleCallLog} />
              </div>
              <div>
                <IvrInterface />
              </div>
            </div>

            {/* Call History */}
            <div className="mb-6">
              <CallHistory />
            </div>

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
              activeDataSource={activeDataSource}
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