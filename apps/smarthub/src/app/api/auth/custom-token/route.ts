import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminAuth } from '@ainexsuite/auth/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Create custom token for client-side auth
    const customToken = await getAdminAuth().createCustomToken(uid);

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}