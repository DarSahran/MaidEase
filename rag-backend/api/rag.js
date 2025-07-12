import { Redis } from '@upstash/redis';
import axios from 'axios';
import docs from './docs.js';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Parse request
  const { question, history } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  // Normalize question for cache key
  const normalizedQuestion = question.trim().toLowerCase();

  // Check cache (Upstash Redis)
  try {
    const cachedAnswer = await redis.get(normalizedQuestion);
    if (cachedAnswer) {
      return res.status(200).json({ answer: cachedAnswer, cached: true });
    }
  } catch (e) {
    console.error('Redis cache error:', e);
    // Continue if cache fails
  }

  // RAG context retrieval
  const lines = docs.split('\n');
  const keywords = question.toLowerCase().split(/\W+/);
  const relevant = lines.filter(line =>
    keywords.some(kw => kw && line.toLowerCase().includes(kw))
  );
  const context = relevant.slice(0, 5).join('\n');

  // Gemini API call
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent?key=${geminiApiKey}`;
    const assistantInstructions = "You are MaidEase Assistant named Shaanta (female), a helpful assistant for the MaidEase app. Answer questions and help users with anything related to MaidEase.";
    const prompt = [
      {
        role: "user",
        parts: [
          {
            text: `${assistantInstructions}\n\nContext:\n${context}\n\nHistory:\n${history?.join('\n')}\n\nQuestion:\n${question}`
          }
        ]
      }
    ];
    const response = await axios.post(geminiUrl, { contents: prompt });
    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Save answer to cache
    try {
      await redis.set(normalizedQuestion, answer);
    } catch (e) {
      console.error('Redis set error:', e);
    }

    res.status(200).json({ answer });
  } catch (e) {
    console.error('Error in Gemini API:', e.message, e.response?.data);
    res.status(500).json({ error: 'LLM error', details: e.message, gemini: e.response?.data });
  }
}