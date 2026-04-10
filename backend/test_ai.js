require('dotenv').config();
const axios = require('axios');

async function run() {
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `You are NexusAI... Dashboard context: {}`
        },
        { role: "user", content: "hi" }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Success:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Groq Error Response Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Groq Error Message:", error.message);
    }
  }
}
run();
