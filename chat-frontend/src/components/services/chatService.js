import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chat';

const getContacts = (token) => {
  return axios.get(`${API_URL}/contacts`, {
    headers: {
      'x-auth-token': token
    }
  });
};

const getMessages = (userId, token) => {
  return axios.get(`${API_URL}/messages/${userId}`, {
    headers: {
      'x-auth-token': token
    }
  });
};
const sendMessage = (receiverId, content, token) => {
  return axios.post(`${API_URL}/send`, { receiverId, content }, {
    headers: {
      'x-auth-token': token
    }
  });
};

const scheduleMessage = (receiverId, content, scheduledTime, token) => {
  return axios.post(`${API_URL}/schedule`, { receiverId, content, scheduledTime }, {
    headers: {
      'x-auth-token': token
    }
  });
};

export default {
  getContacts,
  getMessages,
  sendMessage,
  scheduleMessage
};
