import { InfoIcon, UserCircle, School, BookOpen, Star } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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


  // Fetch recent ratings (Unified Feed)
  const { data: recentRatings } = await supabase
    .from("unified_ratings_feed")
    .select('*')
    .order("created_at", { ascending: false })
    .limit(4);

  // Fetch my professor ratings
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
    <main className="w-full bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-playfair text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.user_metadata.full_name || user.email}</p>
          </div>
          <Link href="/rate">
            <Button>Browse Professors</Button>
          </Link>
        </header>

        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 text-sm p-4 rounded-lg text-primary flex gap-2 items-center">
          <InfoIcon size="16" />
          <span>You are logged in as a verified student. Your ratings help the community!</span>
        </div>

        {/* Stats / Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all cursor-pointer group hover:shadow-custom hover:-translate-y-1 duration-300">
            <Link href="/rate" className="block h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors tracking-wide uppercase text-muted-foreground">Rate a Professor</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-playfair mb-1">Contribute</div>
                <p className="text-xs text-muted-foreground">
                  Share your experience to help others.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="rounded-xl border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">My Campus</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-playfair mb-1">
                {userProfile.campus === 'diliman' ? 'UP Diliman' :
                  userProfile.campus === 'mindanao' ? 'UP Mindanao' :
                    userProfile.campus || 'UP System'}
              </div>
              <p className="text-xs text-muted-foreground">
                {userProfile.degree_program || 'Student'} • {userProfile.year_level || 'Unknown Year'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">Account Status</CardTitle>
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-playfair mb-1 text-primary">Active</div>
              <p className="text-xs text-muted-foreground">
                Verified Student
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Ratings Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-playfair text-foreground">Recent Community Activity</h2>
            <Link href="/community" className="text-sm text-primary hover:text-primary/80 font-medium hover:underline underline-offset-4 transition-all">View full feed →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentRatings && recentRatings.length > 0 ? (
              recentRatings.map((rating: any) => {
                const isProf = rating.rating_type === 'professor';
                const href = isProf
                  ? `/rate/professor/${rating.professor_id}`
                  : `/rate/campus/${rating.campus_filter}`;

                return (
                  <Link key={rating.id} href={href} className="block h-full">
                    <Card className="flex flex-col h-full rounded-xl border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/90 transition-all hover:shadow-custom hover:-translate-y-1 duration-300 group cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg font-playfair line-clamp-1 group-hover:text-primary transition-colors">
                            {rating.title}
                          </h3>
                          <div className="flex items-center bg-secondary/50 text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md border border-secondary">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {rating.overall_rating}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {isProf ? rating.course_code : (rating.campus_filter === 'diliman' ? 'UP Diliman' : 'Campus')}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-foreground/80 line-clamp-3 italic font-serif leading-relaxed">
                          "{rating.review_text || 'No comment provided.'}"
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full py-10 text-center border rounded-lg border-dashed bg-muted/20">
                <p className="text-muted-foreground">No ratings yet. Be the first to rate a professor!</p>
                <Link href="/rate">
                  <Button variant="link" className="mt-2">Rate a Professor</Button>
                </Link>
              </div>
            )}
          </div>
        </section>



        {/* My Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Professor Ratings */}
          <section className="bg-card rounded-xl border border-border/50 p-6">
            <h3 className="text-xl font-bold font-playfair mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              My Professor Ratings
            </h3>
            <div className="space-y-4">
              {myProfRatings && myProfRatings.length > 0 ? (
                myProfRatings.map((rating: any) => (
                  <Link key={rating.id} href={`/rate/professor/${rating.professors?.id}`} className="block">
                    <div className="p-3 bg-background rounded-lg border border-border/50 flex justify-between items-start hover:border-primary/50 transition-colors cursor-pointer group">
                      <div>
                        <div className="font-bold text-sm group-hover:text-primary transition-colors">{rating.professors?.name}</div>
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">"{rating.review_text}"</p>
                      </div>
                      <div className="text-xs font-bold bg-secondary/30 px-2 py-1 rounded">
                        {rating.overall_rating}/5
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">You haven't rated any professors yet.</p>
              )}
            </div>
          </section>

          {/* My Campus Ratings */}
          <section className="bg-card rounded-xl border border-border/50 p-6">
            <h3 className="text-xl font-bold font-playfair mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              My Campus Ratings
            </h3>
            <div className="space-y-4">
              {myCampusRatings && myCampusRatings.length > 0 ? (
                myCampusRatings.map((rating: any) => (
                  <Link key={rating.id} href={`/rate/campus/${rating.campus_id}`} className="block">
                    <div className="p-3 bg-background rounded-lg border border-border/50 flex justify-between items-start hover:border-primary/50 transition-colors cursor-pointer group">
                      <div>
                        <div className="font-bold text-sm capitalize group-hover:text-primary transition-colors">{rating.campus_id.replace('-', ' ')}</div>
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">"{rating.review_text}"</p>
                      </div>
                      <div className="text-xs font-bold bg-secondary/30 px-2 py-1 rounded">
                        {rating.overall_rating}/5
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">You haven't rated any campuses yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* User Profile Details (Minimized) */}
        <section className="bg-card rounded-xl p-4 border shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <UserCircle size={20} />
            </div>
            <div className="flex-1 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-sm">My Profile</h2>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm" className="gap-2">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div >
    </main >
  );
}
