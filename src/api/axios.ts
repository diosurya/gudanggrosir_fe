import axios from "axios";

const BASE_URL = "https://be.gudanggrosiran.com";
// const BASE_URL = "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/admin`,
  withCredentials: true, 
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export { BASE_URL }; 
export default apiClient;
