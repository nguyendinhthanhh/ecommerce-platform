import axios from 'axios';
import vi from '../utils/translations';

const AI_API_URL = 'http://localhost:8080/api/chatbot';

// Fallback response for development/errors
const fallbackResponse = {
    success: true,
    code: 200,
    message: "Chatbot response received",
    data: {
        reply: "Xin lỗi, hiện tại tôi đang gặp chút sự cố kết nối. Vui lòng thử lại sau ít phút hoặc liên hệ hotline 1800 6975 để được hỗ trợ trực tiếp. Cảm ơn bạn!",
        responseTimeMs: 0,
        timestamp: new Date().toISOString()
    }
};

const aiService = {
    /**
     * Send a message to the AI Chatbot
     * @param {string} message - The user's message
     * @returns {Promise<Object>} The bot's response data
     */
    sendMessage: async (message) => {
        try {
            if (!message || typeof message !== 'string' || message.trim() === '') {
                throw new Error('Message cannot be empty');
            }

            const response = await axios.post(`${AI_API_URL}/chat`, {
                message: message.trim()
            });

            if (response.data && response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || vi.messages.loadFailed);
        } catch (error) {
            console.error('AI Service Error:', error);

            // If we got a proper error response from the backend API
            if (error.response?.data) {
                if (error.response?.data?.data) {
                    return error.response.data.data;
                }
                throw new Error(error.response.data.message || vi.messages.loadFailed);
            }

            // If server is unreachable or other network error, return graceful fallback
            return fallbackResponse.data;
        }
    }
};

export default aiService;
