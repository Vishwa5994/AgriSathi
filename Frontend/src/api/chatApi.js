import apiClient from './client';

export const chatApi = {
  /**
   * Send a message to the backend RAG grounded chatbot
   * @param {string} message - The user's input text
   * @param {Array} history - Optional previous message history
   */
  async sendMessage(message, history = []) {
    const response = await apiClient.post('/chat', {
      message,
      messages: history
    });
    return response.data;
  }
};
