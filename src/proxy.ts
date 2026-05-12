import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale from pathname to check public paths
  const pathnameWithoutLocale = pathname.replace(/^\/(tr|en)/, "");
  const isPublic = PUBLIC_PATHS.some((p) => pathnameWithoutLocale.startsWith(p));

  // Always run i18n middleware
  const intlResponse = intlMiddleware(request);

  if (isPublic) {
    return intlResponse ?? NextResponse.next();
  }

  // Refresh Supabase session on protected routes
  let response = intlResponse ?? NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = intlResponse ?? NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
