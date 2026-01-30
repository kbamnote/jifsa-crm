import React, { useEffect, useState, useRef } from "react";
import { FileText, Image, Trash2, Upload, Eye, X, CheckCircle, AlertCircle, Calendar, DollarSign, Bell, Clock, Check, XCircle, CreditCard, Plus, Folder, Filter } from "lucide-react";
import { useSearchParams } from 'react-router-dom';
import { createPayDetail, checkPayDetails, deletePayDetail, updatePayDetail } from '../../utils/Api';
import ClientModal from '../../modal/ClientModal';
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import AddPaymentDetailModal from '../../modal/AddPaymentDetailModal';
import UpdatePaymentDetailModal from '../../modal/UpdatePaymentDetailModal';

const PaymentDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize state from URL parameters
  const initialCurrentPage = parseInt(searchParams.get('page')) || 1;
  const initialItemsPerPage = parseInt(searchParams.get('limit')) || 10;
  
  // Filter state - initialize with URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [billingTypeFilter, setBillingTypeFilter] = useState(searchParams.get('billingType') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [startDateFilter, setStartDateFilter] = useState(searchParams.get('startDate') || '');
  const [endDateFilter, setEndDateFilter] = useState(searchParams.get('endDate') || '');
  const [amountMinFilter, setAmountMinFilter] = useState(searchParams.get('amountMin') || '');
  const [amountMaxFilter, setAmountMaxFilter] = useState(searchParams.get('amountMax') || '');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const isInitialRender = useRef(true);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPayments = async (page = 1, limit = 10, filters = {}) => {
    try {
      setFetchLoading(true);
      
      // Build filter parameters
      const params = {
        page: page,
        limit: limit
      };
      
      // Add filter parameters
      if (searchTerm) params.searchTerm = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (billingTypeFilter) params.billingType = billingTypeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;
      if (amountMinFilter) params.amountMin = amountMinFilter;
      if (amountMaxFilter) params.amountMax = amountMaxFilter;
      
      const res = await checkPayDetails(params);
      
      if (res.data) {
        setPayments(res.data.data || []);
        
        if (res.data.pagination) {
          setPaginationInfo(res.data.pagination);
          setCurrentPage(res.data.pagination.currentPage);
        }
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(initialCurrentPage, initialItemsPerPage);
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return; // Skip on initial render
    }
    
    // Reset to first page when filters change
    fetchPayments(1, itemsPerPage);
  }, [searchTerm, statusFilter, billingTypeFilter, categoryFilter, startDateFilter, endDateFilter, amountMinFilter, amountMaxFilter]);

  const handleAddClick = () => {
    setSelectedPayment(null);
    setShowAddModal(true);
  };

  const handleCreatePayment = async (formData) => {
    try {
      setLoading(true);
      await createPayDetail(formData);
      setSuccessMessage('Payment detail created successfully!');
      setShowSuccessModal(true);
      fetchPayments();
      setShowAddModal(false);
    } catch (error) {
      console.error(error);
      setSuccessMessage('Error creating payment detail. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (id, formData) => {
    try {
      setLoading(true);
      await updatePayDetail(id, formData);
      setSuccessMessage('Payment detail updated successfully!');
      setShowSuccessModal(true);
      fetchPayments();
      setShowEditModal(false);
    } catch (error) {
      console.error(error);
      setSuccessMessage('Error updating payment detail. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePayDetail(deleteId);
      setShowDeleteConfirmModal(false);
      setSuccessMessage('Payment detail deleted successfully!');
      setShowSuccessModal(true);
      fetchPayments();
    } catch (error) {
      console.error(error);
      setSuccessMessage('Error deleting payment detail. Please try again.');
      setShowSuccessModal(true);
    }
  };

  const handleViewClick = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const isPDF = (url) => url?.toLowerCase().endsWith('.pdf');

  // Filter handlers
  const handleFilterChange = (setterFunction, value) => {
    setterFunction(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setBillingTypeFilter('');
    setCategoryFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setAmountMinFilter('');
    setAmountMaxFilter('');
    
    setCurrentPage(1);
    
    // Clear URL parameters
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
    
    // Fetch all data after clearing filters
    fetchPayments(1, itemsPerPage);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments(1, itemsPerPage);
  };

  // Update URL parameters to persist pagination and filters
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (currentPage !== 1) newSearchParams.set('page', currentPage);
    if (itemsPerPage !== 10) newSearchParams.set('limit', itemsPerPage);
    if (searchTerm) newSearchParams.set('search', searchTerm);
    if (statusFilter) newSearchParams.set('status', statusFilter);
    if (billingTypeFilter) newSearchParams.set('billingType', billingTypeFilter);
    if (categoryFilter) newSearchParams.set('category', categoryFilter);
    if (startDateFilter) newSearchParams.set('startDate', startDateFilter);
    if (endDateFilter) newSearchParams.set('endDate', endDateFilter);
    if (amountMinFilter) newSearchParams.set('amountMin', amountMinFilter);
    if (amountMaxFilter) newSearchParams.set('amountMax', amountMaxFilter);
    
    setSearchParams(newSearchParams);
  }, [
    currentPage, itemsPerPage, searchTerm, statusFilter, billingTypeFilter, 
    categoryFilter, startDateFilter, endDateFilter, amountMinFilter, amountMaxFilter
  ]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ', ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getBillingTypeColor = (type) => {
    switch (type) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'yearly': return 'bg-purple-100 text-purple-800';
      case 'quarterly': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategorySummary = () => {
    const summary = {};
    
    payments.forEach(payment => {
      const category = payment.category || 'Uncategorized';
      
      if (!summary[category]) {
        summary[category] = {
          total: 0,
          paid: 0,
          pending: 0,
          overdue: 0,
          cancelled: 0,
          items: []
        };
      }
      
      summary[category].total += payment.amount || 0;
      summary[category].items.push(payment);
      
      switch (payment.status) {
        case 'paid':
          summary[category].paid += payment.amount || 0;
          break;
        case 'pending':
          summary[category].pending += payment.amount || 0;
          break;
        case 'overdue':
          summary[category].overdue += payment.amount || 0;
          break;
        case 'cancelled':
          summary[category].cancelled += payment.amount || 0;
          break;
        default:
          summary[category].pending += payment.amount || 0;
      }
    });
    
    return summary;
  };
  
  const categorySummary = getCategorySummary();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Flexible Billing Manager
          </h1>
          <p className="text-gray-600 text-lg">Manage one-time, monthly, and yearly billing with customizable reminders</p>
        </div>

        {/* Category Summary Cards */}
        {payments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(categorySummary).map(([category, data]) => (
                <div key={category} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {category}
                    </h3>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Folder className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">{formatCurrency(data.total, 'INR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Paid:</span>
                      <span className="text-green-600 font-semibold">{formatCurrency(data.paid, 'INR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">Pending:</span>
                      <span className="text-yellow-600 font-semibold">{formatCurrency(data.pending, 'INR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Overdue:</span>
                      <span className="text-red-600 font-semibold">{formatCurrency(data.overdue, 'INR')}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Items: {data.items.length}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Filter Toggle Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          >
            {showFilters ? (
              <>
                <X className="w-4 h-4" />
                Hide Filters
              </>
            ) : (
              <>
                <Filter className="w-4 h-4" />
                Show Filters
              </>
            )}
          </button>
        </div>
        
        {/* Filter Section - Collapsible */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or details"
                    value={searchTerm}
                    onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Type</label>
                <select
                  value={billingTypeFilter}
                  onChange={(e) => handleFilterChange(setBillingTypeFilter, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  placeholder="Category"
                  value={categoryFilter}
                  onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => handleFilterChange(setStartDateFilter, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => handleFilterChange(setEndDateFilter, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Amount</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={amountMinFilter}
                  onChange={(e) => handleFilterChange(setAmountMinFilter, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Amount</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={amountMaxFilter}
                  onChange={(e) => handleFilterChange(setAmountMaxFilter, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-3">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition"
                >
                  Clear Filters
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                Showing {payments.length} of {paginationInfo.totalItems} records
              </div>
            </div>
          </div>
        )}

        {/* Add New Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add New Billing Record
          </button>
        </div>

        {/* Payment Summary Cards */}
        {!fetchLoading && payments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">With Amount</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {payments.filter(p => p.amount).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter(p => p.status === 'paid').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-2xl font-bold text-gray-800">Billing Records</h3>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-semibold">
                {payments.length} {payments.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
          </div>

          {fetchLoading ? (
            <div className="animate-pulse p-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No billing records found</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add New Billing Record" to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Document</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name & Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Period</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Reminder</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {isPDF(payment.uploadImg) ? (
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                        ) : (
                          <img
                            src={payment.uploadImg}
                            alt={payment.name}
                            className="w-12 h-12 object-cover rounded-lg shadow-sm"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-semibold text-gray-800 block">{payment.name}</span>
                          {payment.details && (
                            <span className="text-sm text-gray-500">{payment.details}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getBillingTypeColor(payment.billingType)}`}>
                          {payment.billingType?.charAt(0).toUpperCase() + payment.billingType?.slice(1) || 'One-time'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {payment.startDate ? (
                            <>
                              <div>{new Date(payment.startDate).toLocaleDateString('en-IN')}</div>
                              {payment.endDate && (
                                <div className="text-gray-500">to {new Date(payment.endDate).toLocaleDateString('en-IN')}</div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">No dates</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payment.amount ? (
                          <span className="font-semibold text-gray-800">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        ) : (
                          <span className="text-gray-400">No amount</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {payment.reminderDate ? (
                          <span className="text-sm text-gray-600">
                            {new Date(payment.reminderDate).toLocaleDateString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No reminder</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(payment)}
                            className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleViewClick(payment)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(payment._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {paginationInfo.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, payments.length)}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, paginationInfo.totalItems)}
                </span>{' '}
                of <span className="font-medium">{paginationInfo.totalItems}</span> results
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                    fetchPayments(1, Number(e.target.value));
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
                
                <button
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    fetchPayments(newPage, itemsPerPage);
                  }}
                  disabled={!paginationInfo.hasPrevPage || fetchLoading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{paginationInfo.totalPages}</span>
                </span>
                
                <button
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchPayments(newPage, itemsPerPage);
                  }}
                  disabled={!paginationInfo.hasNextPage || fetchLoading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddPaymentDetailModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreatePayment}
      />

      <UpdatePaymentDetailModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdatePayment}
        paymentDetail={selectedPayment}
      />

      <SuccessModal
        showModal={showSuccessModal}
        setShowModal={setShowSuccessModal}
        message={successMessage}
      />

      <DeleteConfirmationModal
        showModal={showDeleteConfirmModal}
        setShowModal={setShowDeleteConfirmModal}
        onConfirm={confirmDelete}
        itemName="payment detail"
      />

      <ClientModal
        showModal={showViewModal}
        selectedRecord={selectedPayment}
        setShowModal={setShowViewModal}
      />
    </div>
  );
};

export default PaymentDetail;