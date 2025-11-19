import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// Helper function to log access attempts
async function logAccess(request: NextRequest, username: string, status: 'approved' | 'pending' | 'denied') {
  try {
    // Create a new request to the access-logs API
    const baseUrl = request.nextUrl.origin;
    await fetch(`${baseUrl}/api/access-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'x-real-ip': request.headers.get('x-real-ip') || '',
        'user-agent': request.headers.get('user-agent') || '',
      },
      body: JSON.stringify({ username, status }),
    });
  } catch (error) {
    console.error('Failed to log access:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Two-tier access system
    const approvedCredential = { username: 'nhscep2025', password: 'cohort10' };
    const pendingCredential = { username: 'demo', password: 'nhscep2025' };

    // Check for immediate approved access
    if (username === approvedCredential.username && password === approvedCredential.password) {
      // Log approved access
      await logAccess(request, username, 'approved');

      const response = NextResponse.json(
        { success: true, message: 'Authentication successful', approved: true, user: { username: 'nhscep2025', role: 'admin' } },
        { status: 200 }
      );

      // Set authenticated cookie for immediate access
      response.cookies.set('tom_authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
      });

      response.cookies.set('tom_user', 'nhscep2025', {
        httpOnly: false, // Accessible by client for display
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      });

      return response;
    }

    // Check for pending approval access
    if (username === pendingCredential.username && password === pendingCredential.password) {
      // Log pending access
      await logAccess(request, username, 'pending');

      return NextResponse.json(
        {
          success: false,
          message: 'Access pending approval. Please contact the administrator or submit a request form.',
          requiresApproval: true
        },
        { status: 403 }
      );
    }

    // Invalid credentials - log denied access
    await logAccess(request, username || 'unknown', 'denied');

    // Invalid credentials
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
