"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  if (!email.endsWith("@up.edu.ph")) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Only UP email addresses (@up.edu.ph) are allowed.",
    );
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
      }
    },
  });




  if (error) {
    console.error(error.code + " " + error.message);
    if (error.code === 'user_already_exists' || error.message.includes('already registered')) {
        return encodedRedirect("error", "/sign-up", "A user with this email address has already been registered.");
    }
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    // User creation in public schema deferred to onboarding
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!email.endsWith("@up.edu.ph")) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Only UP email addresses (@up.edu.ph) are allowed.",
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const signInWithGoogle = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  if (data.url) {
    return redirect(data.url);
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect("success", "/dashboard/reset-password", "Password updated successfully! You can now sign in with your new password.");
};

export const completeOnboardingAction = async (formData: FormData) => {
  const campus = formData.get("campus")?.toString();
  const studentNumber = formData.get("student_number")?.toString();
  const degreeParam = formData.get("degree_program")?.toString();
  const yearLevel = formData.get("year_level")?.toString();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  if (!campus || !studentNumber || !degreeParam || !yearLevel) {
    return encodedRedirect("error", "/onboarding", "All fields are required");
  }

  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || '',
      full_name: user.user_metadata?.full_name || '',
      user_id: user.id,
      token_identifier: user.id,
      campus,
      degree_program: degreeParam,
      year_level: yearLevel,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error("Onboarding update error:", error);
    return encodedRedirect("error", "/onboarding", "Failed to save details. Please try again.");
  }

  return redirect("/dashboard");
};