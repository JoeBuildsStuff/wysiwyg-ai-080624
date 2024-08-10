import { NextRequest, NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

export const runtime = 'edge';
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

    const anthropic = new Anthropic({});

    const msg = await anthropic.messages.create(
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        temperature: 0,
        stream: false,
        messages: [
                    {
                      "role": "user",
                      "content": [
                        {
                          "type": "text",
                          "text": 
                          `Only respond in Markdown. \n\n
                          
                          You are an AI assistant tasked with helping a user work on a document using reference files and responding to a specific request. Your goal is to provide helpful and accurate assistance based on the given information.

                          Here is the document the user is working on:
                          <document>
                          ${docContext || 'No document context provided.'}
                          </document>

                          The user has provided the following reference files:
                          <reference_files>
                          ${referenceContent || 'No reference files provided.'}
                          </reference_files>

                          The user's current request is:
                          <request>
                          ${userPrompt}
                          </request>
                          `
                        }
                      ]
                    }
                  ]
      },
      {
          headers: {
          "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"
          }
      }
      );
            
    // TODO: Convert to streaming
    // for await (const chunk of stream) {
    //     console.log(chunk)
    //     if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
    //       console.log('Chunk:', chunk.delta.text);
    //     }
    //   }

    const responseMessage = msg.content[0].type === 'text' ? msg.content[0].text : '';

    return NextResponse.json(responseMessage, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}