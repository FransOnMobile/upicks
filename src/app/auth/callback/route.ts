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
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          const fullName = user.user_metadata.full_name || user.user_metadata.name || email.split("@")[0];
          
          await supabase.from("users").insert({
            id: user.id,
            name: fullName,
            full_name: fullName,
            email: email,
            user_id: user.id,
            token_identifier: user.id,
            // avatar_url: user.user_metadata.avatar_url, // Optional: add if we want avatar syncing
            created_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error syncing user profile:", err);
        // We probably don't want to block login if sync fails, but it's good to log
      }
    }
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, origin));
} 