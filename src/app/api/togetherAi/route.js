import { NextResponse } from 'next/server';
import { storeChatConversation } from '@/app/utils/database';

const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY;
const TOGETHER_AI_API_URL = 'https://api.together.ai/v1/chat/completions';

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  try {
    const startTime = Date.now();
    
    const response = await fetch(TOGETHER_AI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Together AI API');
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    // Store the conversation in the database
    await storeChatConversation(
      prompt,
      data.choices[0].message.content,
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      response.ok ? 'success' : 'error',
      processingTime
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from Together AI API:', error);
    
    // Store failed conversation attempt
    await storeChatConversation(
      prompt,
      error.message,
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      'error',
      0
    );

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
