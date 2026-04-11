import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await API.post('/auth/refresh');
        return API(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/password', data)
};

export const teamAPI = {
  register: (data) => API.post('/teams', data),
  getAll: (params) => API.get('/teams', { params }),
  getMy: () => API.get('/teams/my'),
  getById: (id) => API.get(`/teams/${id}`),
  getByQRId: (qrId) => API.get(`/teams/qrid/${qrId}`),
  update: (id, data) => API.put(`/teams/${id}`, data),
  delete: (id) => API.delete(`/teams/${id}`),
  getQRCode: (id) => API.get(`/teams/${id}/qrcode`)
};

export const evaluationAPI = {
  submit: (data) => API.post('/evaluations', data),
  getAll: (params) => API.get('/evaluations', { params }),
  getJudge: (params) => API.get('/evaluations/judge', { params }),
  getById: (id) => API.get(`/evaluations/${id}`),
  update: (id, data) => API.put(`/evaluations/${id}`, data),
  delete: (id) => API.delete(`/evaluations/${id}`)
};

export const adminAPI = {
  createHackathon: (data) => API.post('/admin/hackathons', data),
  getHackathons: (params) => API.get('/admin/hackathons', { params }),
  getHackathon: (id) => API.get(`/admin/hackathons/${id}`),
  updateHackathon: (id, data) => API.put(`/admin/hackathons/${id}`, data),
  deleteHackathon: (id) => API.delete(`/admin/hackathons/${id}`),
  createRound: (data) => API.post('/admin/rounds', data),
  getRounds: (params) => API.get('/admin/rounds', { params }),
  getRound: (id) => API.get(`/admin/rounds/${id}`),
  updateRound: (id, data) => API.put(`/admin/rounds/${id}`, data),
  getAnalytics: (params) => API.get('/admin/analytics', { params }),
  getJudgePerformance: (params) => API.get('/admin/judge-performance', { params }),
  exportData: (params) => API.get('/admin/export', { params })
};

export const leaderboardAPI = {
  get: (params) => API.get('/leaderboard', { params }),
  getPosition: (params) => API.get('/leaderboard/position', { params }),
  getLive: (params) => API.get('/leaderboard/live', { params })
};

export default API;