import { createActionClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // Use environment variable as fallback for production domain
  const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

  if (code) {
    const supabase = await createActionClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
    }
  }

  // Redirect to home after sign in process completes
  return NextResponse.redirect(`${origin}/`);
}
