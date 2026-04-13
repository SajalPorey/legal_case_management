import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lcms_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If there is no response (e.g., server is down) or we get 401 Unauthorized
    if (!error.response || error.response.status === 401) {
      localStorage.removeItem("lcms_token");
      localStorage.removeItem("lcms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
