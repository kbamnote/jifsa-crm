import axios from "axios";
import Cookies from "js-cookie";

// Create Axios instance for authenticated requests
const Api = axios.create({
  baseURL: "https://elite-backend-rhrk.onrender.com",
});

// Create Axios instance for unauthenticated requests
const Apione = axios.create({
  baseURL: "https://elite-backend-rhrk.onrender.com",
});

// Add a request interceptor to include token from cookies
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

// Login API (no token required)
export const login = (post) => {
  // expects { email: "...", password: "..." }
  return Apione.post("/auth/login", post);
};

// Protected APIs (token will be automatically attached)
export const getDetail = () => Api.get("/form/read-form");

export const getComplaint = () => Api.get("/complaint/read-form");

export const getAdmissionForm = () => Api.get("/admission-form/read-form");

// Call logging APIs
export const logCall = (callData) => Api.post("/calls/log", callData);

export const getCallHistory = (customerId) => Api.get(`/calls/history/${customerId}`);

export const getAllCallLogs = () => Api.get("/calls/all");

export const updateCallStatus = (callId, status) => Api.patch(`/calls/${callId}/status`, { status });
