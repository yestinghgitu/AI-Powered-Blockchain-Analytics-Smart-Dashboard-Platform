const axios = require('axios');
const logger = require('../utils/logger');

// ──────────────────────────────────────────────────────────────────
//  Lightweight intent classifier — no ML, just smart keywords
// ──────────────────────────────────────────────────────────────────
const CASUAL_PATTERNS = /^(hi|hey|hello|yo|sup|howdy|good\s*(morning|evening|afternoon)|thanks|thank you|bye|ok|okay|cool|nice|great|lol|haha|what can you do|who are you|help|what are you)\b/i;
const ANALYTICAL_KEYWORDS = /\b(revenue|sales|forecast|predict|trend|anomal|growth|decline|performance|profit|loss|margin|quarter|ROI|KPI|metric|data|analysis|analyze|chart|report|insight|risk)\b/i;

function classifyIntent(message) {
  const trimmed = message.trim();
  if (trimmed.length < 4 || CASUAL_PATTERNS.test(trimmed)) return 'casual';
  if (ANALYTICAL_KEYWORDS.test(trimmed)) return 'analytical';
  return 'general'; // questions, suggestions, etc.
}

// ──────────────────────────────────────────────────────────────────
//  Context validator — sanitize + report data availability
// ──────────────────────────────────────────────────────────────────
function validateContext(rawContext) {
  if (!rawContext || typeof rawContext !== 'object') {
    return { safeContext: null, hasData: false };
  }

  const safe = {};
  let hasData = false;

  if (Array.isArray(rawContext.aiAnomalies) && rawContext.aiAnomalies.length > 0) {
    safe.aiAnomalies = rawContext.aiAnomalies.slice(0, 10);
    hasData = true;
  }
  if (Array.isArray(rawContext.aiForecast) && rawContext.aiForecast.length > 0) {
    safe.aiForecast = rawContext.aiForecast.slice(0, 10);
    hasData = true;
  }
  if (Array.isArray(rawContext.forecast) && rawContext.forecast.length > 0) {
    safe.forecast = rawContext.forecast.slice(0, 8);
    hasData = true;
  }
  if (rawContext.trends && typeof rawContext.trends === 'object') {
    safe.trends = rawContext.trends;
    hasData = true;
  }
  if (Array.isArray(rawContext.insights) && rawContext.insights.length > 0) {
    safe.insights = rawContext.insights.slice(0, 5);
    hasData = true;
  }

  return { safeContext: hasData ? safe : null, hasData };
}

// ──────────────────────────────────────────────────────────────────
//  System prompt builder — adapts to intent + data availability
// ──────────────────────────────────────────────────────────────────
function buildSystemPrompt(intent, safeContext, hasData) {
  const contextBlock = hasData
    ? `\n\nDashboard Data (LIVE):\n${JSON.stringify(safeContext)}`
    : '\n\n[No business data currently loaded in dashboard]';

  return `You are CryptoIQ — an AI-powered Business Intelligence Assistant built into a real-time analytics dashboard on Solana blockchain.

CURRENT MESSAGE INTENT: ${intent.toUpperCase()}

PERSONALITY & RESPONSE RULES:
${intent === 'casual' ? `
- The user sent a casual/greeting message. Respond warmly and briefly (1-3 sentences max).
- Do NOT use bullet points, structured formats, or analysis headers.
- Be friendly, like a smart colleague saying hi back.
- If appropriate, mention you can help with revenue analysis, forecasting, and anomaly detection.` : ''}
${intent === 'general' ? `
- The user is asking a general question (not data-specific).
- Respond naturally and helpfully.
- If they ask what you can do, list your capabilities conversationally.
- Suggest specific example questions they could ask.
- Do NOT force the structured 🔹 format.` : ''}
${intent === 'analytical' ? `
- The user is asking an analytical/business question.
${hasData ? `
- Real data IS available below. Use it to provide insights.
- Structure your response with:
  🔹 Executive Summary (2-3 concise lines)
  🔹 Key Insights (use real numbers, percentages, comparisons)
  🔹 Risk Factors (if any anomalies or concerns)
  🔹 Strategic Recommendations (actionable next steps)
- Reference the actual data. Do NOT say "no data available".` : `
- No data is currently loaded. Do NOT say "no data available" repeatedly.
- Instead, briefly say: "I don't have business data loaded yet. Upload a CSV through the Dashboard to get started!"
- Then suggest 3-4 specific questions they could ask once data is uploaded.
- Keep it helpful and encouraging, not robotic.`}` : ''}

HARD RULES:
- NEVER fabricate numbers or data
- NEVER repeat "no data available" more than once
- Be concise — no filler, no jargon
- Match your tone to the intent detected above
${contextBlock}`;
}

// ──────────────────────────────────────────────────────────────────
//  Main handler
// ──────────────────────────────────────────────────────────────────
const handleChat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      const error = new Error("GROQ_API_KEY is not configured in backend .env");
      error.status = 500;
      return next(error);
    }

    // 1. Classify intent
    const intent = classifyIntent(message);

    // 2. Validate & sanitize context
    const { safeContext, hasData } = validateContext(context);

    // 3. Structured logging
    logger.info(`[CryptoIQ] intent=${intent} | hasData=${hasData} | msgLen=${message.length} | contextKeys=${safeContext ? Object.keys(safeContext).join(',') : 'none'}`);

    // 4. Build adaptive prompt
    const systemPrompt = buildSystemPrompt(intent, safeContext, hasData);

    // 5. Call Groq
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: intent === 'casual' ? 0.7 : 0.2, // warmer for casual, precise for analysis
      max_tokens: intent === 'casual' ? 256 : 1024,  // short for greetings, full for analysis
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const answer = response.data?.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error("Invalid response from LLM provider");
    }

    // 6. Return response with metadata
    res.json({
      answer,
      meta: { intent, hasData }
    });

  } catch (error) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    logger.error(`[CryptoIQ] Groq Error: ${errorDetails}`);

    // Graceful fallback — never crash, always return something useful
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return res.status(504).json({
        answer: "I'm taking longer than expected to respond. Please try again with a shorter question.",
        meta: { intent: 'error', hasData: false }
      });
    }

    const clientErr = new Error("Failed to communicate with AI Assistant.");
    clientErr.status = 502;
    next(clientErr);
  }
};

module.exports = {
  handleChat
};
