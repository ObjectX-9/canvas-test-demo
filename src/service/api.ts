import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize LangChain chat model
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_API_BASE_URL,
  },
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt = 'You are a helpful assistant.' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Convert messages to LangChain message format
    const langchainMessages = [
      new SystemMessage(systemPrompt),
      ...messages.map(msg => 
        msg.role === 'user' 
          ? new HumanMessage(msg.content)
          : { role: 'assistant', content: msg.content }
      )
    ];

    // Get response from the model
    const response = await chatModel.invoke(langchainMessages);

    // Return the response
    res.json({
      message: response.content,
      usage: response.response_metadata?.token_usage || {}
    });
  } catch (error: unknown) {
    console.error('Error in chat endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: errorMessage
    });
  }
});

export default app;
