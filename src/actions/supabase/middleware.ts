import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const publicRoutes = [
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/waiting-approval",
];

const protectesRoutes = ["/api/email", "/api/auth", "/dashboard", "/profile"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  console.log("Middleware triggered");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("User : ", user);

  const pathname = request.nextUrl.pathname;
  console.log("Pathname : ", pathname);
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));
  console.log("Is public route : ", isPublicRoute);
  const isProtectedRoute = protectesRoutes.some((r) => pathname.startsWith(r));
  console.log("Is protected route : ", isProtectedRoute);

  if (pathname.startsWith("/api/auth")) {
    return supabaseResponse;
  }

  // Non connecté → accès protégé
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  console.log("Step 1 : ", user);

  // 🔐 Connecté
  if (user) {
    const { data: profile } = await getProfil(supabase, user.id);
    console.log("Step 2 : ", profile);

    // 🚧 Profil non complété → forcer /complete-profile
    if (!profile && pathname !== "/complete-profile") {
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }
    console.log("Status ; ", profile?.status);

    if (profile) {
      const isPending = profile.status !== "VALID";
      const isOnWaitingApproval = pathname.startsWith("/waiting-approval");

      // ⏳ Statut PENDING → bloqué sur /waiting-approval quelle que soit la route
      // (pas besoin d'exclure /signin : après signOut le user est désauthentifié)
      if (isPending && !isOnWaitingApproval) {
        console.log("Step 3 : ");
        return NextResponse.redirect(
          new URL(`/waiting-approval?status=${profile.status}`, request.url),
        );
      }

      // ✅ Profil valide : empêcher l'accès à /complete-profile et /waiting-approval
      if (
        !isPending &&
        (pathname === "/complete-profile" || isOnWaitingApproval)
      ) {
        console.log("Step 4 : ");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // 🚫 Bloquer accès aux pages auth (signin, forgot-password, etc.) si connecté
    if (isPublicRoute && !pathname.startsWith("/waiting-approval")) {
      console.log("Step 5 : ");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  console.log("Step 6 : ");
  return supabaseResponse;
}

async function getProfil(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("profiles")
    .select("status")
    .eq("id_user", id) // ← colonne FK correcte
    .single();
  return { data };
}
