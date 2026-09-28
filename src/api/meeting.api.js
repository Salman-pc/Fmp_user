import axiosClient from './axiosClient';

export const meetingApi = {
  getCurrentActive: () => axiosClient.get('/meetings/current'),
  getAll: (params) => axiosClient.get('/meetings', { params }),
  getById: (id) => axiosClient.get(`/meetings/${id}`)
};
