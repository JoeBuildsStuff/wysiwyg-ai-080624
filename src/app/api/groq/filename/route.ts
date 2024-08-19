import { NextRequest, NextResponse } from 'next/server';

import { Groq } from 'groq-sdk';

export const runtime = "edge";
export const maxDuration = 60;

// Define the schema for the response
const schema = {
  type: "object",
  properties: {
    title: { 
      type: "string",
      minWords: 3,
      maxWords: 5
    },
    description: { 
      type: "string",
      maxLength: 122
    },
    tags: { 
      type: "array",
      items: { type: "string" },
      maxItems: 5
    }
  },
  required: ["title", "description", "tags"]
};

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body of the request
    const body = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are to provide a file title, description, and tags based on the given content. Respond with a JSON object containing:
          1. 'title': A concise title with 3 to 5 words.
          2. 'description': A short description of exactly 122 characters.
          3. 'tags': Up to 5 relevant tags.
          
          Use this schema: ${JSON.stringify(schema, null, 2)}
          
          Ensure strict adherence to these constraints.`
        },
        {
          role: "user",
          content: body.content
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
      stream: false,
      stop: null,
      response_format: { type: "json_object" }
    });

    console.log("chatCompletion", chatCompletion);

    const result = JSON.parse(chatCompletion.choices[0].message.content || '{}'); // Fallback to an empty object if content is null
    return NextResponse.json(
      { 
        content: body.content, 
        ...result, 
        model: chatCompletion.model, 
        total_time: chatCompletion.usage?.total_time || 0, // Use optional chaining and provide a default value
        prompt_tokens: chatCompletion.usage?.prompt_tokens || 0,
        completion_tokens: chatCompletion.usage?.completion_tokens || 0,
        prompt_time: chatCompletion.usage?.prompt_time || 0,
        completion_time: chatCompletion.usage?.completion_time || 0
      },
      { status: 200 }
    );
  } catch (error) {
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