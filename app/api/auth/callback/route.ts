import { NextResponse } from "next/server";
import { createClient } from "@/actions/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("=== API Auth Callback ===");
  console.log("URL:", request.url);
  console.log("Code found:", !!code);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Exchange error:", error);
    
    if (!error) {
      console.log("Exchange successful, redirecting to:", `${origin}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }else{
      console.log("Exchange failed, redirecting to signin with error");
      return NextResponse.redirect(`${origin}/signin?error=${error.message}`);
    }
  }

  console.log("No code found, redirecting to signin");
  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/signin`);
}
