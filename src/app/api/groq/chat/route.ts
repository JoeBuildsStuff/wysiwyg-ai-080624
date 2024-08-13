import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    console.log('POST request received');
  try {
    const body = await req.json();

    const userPrompt = body.userPrompt;
    const docContext = body.docContext;
    const addRefContext = body.addRefContext;

    // loop through addRefContext and create a string of reference content
    // for the anthropic API
    let referenceContent = '';
    if (Array.isArray(addRefContext)) {
      referenceContent = addRefContext.map(ref => 
        `Title: ${ref.title}\nContent: ${ref.text}`
      ).join('\n\n');
    }

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    
      const chatCompletion = await groq.chat.completions.create({
        "messages": [
          {
            "role": "system",
            "content": `Only respond in Markdown. \n\n
                          
                          You are an AI assistant built from Llama 3.1 70B running on Groq and your tasked with helping a user work on a document using reference files and responding to a specific request. Your goal is to provide helpful and accurate assistance based on the given information.

                          Here is the document the user is working on:
                          <document>
                          ${docContext || 'No document context provided.'}
                          </document>

                          The user has provided the following reference files:
                          <reference_files>
                          ${referenceContent || 'No reference files provided.'}
                          </reference_files>
`
                    },
            {
              "role": "user",
              "content": `The user's current request is:
                          <request>
                          ${userPrompt}
                          </request>
                          `
              }
          ],
        "model": "llama-3.1-70b-versatile",
        "temperature": 1,
        "max_tokens": 7000,
        "top_p": 1,
        "stream": false,
        "stop": null
      });

       const responseMessage = chatCompletion.choices[0].message.content;

       const response = {
        message: responseMessage,
        usage: {
          inputTokens: 0,
          outputTokens: 0
        }
      };

    // Return a successful response
    return NextResponse.json(response, { status: 200 });
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
