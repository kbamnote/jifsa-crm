import axios from "axios";
import Cookies from "js-cookie";

const Api = axios.create({
  baseURL: "https://elite-backend-rhrk.onrender.com",
});

const Apione = axios.create({
  baseURL: "https://elite-backend-rhrk.onrender.com",
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

// ============== AUTH ==============
export const login = (post) => Apione.post("/auth/login", post);

// ============== FORM/LEADS ==============
export const getDetail = () => Api.get("/form/read-form");

export const addDetail = (formData) => Api.post("/form/create-form", formData);

export const updateDetail = (id, formData) => Api.patch(`/form/update/${id}`, formData);

export const markRead = (id) => Api.patch(`/form/${id}/read`);

export const updateStatus = (id, status) => Api.patch(`/form/${id}/status`, { status });

export const deleteForm = (id) => Api.delete(`/form/delete-form/${id}`);

// Fixed the assignLead endpoint - it should be /form/:id/assign not /form/:id/assign/
export const assignLead = (id, assignmentData) => {
  console.log(`Assigning lead with ID: ${id}`);
  console.log('Assignment data:', assignmentData);
  return Api.patch(`/form/${id}/assign`, assignmentData);
};

// ============== TEAM ==============
// FIXED: These functions now accept proper parameters
export const addMember = (memberData) => Api.post(`/team/create`, memberData);

export const getTeamDetail = () => Api.get(`/team/get-all`);

export const deleteMember = (id) => Api.delete(`/team/${id}`);

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