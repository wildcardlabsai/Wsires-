import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { env, isSupabaseConfigured } from '@/lib/env';
import { resolveTenant } from '@/lib/tenant';

/**
 * Middleware does two jobs:
 *
 *  1. Multi-tenant routing — requests arriving on a customer's own domain or
 *     CymruSites subdomain are rewritten to the site renderer.
 *  2. Supabase session refresh — keeps the auth cookie fresh and gates the
 *     signed-in areas. Pages and API routes re-check authorisation server
 *     side; this is a first line of defence, not the only one.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  /* ---------------------------------------------------------------- */
  /* 1. Tenant routing                                                */
  /* ---------------------------------------------------------------- */
  const tenant = resolveTenant(request.headers.get('host'));

  if (tenant.kind !== 'platform') {
    /* Let platform infrastructure paths through untouched. */
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    if (tenant.kind === 'subdomain') {
      url.pathname = `/sites/subdomain/${tenant.slug}${pathname}`;
    } else {
      url.pathname = `/sites/domain/${tenant.domain}${pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  /* ---------------------------------------------------------------- */
  /* 2. Session refresh + route guards                                */
  /* ---------------------------------------------------------------- */
  const response = NextResponse.next({ request: { headers: request.headers } });

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboarding');

  if (!isSupabaseConfigured) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  /* Signed-in users have no business on the auth screens. */
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static files. Customer sites are
     * matched too so tenant rewriting applies to them.
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
