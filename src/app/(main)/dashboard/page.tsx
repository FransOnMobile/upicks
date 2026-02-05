import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ClientDashboard } from "./client-dashboard";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch full user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Redirect to onboarding if profile is incomplete or missing
  if (!userProfile?.campus || !userProfile?.degree_program || !userProfile?.year_level) {
    return redirect("/onboarding");
  }


  // Fetch recent ratings (Unified Feed) - Increased limit for Feed Tab
  const { data: recentRatings } = await supabase
    .from("unified_ratings_feed")
    .select('*')
    .order("created_at", { ascending: false })
    .limit(8);

  // Fetch my professor ratings (Fetch ALL so client can paginate/slice)
  // Limited to 50 for performance, maybe? Or allow all.
  const { data: myProfRatings } = await supabase
    .from("ratings")
    .select(`
        id,
        overall_rating,
        review_text,
        created_at,
        professors (id, name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch my campus ratings
  const { data: myCampusRatings } = await supabase
    .from("campus_ratings")
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <ClientDashboard
      user={user}
      userProfile={userProfile}
      recentRatings={recentRatings || []}
      myProfRatings={myProfRatings || []}
      myCampusRatings={myCampusRatings || []}
    />
  );
}
