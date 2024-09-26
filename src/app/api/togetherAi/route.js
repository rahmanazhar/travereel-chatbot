import { NextResponse } from 'next/server';

const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY;
const TOGETHER_AI_API_URL = 'https://api.together.ai/v1/chat/completions';

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  try {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from Together AI API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}