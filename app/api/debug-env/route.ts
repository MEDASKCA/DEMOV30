import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  return new Response(JSON.stringify({
    hasKey: !!apiKey,
    keyStart: apiKey ? apiKey.substring(0, 15) + '...' : 'NOT FOUND',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API'))
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
