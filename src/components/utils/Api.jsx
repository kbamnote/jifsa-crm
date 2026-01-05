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

export const addDetail = (formData) => Api.post("/form/create-form", formData);

export const updateDetail = (id, formData) => Api.patch(`/form/update/${id}`, formData);

export const markRead = (id) => Api.patch(`/form/${id}/read`);

export const updateStatus = (id, status) => Api.patch(`/form/${id}/status`, { status });

export const deleteForm = (id) => Api.delete(`/form/delete-form/${id}`);

export const assignLead = (id, assignmentData) => {
  console.log(`Assigning lead with ID: ${id}`);
  console.log('Assignment data:', assignmentData);
  return Api.patch(`/form/${id}/assign`, assignmentData);
};

// ============== TEAM ==============
export const addMember = (memberData) => Api.post(`/team/create`, memberData);

export const getTeamDetail = () => Api.get(`/team/get-all`);

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

// ============== Image Sharing ==============
export const shareImage = (imageId, shareData) => 
  Api.post(`/image/share/${imageId}`, shareData);

// ============== Social Media ==============
export const createSocialMediaPost = (formData) =>
  Api.post("/social-media/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getSocialMediaPosts = () => Api.get("/social-media/get-all");

export const getSocialMediaPostById = (id) => Api.get(`/social-media/${id}`);

export const getSocialMediaStats = () => Api.get("/social-media/stats");

export const updateSocialMediaPost = (id, formData) =>
  Api.put(`/social-media/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteSocialMediaPost = (id) => Api.delete(`/social-media/${id}`);

// ============== Enrollments ==============
export const getEnrollments = () => Api.get("/enrollment/get-all");

export const updateEnrollmentStatus = (id, statusData) => Api.patch(`/enrollment/${id}/status`, statusData);

export const updateEnrollmentDetails = (id, data) => Api.patch(`/enrollment/${id}/details`, data);

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

export default Api;
