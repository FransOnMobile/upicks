import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Contact Us | UPicks",
    description: "Get in touch with the UPicks team for questions, feedback, or support.",
};

export default function ContactPage() {
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
                        <MessageCircle className="w-6 h-6 text-[#7b1113]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-playfair">Contact Us</h1>
                        <div className="w-24 h-1.5 bg-[#7b1113] rounded-full mt-2"></div>
                    </div>
                </div>

                <p className="text-lg text-muted-foreground mb-12">
                    Have questions, feedback, or need help? We'd love to hear from you.
                    Reach out through any of the channels below.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-border/50 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 bg-[#7b1113]/10 rounded-xl flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-[#7b1113]" />
                            </div>
                            <CardTitle className="font-playfair">Email Us</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                For general inquiries and support
                            </p>
                            <a
                                href="mailto:support@upicks.ph"
                                className="text-[#7b1113] font-semibold hover:underline"
                            >
                                support@upicks.ph
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 bg-[#7b1113]/10 rounded-xl flex items-center justify-center mb-4">
                                <MessageCircle className="w-6 h-6 text-[#7b1113]" />
                            </div>
                            <CardTitle className="font-playfair">Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Help us improve by sharing your thoughts
                            </p>
                            <a
                                href="mailto:feedback@upicks.ph"
                                className="text-[#7b1113] font-semibold hover:underline"
                            >
                                feedback@upicks.ph
                            </a>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                    <h2 className="text-xl font-bold font-playfair mb-4">Report an Issue</h2>
                    <p className="text-muted-foreground">
                        Found a bug or experiencing technical issues? Please include as much detail
                        as possible including your browser, device, and steps to reproduce the issue.
                    </p>
                    <a
                        href="mailto:bugs@upicks.ph"
                        className="inline-block mt-4 text-[#7b1113] font-semibold hover:underline"
                    >
                        bugs@upicks.ph
                    </a>
                </div>
            </div>
        </main>
    );
}
