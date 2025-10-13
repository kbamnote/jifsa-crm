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

export const login = (post) => Apione.post("/auth/login", post);

export const getDetail = () => Api.get("/form/read-form");
export const getComplaint = () => Api.get("/complaint/read-form");
export const getAdmissionForm = () => Api.get("/admission-form/read-form");

export const logCall = (callData) => Api.post("/calls/log", callData);
export const getCallHistory = (customerId) =>
  Api.get(`/calls/history/${customerId}`);
export const getAllCallLogs = () => Api.get("/calls/all");
export const updateCallStatus = (callId, status) =>
  Api.patch(`/calls/${callId}/status`, { status });

// ✅ Create Payment
export const createPayDetail = (formData) =>
  Api.post("/payment-detail/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Get All Payments
export const checkPayDetails = () => Api.get("/payment-detail/get-all");

// ✅ Delete Payment
export const deletePayDetail = (id) =>
  Api.delete(`/payment-detail/delete/${id}`);
