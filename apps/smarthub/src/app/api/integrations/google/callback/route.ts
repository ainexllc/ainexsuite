import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // This is a placeholder for the OAuth callback
  // In a real implementation, this would exchange the 'code' for tokens
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  return NextResponse.json({ 
    message: "OAuth callback received. Token exchange logic pending.",
    code 
  });
}
