import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const publicRoutes = [
  "/signin",
  "/forgot-password",
  "/reset-password",
];

const publicApiRoutes = [
  "/api/email",
  "/api/auth",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  console.log("Middleware triggered");

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r));
  const isApiRoute = publicApiRoutes.some(r => pathname.startsWith(r));

  // Si non connecté et essaie d'accéder à une route protégée (pas publique et pas API)
  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // Si connecté et essaie d'accéder à /signin ou forgot-password etc.
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}