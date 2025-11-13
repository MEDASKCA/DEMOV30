import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAIService } from '@/lib/azureOpenAIService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chat
 * Azure OpenAI RAG chat endpoint for TOM AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Process the query using Azure OpenAI RAG
    const result = await AzureOpenAIService.processQuery(message);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Chat API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred processing your request. Please try again.'
      },
      { status: 500 }
    );
  }
}
