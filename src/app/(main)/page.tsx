'use client';

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { GraduationCap, Building2, ShieldCheck, Users, Globe2, AlertTriangle, Heart, Ban, Lock, MessageSquareWarning, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createClient } from "@/utils/supabase/client";

// Helper to format user count as estimated value
function formatUserCount(count: number): string {
  if (count < 5) return `${count}`;
  if (count < 10) return "5+";
  if (count < 50) return "10+";
  if (count < 100) return "50+";
  if (count < 500) return "100+";
  if (count < 1000) return "500+";
  if (count < 5000) return "1,000+";
  if (count < 10000) return "5,000+";
  return "10,000+";
}

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      const supabase = createClient();
      // Use RPC function to bypass RLS, with fallback to ratings count
      try {
        const { data, error } = await supabase.rpc('get_user_count');
        if (!error && data !== null) {
          setUserCount(data);
          return;
        }
      } catch {
        // Function might not exist yet, fallback below
      }

      // Fallback: count unique users from ratings (publicly readable)
      const { count } = await supabase
        .from('ratings')
        .select('user_id', { count: 'exact', head: true });
      if (count !== null && count > 0) {
        setUserCount(count);
      } else {
        // Last fallback - just show nothing
        setUserCount(null);
      }
    };
    fetchUserCount();
  }, []);

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-4 text-center">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7b1113]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#fbbf24]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground font-playfair leading-tight">
            Rate your <span className="text-[#7b1113] italic relative inline-block">
              Professors
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#fbbf24] opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
            <br />
            Improve the <span className="text-[#7b1113]">System</span>.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
            The student-driven platform for the UP community. Find the best mentors and share your campus experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/rate">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-[#7b1113] hover:bg-[#901c1e] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-2xl w-full sm:w-auto flex gap-3">
                <GraduationCap className="w-6 h-6" />
                Find a Professor
              </Button>
            </Link>
            <Link href="/campuses">
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold border-2 border-muted hover:border-[#7b1113] text-foreground hover:text-[#7b1113] bg-transparent hover:bg-[#7b1113]/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all rounded-2xl w-full sm:w-auto flex gap-3">
                <Building2 className="w-6 h-6" />
                Rate a Campus
              </Button>
            </Link>
          </div>

          {userCount !== null && userCount > 0 && (
            <div className="pt-12 flex items-center justify-center gap-2 transition-all duration-500">
              <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Trusted by
              </span>
              <span className="text-lg font-black text-[#7b1113] bg-[#7b1113]/10 px-3 py-1 rounded-full">
                {formatUserCount(userCount)}
              </span>
              <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                users across the UP System
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-32 bg-secondary/20 border-y border-border/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6">Why Users Choose UPicks</h2>
            <div className="w-24 h-1.5 bg-[#7b1113] mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built a platform that prioritizes your privacy while ensuring the data you see is reliable and actionable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-[#7b1113]" />}
              title="Anonymous by Default"
              description="Your reviews are anonymous unless you choose otherwise. We give you control over how you share your feedback."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-[#7b1113]" />}
              title="Verified UP Community"
              description="Only users with a valid @up.edu.ph email can submit reviews, ensuring authentic feedback from real members of the UP community."
            />
            <FeatureCard
              icon={<Globe2 className="w-8 h-8 text-[#7b1113]" />}
              title="All 8 UP Campuses"
              description="From Diliman to Mindanao, access data from across the entire UP system to navigate your academic journey."
            />
          </div>
        </div>
      </section>

      {/* Community Guidelines / Rules Section */}
      <section className="py-32 bg-background px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6">Community Guidelines</h2>
            <div className="w-24 h-1.5 bg-[#7b1113] mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              To maintain a respectful and helpful community, please follow these guidelines when submitting reviews.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RuleCard
              icon={<Heart className="w-6 h-6 text-green-600" />}
              title="Be Respectful"
              description="Critique teaching methods and course content, not personal attacks. Avoid offensive language, slurs, or discriminatory remarks about race, gender, religion, or personal appearance."
              type="do"
            />
            <RuleCard
              icon={<Lock className="w-6 h-6 text-red-600" />}
              title="Don't Share Personal Info"
              description="Do not share personal information about professors, staff, or other students. This includes contact details, home addresses, social media accounts, or private conversations."
              type="dont"
            />
            <RuleCard
              icon={<Scale className="w-6 h-6 text-green-600" />}
              title="Be Honest & Fair"
              description="Base your review on your genuine experience. Do not exaggerate, fabricate incidents, or submit reviews for courses you haven't taken. Rate based on teaching, not personal grudges."
              type="do"
            />
            <RuleCard
              icon={<Ban className="w-6 h-6 text-red-600" />}
              title="No Harassment or Threats"
              description="Threats, harassment, bullying, or any form of intimidation is strictly prohibited. This includes encouraging others to harass or harm professors or students."
              type="dont"
            />
            <RuleCard
              icon={<MessageSquareWarning className="w-6 h-6 text-green-600" />}
              title="Give Constructive Feedback"
              description="Focus on specific aspects like clarity, organization, fairness, and helpfulness. Constructive criticism helps future students make informed decisions."
              type="do"
            />
            <RuleCard
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
              title="No Spam or Fake Reviews"
              description="Do not submit duplicate reviews, fake reviews to boost or lower ratings, or use automated tools. Each user may only submit one review per professor per course."
              type="dont"
            />
          </div>

          <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Violation Consequences</h3>
                <p className="text-muted-foreground">
                  Reviews that violate these guidelines will be removed by our moderation team. Repeated violations may result in account suspension.
                  If you see a review that violates these rules, please use the report feature to notify our moderators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-secondary/20 border-y border-border/50 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6">Frequently Asked Questions</h2>
            <div className="w-24 h-1.5 bg-[#7b1113] mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-muted-foreground">Everything you need to know about using UPicks.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <FAQItem
              question="Are my reviews anonymous?"
              answer="By default, yes. When you submit a review, it's anonymous unless you choose to share your name. You have full control over your privacy settings for each review."
            />
            <FAQItem
              question="Who can write reviews?"
              answer="Only verified users with a valid @up.edu.ph email address can submit reviews. This ensures that the ratings you see are from real members of the UP community who have actually taken the courses."
            />
            <FAQItem
              question="Can I edit or delete my ratings?"
              answer="You cannot edit ratings once submitted to maintain data integrity, but you can contact our support team to request a deletion if needed."
            />
            <FAQItem
              question="What happens if I violate the community guidelines?"
              answer="Reviews that violate our guidelines will be removed by moderators. Repeated violations may lead to account suspension. We take community safety seriously."
            />
            <FAQItem
              question="Is this officially affiliated with UP?"
              answer="No. UPicks is a student-led initiative built by Isko't Iska for Isko't Iska. It is an independent platform designed to help students make informed decisions."
            />
          </Accordion>
        </div>
      </section>

      <footer className="py-12 text-center text-sm text-muted-foreground bg-background w-full border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
          <GraduationCap className="w-6 h-6 text-[#7b1113]" />
          <span className="font-playfair font-bold text-xl text-foreground">UPicks</span>
        </div>
        <p className="mb-6">© {new Date().getFullYear()} UPicks. Para sa isko't iska, para sa sistema.</p>
        <div className="flex justify-center gap-8">
          <Link href="/about" className="hover:text-[#7b1113] transition-colors font-medium">About</Link>
          <Link href="/privacy" className="hover:text-[#7b1113] transition-colors font-medium">Privacy</Link>
          <Link href="/terms" className="hover:text-[#7b1113] transition-colors font-medium">Terms</Link>
          <Link href="/contact" className="hover:text-[#7b1113] transition-colors font-medium">Contact</Link>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card hover:bg-card/50 p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="w-16 h-16 bg-[#7b1113]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#7b1113]/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-bold font-playfair mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function RuleCard({ icon, title, description, type }: { icon: React.ReactNode, title: string, description: string, type: 'do' | 'dont' }) {
  return (
    <div className={`p-6 rounded-2xl border ${type === 'do' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${type === 'do' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <AccordionItem value={question} className="border border-border/50 rounded-xl px-4 data-[state=open]:bg-secondary/20 transition-colors">
      <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline hover:text-[#7b1113]">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  )
}
