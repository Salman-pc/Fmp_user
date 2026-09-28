import axiosClient from './axiosClient';

export const gameApi = {
  getGames: () => axiosClient.get('/games'),
  joinSession: (gameId) => axiosClient.post(`/games/${gameId}/join`),
  submitScore: (data) => axiosClient.post('/games/score', data),
  getLeaderboard: () => axiosClient.get('/games/leaderboard')
};
