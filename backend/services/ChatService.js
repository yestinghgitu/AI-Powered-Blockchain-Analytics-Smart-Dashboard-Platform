const axios = require('axios');

/**
 * ChatService manages communication with the Groq LLM.
 * It uses the OpenAI-compatible chat completion endpoint.
 */
class ChatService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.url = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile'; 
    }

    /**
     * Send a prompts to the LLM
     * @param {Array} messages - Array of message objects {role, content}
     * @returns {Promise<string>} - LLM Response
     */
    async chat(messages) {
        if (!this.apiKey) {
            throw new Error('GROQ_API_KEY is not configured in .env');
        }

        try {
            const response = await axios.post(
                this.url,
                {
                    model: this.model,
                    messages: messages,
                    temperature: 0.2, // Keep it precise for data analysis
                    max_tokens: 1024
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error(`[ChatService] Error: ${error.response?.data?.error?.message || error.message}`);
            throw new Error('AI Assistant is currently unavailable.');
        }
    }
}

module.exports = new ChatService();
