import { createActionClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('[Auth Callback] Processing callback, code present:', !!code);

  if (code) {
    // Use createActionClient to properly set cookies
    const supabase = await createActionClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
    }

    console.log('[Auth Callback] Session created for user:', data.user?.email || 'unknown');
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/`);
}
