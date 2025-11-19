import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

interface AccessLog {
  id: string;
  timestamp: string;
  username: string;
  ipAddress: string;
  userAgent: string;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'approved' | 'pending' | 'denied';
}

// Get geolocation from IP using Vercel's geo headers
function getGeolocation(request: NextRequest) {
  return {
    country: request.geo?.country || 'Unknown',
    region: request.geo?.region || 'Unknown',
    city: request.geo?.city || 'Unknown',
    latitude: request.geo?.latitude ? parseFloat(request.geo.latitude) : undefined,
    longitude: request.geo?.longitude ? parseFloat(request.geo.longitude) : undefined,
  };
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }
  return 'Unknown';
}

// POST - Log a new access attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, status } = body;

    const log: AccessLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      username: username || 'Unknown',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      geolocation: getGeolocation(request),
      status: status || 'denied'
    };

    // Store in Vercel KV with a unique key
    await kv.lpush('access_logs', JSON.stringify(log));

    // Keep only last 1000 logs
    await kv.ltrim('access_logs', 0, 999);

    return NextResponse.json({ success: true, log }, { status: 200 });
  } catch (error) {
    console.error('Error logging access:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log access' },
      { status: 500 }
    );
  }
}

// GET - Retrieve access logs
export async function GET(request: NextRequest) {
  try {
    // Get authentication from cookie
    const isAuthenticated = request.cookies.get('tom_authenticated')?.value === 'true';

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Retrieve logs from KV (get last 100)
    const logsData = await kv.lrange('access_logs', 0, 99);
    const logs = logsData.map((log: string) => JSON.parse(log));

    return NextResponse.json({ success: true, logs }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve logs', logs: [] },
      { status: 500 }
    );
  }
}
