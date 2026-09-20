import apiClient from './apiClient.js';

const SESSION_KEY = 'roomstay_chat_session';

export const chatbotService = {
  async sendMessage(message, sessionId = null) {
    if (!sessionId) {
      sessionId = localStorage.getItem(SESSION_KEY) || null;
    }
    const response = await apiClient.post('/chatbot/send', { message, sessionId });
    if (response.data?.data?.sessionId) {
      localStorage.setItem(SESSION_KEY, response.data.data.sessionId);
    }
    return response.data;
  },

  async getConversations() {
    const response = await apiClient.get('/chatbot/conversations');
    return response.data;
  },

  async getConversation(sessionId) {
    const response = await apiClient.get(`/chatbot/conversations/${encodeURIComponent(sessionId)}`);
    return response.data;
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  getStoredSession() {
    return localStorage.getItem(SESSION_KEY) || null;
  },
};

export default chatbotService;
