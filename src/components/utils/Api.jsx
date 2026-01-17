import axios from "axios";
import Cookies from "js-cookie";

const Api = axios.create({
  baseURL: "https://elite-backend-production.up.railway.app",
});

const Apione = axios.create({
  baseURL: "https://elite-backend-production.up.railway.app",
});

Api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============== AUTH ==============
export const login = (post) => Apione.post("/auth/login", post);

// ============== FORM/LEADS ==============
export const getDetail = () => Api.get("/form/read-form");

export const addDetail = (formData) => Api.post("/form/create-form", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

export const updateDetail = (id, formData) => Api.patch(`/form/update/${id}`, formData);

export const updateDetailWithFile = (id, formData) => Api.patch(`/form/update/${id}`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

export const markRead = (id) => Api.patch(`/form/${id}/read`);

export const updateStatus = (id, status) => Api.patch(`/form/${id}/status`, { status });

export const deleteForm = (id) => Api.delete(`/form/delete-form/${id}`);

export const updateEducation = (id, educationField) => Api.put(`/form/update-education/${id}`, { educationField });

export const addRemark = (id, remarkData) => Api.post(`/form/add-remark/${id}`, remarkData);

export const assignLead = (id, assignmentData) => {
  console.log(`Assigning lead with ID: ${id}`);
  console.log('Assignment data:', assignmentData);
  return Api.patch(`/form/${id}/assign`, assignmentData);
};

// ============== TEAM ==============
export const addMember = (memberData) => Api.post(`/team/create`, memberData);

export const getTeamDetail = () => Api.get(`/team/get-all`);

export const getTeamMemberById = (id) => Api.get(`/team/${id}`);

export const deleteMember = (id) => Api.delete(`/team/${id}`);

export const updateMember = (id, memberData) => Api.put(`/team/${id}`, memberData);

// ============== COMPLAINTS ==============
export const getComplaint = () => Api.get("/complaint/read-form");

// ============== ADMISSION FORMS ==============
export const getAdmissionForm = () => Api.get("/admission-form/read-form");

// ============== CALLS ==============
export const logCall = (callData) => Api.post("/calls/log", callData);
export const getCallHistory = (customerId) => Api.get(`/calls/history/${customerId}`);
export const getAllCallLogs = () => Api.get("/calls/all");
export const updateCallStatus = (callId, status) => Api.patch(`/calls/${callId}/status`, { status });

// ============== PAYMENT DETAILS ==============
export const createPayDetail = (formData) =>
  Api.post("/payment-detail/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const checkPayDetails = () => Api.get("/payment-detail/get-all");

export const deletePayDetail = (id) => Api.delete(`/payment-detail/delete/${id}`);

// ============== MAIL ==============
// Updated to accept FormData instead of JSON
export const sendGroupMail = (formData) => 
  Api.post("/mail/send-group", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMailTrackingData = () => Api.get("/mail/");

// ============== B2B ==============
export const createB2B = (formData) =>
  Api.post("/b2b/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getB2B = () => Api.get("/b2b/get-all");

export const updateB2B = (id, formData) =>
  Api.put(`/b2b/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteB2B = (id) => Api.delete(`/b2b/delete/${id}`);

// ============== Gallery & Docs ==============

export const addImgOrDocs = (formData) => 
  Api.post("/image/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getImgOrDocs = () => Api.get("/image/get-all");

export const deleteImgOrDocs = (id) => Api.delete(`/image/delete/${id}`);

export const updateImgOrDocs = (id, formData) =>
  Api.put(`/image/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getImageStats = () => Api.get("/image/stats");

// ============== Image Sharing ==============
export const shareImage = (imageId, shareData) => 
  Api.post(`/image/share/${imageId}`, shareData);

// ============== Social Media ==============
export const createSocialMediaPost = (formData) =>
  Api.post("/social-media/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getSocialMediaPosts = (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  
  // Add filters if provided
  if (filters.productCompany) params.append('productCompany', filters.productCompany);
  if (filters.platform) params.append('platform', filters.platform);
  if (filters.uploadType) params.append('uploadType', filters.uploadType);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.uploadedBy) params.append('uploadedBy', filters.uploadedBy);
  if (filters.search) params.append('search', filters.search);
  
  return Api.get(`/social-media/get-all?${params.toString()}`);
};

export const getSocialMediaPostById = (id) => Api.get(`/social-media/${id}`);

export const getSocialMediaStats = () => Api.get("/social-media/stats");

export const updateSocialMediaPost = (id, formData) =>
  Api.put(`/social-media/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteSocialMediaPost = (id) => Api.delete(`/social-media/${id}`);

// ============== Enrollments ==============
export const getEnrollments = () => Api.get("/enrollment/get-all");

export const getEnrollmentById = (id) => Api.get(`/enrollment/${id}`);

export const updateEnrollmentStatus = (id, statusData) => Api.patch(`/enrollment/${id}/status`, statusData);

export const updateEnrollmentDetails = (id, data) => Api.patch(`/enrollment/${id}/details`, data);

export const updateEnrollmentEducation = (id, educationField) => Api.put(`/enrollment/${id}/education`, { educationField });

export const addEnrollmentRemark = (id, remarkData) => Api.post(`/enrollment/${id}/remark`, remarkData);

export const deleteEnrollment = (id) => Api.delete(`/enrollment/${id}`);

// ============== Companies ==============
export const importCompaniesFromExcel = (formData) => 
  Api.post("/companies/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getAllCompanies = () => Api.get("/companies/all");

export const getCompanyById = (id) => Api.get(`/companies/${id}`);

export const deleteAllCompanies = () => Api.delete("/companies/all");

export const deleteCompany = (id) => Api.delete(`/companies/${id}`);

export const updateCompany = (id, data) => Api.put(`/companies/${id}`, data);

// ============== Reports ==============
export const createReport = (formData) =>
  Api.post("/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getReports = (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  
  // Add filters if provided
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.userName) params.append('userName', filters.userName);
  if (filters.day) params.append('day', filters.day);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  return Api.get(`/reports?${params.toString()}`);
};

export const getReportById = (id) => Api.get(`/reports/${id}`);

export const updateReport = (id, formData) =>
  Api.put(`/reports/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteReport = (id) => Api.delete(`/reports/${id}`);

export const getReportsByDateRange = (startDate, endDate) =>
  Api.get(`/reports/date-range?startDate=${startDate}&endDate=${endDate}`);

export const getAttendanceStats = () => Api.get('/reports/attendance-stats');

// ============== INTERN APPLIED DATA ==============
export const createInternApplication = (formData) =>
  Api.post('/intern-applied-data', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getInternApplications = (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  
  // Add filters if provided
  if (filters.search) params.append('search', filters.search);
  if (filters.fullName) params.append('fullName', filters.fullName);
  if (filters.email) params.append('email', filters.email);
  if (filters.phoneNo1) params.append('phoneNo1', filters.phoneNo1);
  if (filters.postAppliedFor) params.append('postAppliedFor', filters.postAppliedFor);
  
  return Api.get(`/intern-applied-data?${params.toString()}`);
};

export const getInternApplicationById = (id) => Api.get(`/intern-applied-data/${id}`);

export const updateInternApplication = (id, formData) =>
  Api.put(`/intern-applied-data/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteInternApplication = (id) => Api.delete(`/intern-applied-data/${id}`);

export default Api;
