import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  logout: () => axiosClient.post('/auth/logout'),
  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),
  getMe: () => axiosClient.get('/auth/me')
};
