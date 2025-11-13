import { NextRequest, NextResponse } from 'next/server';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/tts
 * Azure OpenAI Text-to-Speech endpoint for realistic voice
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'alloy' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

    if (!apiKey || !endpoint) {
      return NextResponse.json(
        { error: 'Azure OpenAI not configured', fallback: true },
        { status: 503 }
      );
    }

    const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    // Generate speech using Azure OpenAI TTS
    const deploymentName = process.env.AZURE_OPENAI_TTS_DEPLOYMENT_NAME || 'tts';

    const response = await client.getAudioTranscription(deploymentName, text, {
      voice: voice as any,
      responseFormat: 'mp3',
      speed: 1.0
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Return audio as MP3
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('TTS API Error:', error);

    // Return error with fallback flag
    return NextResponse.json(
      {
        error: error.message || 'TTS generation failed',
        fallback: true
      },
      { status: 500 }
    );
  }
}
