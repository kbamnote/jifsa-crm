import React, { useEffect, useState } from "react";
import { FileText, Image, Trash2, Upload, Eye, X, CheckCircle, AlertCircle } from "lucide-react";
import { createPayDetail, checkPayDetails, deletePayDetail } from '../../utils/Api';
import ClientModal from '../../modal/ClientModal';
import SuccessModal from '../../modal/SuccessModal';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';

const PaymentDetail = () => {
  const [formData, setFormData] = useState({
    name: "",
    details: "",
    uploadImg: null,
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPayments = async () => {
    try {
      setFetchLoading(true);
      const res = await checkPayDetails();
      setPayments(res.data.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      setPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("details", formData.details);
    fd.append("uploadImg", formData.uploadImg);

    try {
      await createPayDetail(fd);
      setSuccessMessage('Payment detail uploaded successfully!');
      setShowSuccessModal(true);
      fetchPayments();
      setFormData({ name: "", details: "", uploadImg: null });
      setPreviewUrl(null);
      e.target.reset();
    } catch (error) {
      console.error(error);
      setSuccessMessage('Error uploading payment detail. Please try again.');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Billing Details Manager</h1>
          <p className="text-gray-600">Upload and manage your Billing documents</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Billing Detail</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Invoice Payment"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Billing Details
                </label>
                <input
                  type="text"
                  name="details"
                  placeholder="Brief description"
                  value={formData.details}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Document (Image or PDF)
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="uploadImg"
                  accept="image/*,.pdf"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                  required
                />
              </div>
              {previewUrl && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img src={previewUrl} alt="Preview" className="max-h-32 rounded" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </span>
              ) : (
                "Upload Payment Detail"
              )}
            </button>
          </form>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">All Billing Details</h3>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {payments.length} {payments.length === 1 ? 'Document' : 'Documents'}
              </span>
            </div>
          </div>

          {fetchLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No Billing details found</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Preview</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Upload Date</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {isPDF(payment.uploadImg) ? (
                          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-red-600" />
                          </div>
                        ) : (
                          <img
                            src={payment.uploadImg}
                            alt={payment.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{payment.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{payment.details}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{formatDate(payment.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewClick(payment)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            title="View"
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
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        showModal={showSuccessModal}
        setShowModal={setShowSuccessModal}
        message={successMessage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        showModal={showDeleteConfirmModal}
        setShowModal={setShowDeleteConfirmModal}
        onConfirm={confirmDelete}
        itemName="payment detail"
      />

      {/* View Modal using ClientModal */}
      <ClientModal
        showModal={showViewModal}
        selectedRecord={selectedPayment}
        setShowModal={setShowViewModal}
      />
    </div>
  );
};

export default PaymentDetail;