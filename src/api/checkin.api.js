import axiosClient from './axiosClient';

export const checkInApi = {
  submitCheckIn: (payload) => axiosClient.post('/checkins', payload),
  getMyCheckIns: (params) => axiosClient.get('/checkins/me', { params }),
  getStatus: (meetingId) => axiosClient.get(`/checkins/status/${meetingId}`),
  getPresentUsers: (meetingId) => axiosClient.get(`/checkins/present-users/${meetingId || 'current'}`),
  resetCheckIn: (meetingId) => axiosClient.delete(`/checkins/reset/${meetingId}`)
};
