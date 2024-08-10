import { NextRequest, NextResponse } from 'next/server';

import { Groq } from 'groq-sdk';

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body of the request
    const body = await req.json();

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    
      const chatCompletion = await groq.chat.completions.create({
        "messages": [
          {
            "role": "system",
            "content": "users will provide file content. You are to provide a file title to use. Only respond with the proposed title."
          },
          {
            "role": "user",
            "content": body.content
          }
        ],
        "model": "llama-3.1-8b-instant",
        "temperature": 1,
        "max_tokens": 50,
        "top_p": 1,
        "stream": false,
        "stop": null
      });
    
       const title = chatCompletion.choices[0].message.content;

    // Return a successful response
    return NextResponse.json(
        { content: body.content, title: title },
        { status: 200 }
    );
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error:', error);

    // Determine if it's a client error or server error
    const isClientError = error instanceof Error && error.message === 'Missing required field';
    
    // Return an appropriate error response
    return NextResponse.json(
      { error: isClientError ? error.message : 'An internal server error occurred' },
      { status: isClientError ? 400 : 500 }
    );
  }
}
