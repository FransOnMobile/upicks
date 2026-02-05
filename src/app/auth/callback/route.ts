import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 1. Validate Email Domain
      const email = user.email || "";
      if (!email.endsWith("@up.edu.ph")) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/sign-in?error=${encodeURIComponent("Only UP email addresses (@up.edu.ph) are allowed.")}`
        );
      }

      // 2. Sync User to 'users' table
      let needsOnboarding = false;
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, campus, degree_program, year_level")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          // New user - create record and mark for onboarding
          // We only use the UP Mail, so we don't collect full name. Use email prefix as initial name.
          const nameFromEmail = email.split("@")[0];
          
          await supabase.from("users").insert({
            id: user.id,
            name: nameFromEmail,
            full_name: nameFromEmail,
            email: email,
            user_id: user.id,
            token_identifier: user.id,
            created_at: new Date().toISOString(),
          });
          needsOnboarding = true;
        } else if (!existingUser.campus || !existingUser.degree_program || !existingUser.year_level) {
          // Existing user but incomplete profile
          needsOnboarding = true;
        }
      } catch (err) {
        console.error("Error syncing user profile:", err);
      }

      // If user needs onboarding and no specific redirect, go to onboarding
      if (needsOnboarding && !redirect_to) {
        return NextResponse.redirect(new URL("/onboarding", origin));
      }
    }
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, origin));
} 