import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, Globe2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "About | UPicks",
    description: "Learn about UPicks - the student-driven platform for the UP community.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" className="mb-8 gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-[#7b1113]/10 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-[#7b1113]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-playfair">About UPicks</h1>
                        <div className="w-24 h-1.5 bg-[#7b1113] rounded-full mt-2"></div>
                    </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Our Mission</h2>
                        <p>
                            UPicks is a student-driven platform built to help members of the University of the Philippines
                            community make informed decisions about their academic journey. We believe that every student
                            deserves access to honest, transparent feedback about professors and campus experiences.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">What We Offer</h2>
                        <div className="grid md:grid-cols-2 gap-6 not-prose mt-6">
                            <div className="p-6 rounded-xl bg-card border border-border">
                                <Users className="w-8 h-8 text-[#7b1113] mb-4" />
                                <h3 className="font-bold text-lg mb-2">Professor Ratings</h3>
                                <p className="text-muted-foreground text-sm">
                                    Browse and submit detailed ratings for professors across all 8 UP campuses,
                                    covering teaching quality, clarity, and more.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl bg-card border border-border">
                                <Globe2 className="w-8 h-8 text-[#7b1113] mb-4" />
                                <h3 className="font-bold text-lg mb-2">Campus Reviews</h3>
                                <p className="text-muted-foreground text-sm">
                                    Share and explore campus experiences including facilities, safety,
                                    student life, and overall atmosphere.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Our Values</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Privacy First:</strong> Reviews are anonymous by default. You control your visibility.</li>
                            <li><strong>Verified Community:</strong> Only UP students with @up.edu.ph emails can contribute.</li>
                            <li><strong>Respectful Discourse:</strong> We maintain community guidelines to ensure constructive feedback.</li>
                            <li><strong>Transparency:</strong> Our moderation team reviews flagged content fairly and consistently.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Para Sa Mga Isko't Iska</h2>
                        <p>
                            UPicks was created by students who understand the challenges of navigating the UP system.
                            We're not affiliated with the University of the Philippines administration, we're an
                            independent initiative who want to give back to the community.
                        </p>
                    </section>

                    <section className="bg-[#7b1113]/5 p-6 rounded-xl border border-[#7b1113]/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="w-6 h-6 text-[#7b1113]" />
                            <h3 className="font-bold text-lg">Get Involved</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            Want to contribute to UPicks? Whether it's reporting bugs, suggesting features,
                            or helping moderate content, we'd love to hear from you.
                        </p>
                        <Link href="/contact">
                            <Button variant="outline" className="border-[#7b1113] text-[#7b1113] hover:bg-[#7b1113]/5">
                                Contact Us
                            </Button>
                        </Link>
                    </section>
                </div>
            </div>
        </main>
    );
}
