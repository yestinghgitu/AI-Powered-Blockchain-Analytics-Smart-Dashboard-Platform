const Dataset = require('../models/Dataset');
const ChatService = require('../services/ChatService');

/**
 * Handle AI Assistant queries with context injection.
 */
const askAssistant = async (req, res) => {
    const { datasetId, message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'User message is required.' });
    }

    try {
        let context = `You are NexusAI — a world-class AI-powered Business Intelligence and Decision Support System.

Your role is to act as a senior data analyst, product strategist, and business consultant combined.

You are integrated into a real-time analytics dashboard that processes sales, revenue, and operational data.

Your objectives:
- Transform raw data into clear, actionable insights
- Identify trends, anomalies, and growth patterns
- Provide predictive and strategic recommendations
- Assist decision-making for business stakeholders

Response Guidelines (STRICT):

1. Always structure your response into:

   🔹 Executive Summary  
   - 2–3 lines summarizing overall performance and direction

   🔹 Key Insights  
   - Highlight important patterns (growth, decline, spikes)
   - Use percentages, comparisons, and time-based reasoning

   🔹 Risk Factors  
   - Identify potential issues (low performance, volatility, anomalies)

   🔹 Opportunities  
   - Suggest areas of growth or optimization

   🔹 Strategic Recommendations  
   - Provide clear, actionable next steps
   - Think like a senior business consultant

2. Intelligence Layer:
- If data is incomplete, make reasonable assumptions and clearly state them
- Use business reasoning, not just data repetition
- Prioritize clarity over complexity

3. Tone & Style:
- Professional, concise, executive-friendly
- Avoid technical jargon unless necessary
- No fluff, no generic responses

4. Context Awareness:
- Use provided dashboard metrics (revenue, growth, forecast, etc.)
- Align insights with business goals (profitability, scaling, efficiency)

5. Output Quality:
- Responses must feel like they come from a senior analyst at a top consulting firm
- Prioritize high-value insights over long explanations

You are not just answering — you are driving business decisions.
You are NexusAI — AI Business Intelligence Engine.`;
        
        // 1. Fetch Dataset Context if ID is provided
        if (datasetId) {
            const dataset = await Dataset.findById(datasetId);
            
            if (dataset) {
                const sampleRows = dataset.records.slice(0, 20); // First 20 rows for context
                const forecastSummary = dataset.aiForecast ? JSON.stringify(dataset.aiForecast) : 'Not available';
                const anomalySummary = dataset.aiAnomalies.length > 0 ? `${dataset.aiAnomalies.length} anomalies detected.` : 'None found.';

                context += `\n\nCurrent Dashboard Context:
Dataset: ${dataset.filename}
Columns: ${JSON.stringify(dataset.columns)}
Row Count: ${dataset.rowCount}
Sample Data: ${JSON.stringify(sampleRows)}
AI Forecast: ${forecastSummary}
AI Anomalies: ${anomalySummary}

Please answer the user's inquiry based on this precise data context.`;
            }
        }

        // 2. Call ChatService
        const messages = [
            { role: 'system', content: context },
            { role: 'user', content: message }
        ];

        const response = await ChatService.chat(messages);

        res.status(200).json({
            message: 'AI Response successful',
            response: response
        });

    } catch (error) {
        console.error(`[ChatController] Error: ${error.message}`);
        res.status(500).json({ message: 'Error communicating with AI assistant.', error: error.message });
    }
};

module.exports = { askAssistant };
