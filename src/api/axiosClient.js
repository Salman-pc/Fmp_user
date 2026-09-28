import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';
    const status = error.response?.status;

    return Promise.reject({
      message,
      code,
      status,
      details: error.response?.data?.details
    });
  }
);

export default axiosClient;
