import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Terms of Service | UPicks",
    description: "Terms and conditions for using the UPicks platform.",
};

export default function TermsPage() {
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
                        <FileText className="w-6 h-6 text-[#7b1113]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-playfair">Terms of Service</h1>
                        <div className="w-24 h-1.5 bg-[#7b1113] rounded-full mt-2"></div>
                    </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <p className="text-muted-foreground text-lg">
                        Last updated: February 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Acceptance of Terms</h2>
                        <p>
                            By accessing and using UPicks, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Eligibility</h2>
                        <p>
                            UPicks is available exclusively to students and affiliates of the University of
                            the Philippines system. You must have a valid @up.edu.ph email address to create
                            an account and submit ratings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">User Conduct</h2>
                        <p>When using UPicks, you agree to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide honest and accurate ratings based on your genuine experience</li>
                            <li>Refrain from posting defamatory, harassing, or discriminatory content</li>
                            <li>Not attempt to manipulate ratings or create fake reviews</li>
                            <li>Respect the anonymity and privacy of other users</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Content Moderation</h2>
                        <p>
                            We reserve the right to remove any content that violates these terms or is
                            deemed inappropriate by our moderation team. Repeated violations may result
                            in account suspension.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Disclaimer</h2>
                        <p>
                            UPicks is an independent, student-led initiative and is not officially
                            affiliated with the University of the Philippines. All ratings and reviews
                            represent the opinions of individual users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Contact</h2>
                        <p>
                            For questions about these terms, please email us at{" "}
                            <a href="mailto:support@upicks.ph" className="text-[#7b1113] hover:underline">
                                support@upicks.ph
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
