import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const register = (name, email, password) => {
  return axios.post(`${API_URL}/register`, { name, email, password });
};

const login = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

const getUser = (token) => {
  return axios.get(`${API_URL}/user`, {
    headers: {
      'x-auth-token': token
    }
  });
};
const searchUsers = (query, token) => {
  return axios.get(`${API_URL}/search?query=${query}`, {
    headers: {
      'x-auth-token': token
    }
  });
};

export default {
  register,
  login,
  getUser,
  searchUsers
};
