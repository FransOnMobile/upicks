import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Privacy Policy | UPicks",
    description: "Learn how UPicks protects your privacy and handles your data.",
};

export default function PrivacyPage() {
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
                        <Shield className="w-6 h-6 text-[#7b1113]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-playfair">Privacy Policy</h1>
                        <div className="w-24 h-1.5 bg-[#7b1113] rounded-full mt-2"></div>
                    </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <p className="text-muted-foreground text-lg">
                        Last updated: February 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Your Privacy Matters</h2>
                        <p>
                            UPicks is committed to protecting your privacy. This policy explains how we collect,
                            use, and safeguard your information when you use our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Email Address:</strong> Your @up.edu.ph email is used solely for verification purposes.</li>
                            <li><strong>Campus & Year Level:</strong> Used to personalize your experience and provide relevant data.</li>
                            <li><strong>Ratings & Reviews:</strong> Your submitted content is stored to display on the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">How We Protect You</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Anonymous by Default:</strong> Reviews are anonymous unless you choose to display your name. You control your privacy for each submission.</li>
                            <li><strong>Secure Authentication:</strong> We use industry-standard encryption for all data.</li>
                            <li><strong>No Third-Party Sharing:</strong> We do not sell or share your personal data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Your Rights</h2>
                        <p>
                            You have the right to request deletion of your account and all associated data.
                            Contact us at the email below to make such requests.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-playfair">Contact</h2>
                        <p>
                            For privacy-related inquiries, please email us at{" "}
                            <a href="mailto:privacy@upicks.ph" className="text-[#7b1113] hover:underline">
                                privacy@upicks.ph
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
