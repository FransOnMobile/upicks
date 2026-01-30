import { InfoIcon, UserCircle, School, BookOpen, Star } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";

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


  // Fetch recent ratings (Community)
  const { data: recentRatings } = await supabase
    .from("ratings")
    .select(`
      id,
      overall_rating,
      review_text,
      created_at,
      professors (name, department_id),
      courses (code)
    `)
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
        professors (name)
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
    <main className="w-full bg-background min-h-screen noise-texture">
      <DashboardHero
        user={user}
        campus={userProfile.campus}
        program={userProfile.degree_program}
      />

      <div className="container max-w-6xl mx-auto px-4 py-8 -mt-20 relative z-20 flex flex-col gap-8">

        {/* Info Banner */}
        {/* <div className="bg-primary/5 border border-primary/20 text-sm p-4 rounded-lg text-primary flex gap-2 items-center">
          <InfoIcon size="16" />
          <span>You are logged in as a verified student. Your ratings help the community!</span>
        </div> */}

        {/* Stats / Quick Links Grid - Overlapping Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl border-border/50 bg-card/95 backdrop-blur-md hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-1 duration-300 shadow-lg">
            <Link href="/rate" className="block h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors tracking-wide uppercase text-muted-foreground">Rate a Professor</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Star className="h-4 w-4 text-primary group-hover:text-primary transition-colors fill-primary/20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-playfair mb-1 text-foreground">Contribute</div>
                <p className="text-xs text-muted-foreground">
                  Share your experience to help others.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="rounded-xl border-border/50 bg-card/95 backdrop-blur-md shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">My Campus</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <School className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-playfair mb-1 line-clamp-1">
                {userProfile.campus === 'diliman' ? 'UP Diliman' :
                  userProfile.campus === 'mindanao' ? 'UP Mindanao' :
                    userProfile.campus ? userProfile.campus.split('-').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'UP System'}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {userProfile.degree_program || 'Student'} • {userProfile.year_level || 'Year?'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 bg-card/95 backdrop-blur-md shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">Account Status</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <UserCircle className="h-4 w-4 text-primary" />
              </div>
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
        <section className="bg-background/40 p-6 rounded-2xl border border-border/40">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-playfair text-foreground">Community Pulse</h2>
              <p className="text-sm text-muted-foreground">Recent activity from students across UP.</p>
            </div>
            <Link href="/community" className="text-sm text-primary hover:text-primary/80 font-medium hover:underline underline-offset-4 transition-all">View all feed →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentRatings && recentRatings.length > 0 ? (
              recentRatings.map((rating: any) => (
                <Card key={rating.id} className="flex flex-col h-full rounded-xl border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/90 transition-all hover:shadow-custom hover:-translate-y-1 duration-300 group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg font-playfair line-clamp-1 group-hover:text-primary transition-colors">{rating.professors?.name}</h3>
                      <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-md border text-white
                          ${rating.overall_rating >= 4 ? 'bg-green-600 border-green-700' :
                          rating.overall_rating >= 2.5 ? 'bg-yellow-500 border-yellow-600' :
                            'bg-red-500 border-red-600'
                        }`}>
                        {rating.overall_rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <span>{rating.courses?.code}</span>
                      <span className="text-[10px] opacity-70">{new Date(rating.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-foreground/80 line-clamp-3 italic font-serif leading-relaxed">
                      "{rating.review_text || 'No comment provided.'}"
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border rounded-xl border-dashed bg-muted/20">
                <p className="text-muted-foreground mb-4">No ratings yet. Be the first!</p>
                <Link href="/rate">
                  <Button variant="outline">Rate a Professor</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* My Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Professor Ratings */}
          <section className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-playfair flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                My Professor Ratings
              </h3>
              <Link href="/profile/reviews">
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>

            <div className="space-y-3">
              {myProfRatings && myProfRatings.length > 0 ? (
                myProfRatings.slice(0, 3).map((rating: any) => (
                  <div key={rating.id} className="group p-4 bg-background/50 hover:bg-background rounded-lg border border-border/50 transition-colors flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm group-hover:text-primary transition-colors">{rating.professors?.name}</div>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic max-w-[200px]">"{rating.review_text || 'No text'}"</p>
                    </div>
                    <div className="text-xs font-bold bg-secondary/30 px-2 py-1 rounded">
                      {rating.overall_rating}/5
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-60">
                  <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground italic">You haven't rated any professors yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* My Campus Ratings */}
          <section className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-playfair flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                My Campus Ratings
              </h3>
              <Link href="/profile/reviews" className="">
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {myCampusRatings && myCampusRatings.length > 0 ? (
                myCampusRatings.slice(0, 3).map((rating: any) => (
                  <div key={rating.id} className="group p-4 bg-background/50 hover:bg-background rounded-lg border border-border/50 transition-colors flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm capitalize group-hover:text-primary transition-colors">{rating.campus_id.replace('-', ' ')}</div>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic max-w-[200px]">"{rating.review_text || 'No text'}"</p>
                    </div>
                    <div className="text-xs font-bold bg-secondary/30 px-2 py-1 rounded">
                      {rating.overall_rating}/5
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-60">
                  <School className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground italic">You haven't rated any campuses yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div >
    </main >
  );
}
