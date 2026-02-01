'use client';


import Link from "next/link";
import { Suspense, useState } from "react";
import { ArrowRight, GraduationCap, Building2, ShieldCheck, Users, Globe2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
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
          <Badge className="bg-[#fbbf24] text-[#7b1113] hover:bg-[#fbbf24]/90 text-sm py-1.5 px-6 font-bold uppercase tracking-widest shadow-lg">
            Iskolar ng Bayan
          </Badge>

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
            The anonymous, student-driven platform for the UP community. Find the best mentors and share your campus experiences.
          </p>

          <div className="pt-12 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder for "Trusted by students from" logos if desired, or simpler trust indicators */}
            <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Trusted by at least 3 students across the UP System
            </div>
          </div>

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

          <p className="md:text-base text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
            Note that UPicks is a student run public forum and is <span className="text-[#7b1113] opacity-90 font-semibold">not officially affiliated with the University of the Philippines System.</span>
          </p>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-32 bg-secondary/20 border-y border-border/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6">Why Students Choose UPicks</h2>
            <div className="w-24 h-1.5 bg-[#7b1113] mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built a platform that prioritizes your privacy while ensuring the data you see is reliable and actionable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-[#7b1113]" />}
              title="100% Anonymous"
              description="Your identity is protected. We encourage honest feedback without fear. Ratings are verified but displayed anonymously."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-[#7b1113]" />}
              title="Community Verified"
              description="We use UP email verification to ensure all ratings come from actual students, keeping our community authentic."
            />
            <FeatureCard
              icon={<Globe2 className="w-8 h-8 text-[#7b1113]" />}
              title="System-wide Reach"
              description="From Diliman to Mindanao, connect with data from across the entire UP system to navigate your academic journey."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-background px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about using UPicks.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <FAQItem
              question="Is my identity truly anonymous?"
              answer="Yes. While you need to sign in with your UP email to verify you are a student, we never display your name or personal details with your reviews. Your feedback is completely decoupled from your identity on the public site."
            />
            <FAQItem
              question="Who can write reviews?"
              answer="Only verified students with a valid @up.edu.ph email address can submit reviews. This ensures that the ratings you see are from real students who have actually taken the courses."
            />
            <FAQItem
              question="Can I edit or delete my ratings?"
              answer="Currently, you cannot edit ratings once submitted to maintain data integrity, but you can request a deletion if needed. We are working on a feature to allow users to manage their own submissions."
            />
            <FAQItem
              question="Is this officially affiliated with UP?"
              answer="No. UPicks is a student-led initiative built by Iskolar ng Bayan for Iskolar ng Bayan. It is an independent platform designed to help students make informed decisions."
            />
          </Accordion>
        </div>
      </section>

      <footer className="py-12 text-center text-sm text-muted-foreground bg-secondary/10 w-full border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
          <GraduationCap className="w-6 h-6 text-[#7b1113]" />
          <span className="font-playfair font-bold text-xl text-foreground">UPicks</span>
        </div>
        <p className="mb-6">© {new Date().getFullYear()} UPicks. Built with ❤️ for the UP Community.</p>
        <div className="flex justify-center gap-8">
          <CodeOfConduct />
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

function CodeOfConduct() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-[#7b1113] transition-colors font-medium flex items-center gap-2"
      >
        Code of Conduct
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="mt-8 text-left max-w-2xl mx-auto bg-card border border-border/50 p-8 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="mb-4 text-foreground/90">
            The following are the code of conduct when using UPicks. Any review found in violation of the following will be removed.
          </p>

          <p className="mb-2 font-medium text-[#7b1113]">
            Please refrain from the following:
          </p>

          <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
            <li>Sharing personal details such as addresses, phone numbers, and social media</li>
            <li>Impolite comments about someone's appearance</li>
            <li>Offensive language</li>
            <li>Inappropriate content</li>
            <li>Unfounded accusations</li>
            <li>Personal attacks</li>
          </ul>
        </div>
      )}
    </div>
  );
}
