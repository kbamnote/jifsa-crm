import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { createBlogPost, getAllBlogPosts, updateBlogPost, deleteBlogPost, likeBlogPost } from '../../utils/Api';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import AddBlogModal from '../../modal/AddBlogModal';

const Blog = () => {
  const [blogData, setBlogData] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    productCompany: '',
    category: '',
    tags: '',
    status: 'draft'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const userRole = Cookies.get('role');
  
  // Options for dropdowns
  const productCompanyOptions = [
    'JIFSA', 
    'Elite-BIM', 
    'Elite-BIFS', 
    'EEE-Technologies', 
    'Elite-Jobs', 
    'Elite-Cards', 
    'Elite-Associate', 
    'Elite-Properties', 
    'Elite-Paisa', 
    'Elite-Management'
  ];
  
  const statusOptions = [
    'draft',
    'published',
    'archived'
  ];
  
  // Fetch blog data
  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const response = await getAllBlogPosts();
      console.log('Fetched blog data:', response.data.data);
      setBlogData(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBlogData();
  }, []);
  
  // Open add modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };
  
  // Open edit modal
  const handleOpenEditModal = (entry) => {
    setEditingItem(entry);
    setShowAddModal(true);
  };
  
  // Save blog post (create or update)
  const handleSaveBlogPost = async (data) => {
    try {
      let response;
      if (editingItem) {
        response = await updateBlogPost(editingItem._id, data);
      } else {
        response = await createBlogPost(data);
      }
      
      setSuccess(response.data.message || (editingItem ? 'Blog post updated successfully!' : 'Blog post created successfully!'));
      fetchBlogData(); // Refresh the data
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };
  
  // Show delete confirmation modal
  const handleShowDeleteModal = (id) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };
  
  // Delete an entry
  const handleDelete = async () => {
    try {
      await deleteBlogPost(deleteItemId);
      setSuccess('Blog post deleted successfully!');
      setShowDeleteModal(false);
      setDeleteItemId(null);
      fetchBlogData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Delete failed');
      setShowDeleteModal(false);
      setDeleteItemId(null);
    }
  };
  
  // Like a blog post
  const handleLike = async (id) => {
    try {
      await likeBlogPost(id);
      fetchBlogData(); // Refresh to show updated like count
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to like post');
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      productCompany: '',
      category: '',
      tags: '',
      status: 'draft'
    });
    setEditingId(null);
    setFeaturedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Blog Management</h1>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal 
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          onConfirm={handleDelete}
          itemName="this blog post"
        />
        
        {/* Add/Edit Blog Modal */}
        <AddBlogModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveBlogPost}
          editingItem={editingItem}
        />
        
        {/* Blog Posts List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Blog Posts</h2>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Add New Blog Post</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : blogData.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No blog posts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Company</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {blogData.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">
                        <div className="flex items-center">
                          {post.featuredImage && (
                            <img 
                              src={post.featuredImage} 
                              alt={post.title} 
                              className="w-10 h-10 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-gray-500 text-xs truncate max-w-xs">{post.content.substring(0, 50)}{post.content.length > 50 ? '...' : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{post.productCompany}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{post.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                          {post.tags && post.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{post.views || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{post.likes || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{post.author?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(post)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          {(userRole === 'admin' || (post.author && post.author.userId && post.author.userId._id === Cookies.get('userId'))) && (
                            <button
                              onClick={() => handleShowDeleteModal(post._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          )}
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
    </div>
  );
};

export default Blog;