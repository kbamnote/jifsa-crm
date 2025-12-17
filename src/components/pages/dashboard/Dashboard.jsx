import React, { useEffect, useState } from "react";
import { getDetail, deleteForm } from "../../utils/Api";
import { FaPlus, FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import Cookies from "js-cookie";
import StatsCard from "./StatsCard";
import DataTable from "./table/DataTable";
import ClientModal from "../../modal/ClientModal";
import AddLeadModal from "../../modal/AddLeadModal";
import UpdateLeadModal from "../../modal/UpdateLeadModal";
import DeleteConfirmationModal from "../../modal/DeleteConfirmationModal";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [refreshStats, setRefreshStats] = useState(false);
  
  // Filter states
  const [productFilter, setProductFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  const userRole = Cookies.get("role") || "";
  const userEmail = Cookies.get("email") || "";

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDetail();
      console.log(response)
      const allData = response.data || [];
      
      // For sales persons, only show leads assigned to them
      let filteredLeads = allData;
      if (userRole.toLowerCase() === 'sales') {
        filteredLeads = allData.filter(lead => {
          // Check if lead is assigned to current user
          if (!lead.assignedTo) return false;
          
          // Handle both string and object formats for assignedTo
          if (typeof lead.assignedTo === 'string') {
            return lead.assignedTo.toLowerCase() === userEmail.toLowerCase();
          } else if (typeof lead.assignedTo === 'object' && lead.assignedTo.email) {
            return lead.assignedTo.email.toLowerCase() === userEmail.toLowerCase();
          }
          
          return false;
        });
      }
      
      const sortedData = sortData(filteredLeads, 'createdAt', 'desc');
      setData(filteredLeads);
      setFilteredData(sortedData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enhanced sorting function
  const sortData = (dataToSort, field, direction) => {
    return [...dataToSort].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      if (field === 'createdAt' || field === 'updatedAt' || field === 'date' || field === 'dob') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
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

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...data];

    // Product filter
    if (productFilter !== 'All') {
      filtered = filtered.filter(item => 
        item.productCompany?.toLowerCase() === productFilter.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt || item.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Search filter - improved to include city, name, email, and phone
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.fullName && item.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.phoneNo && item.phoneNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.city && item.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortField, sortDirection);
    
    return filtered;
  };

  // Update filtered data when filters change
  useEffect(() => {
    const filtered = applyFilters();
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data, sortField, sortDirection, productFilter, statusFilter, dateRange]);

  // Handle column sorting
  const handleSort = (field) => {
    let newDirection = 'desc';
    if (sortField === field && sortDirection === 'desc') {
      newDirection = 'asc';
    }
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setProductFilter('All');
    setStatusFilter('All');
    setDateRange({ start: '', end: '' });
  };

  // Handle add lead success
  const handleAddSuccess = () => {
    fetchData();
    setShowAddModal(false);
    setRefreshStats(prev => !prev); // Toggle to trigger stats refresh
  };

  // Handle update lead success
  const handleUpdateSuccess = () => {
    fetchData();
    setRefreshStats(prev => !prev); // Toggle to trigger stats refresh
  };

  // Handle assignment success
  const handleAssignmentSuccess = () => {
    fetchData();
    setRefreshStats(prev => !prev); // Toggle to trigger stats refresh
  };

  // Handle delete lead
  const handleDeleteLead = (id) => {
    const lead = data.find(item => item._id === id);
    if (lead) {
      setLeadToDelete({ id, name: lead.fullName || 'this lead' });
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteLead = async () => {
    if (leadToDelete) {
      try {
        await deleteForm(leadToDelete.id);
        fetchData(); // Refresh the data after deletion
        setShowDeleteModal(false);
        setLeadToDelete(null);
      } catch (error) {
        console.error("Error deleting lead:", error);
        console.error("Error response:", error.response);
        alert(`Failed to delete lead: ${error.response?.data?.message || error.message || "Please try again."}`);
      }
    }
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

  const handleEditLead = (record) => {
    setSelectedRecord(record);
    setShowUpdateModal(true);
  };

  // Role-based permissions for dashboard actions
  const canAddLeads = ['admin', 'manager', 'sales'].includes(userRole);
  const canViewAllLeads = ['admin', 'manager'].includes(userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse">
          {/* Header Section */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          
          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
          
          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Lead Management</h1>
                  <p className="text-gray-600 mt-1">
                    {userRole.toLowerCase() === 'sales' 
                      ? "Manage your assigned leads" 
                      : "Manage and track all your leads"}
                  </p>
                </div>
                {canAddLeads && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span className="font-medium">Add New Lead</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCard data={data} key={refreshStats} />

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                    showFilters 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-600'
                  }`}
                >
                  <FaFilter className="w-4 h-4" />
                  <span className="font-medium">Filters</span>
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Product Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product
                      </label>
                      <select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="All">All Products</option>
                        <option value="jifsa">JIFSA</option>
                        <option value="elite-bim">Elite BIM</option>
                        <option value="eee-technologies">EEE Technologies</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="All">All Status</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="interested">Interested</option>
                        <option value="not_interested">Not Interested</option>
                      </select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date From
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date To
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <FaTimes className="w-4 h-4" />
                      <span>Reset Filters</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Active Filters Display */}
              {(productFilter !== 'All' || statusFilter !== 'All' || dateRange.start || dateRange.end || searchTerm) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {productFilter !== 'All' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Product: {productFilter}
                    </span>
                  )}
                  {statusFilter !== 'All' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Status: {statusFilter}
                    </span>
                  )}
                  {dateRange.start && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      From: {dateRange.start}
                    </span>
                  )}
                  {dateRange.end && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      To: {dateRange.end}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      Search: {searchTerm}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Data Table */}
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
              handleEditLead={handleEditLead}
              handleDeleteLead={handleDeleteLead}
              setCurrentPage={setCurrentPage}
              userRole={userRole}
            />

            {/* Modals */}
            <ClientModal 
              showModal={showModal}
              selectedRecord={selectedRecord}
              setShowModal={setShowModal}
              onEdit={handleEditLead}
              onAssignSuccess={handleAssignmentSuccess}
            />

            {canAddLeads && (
              <AddLeadModal
                showModal={showAddModal}
                setShowModal={setShowModal}
                onSuccess={handleAddSuccess}
              />
            )}

            <UpdateLeadModal
              showModal={showUpdateModal}
              setShowModal={setShowUpdateModal}
              selectedRecord={selectedRecord}
              onSuccess={handleUpdateSuccess}
            />
            
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
              showModal={showDeleteModal}
              setShowModal={setShowDeleteModal}
              onConfirm={confirmDeleteLead}
              itemName={leadToDelete ? leadToDelete.name : 'this lead'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;