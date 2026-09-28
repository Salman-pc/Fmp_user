import axiosClient from './axiosClient';

export const userApi = {
  getProfile: () => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.patch('/users/profile', data)
};
