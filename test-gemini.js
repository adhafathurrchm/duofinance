import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function list() {
  console.log("Listing models...");
  // the Node SDK doesn't expose listModels directly easily, but wait, it might?
  // Let's just try calling gemini-pro and gemini-1.5-flash-latest
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const res = await model.generateContent('hello');
    console.log('gemini-pro works:', res.response.text());
  } catch(e) {
    console.error('gemini-pro error:', e.message);
  }
}

list();
