import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

export default async function EmailConfirmedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If user is already logged in and confirmed, check if they need onboarding
    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('campus, degree_program, year_level')
            .eq('id', user.id)
            .single();

        // If profile is incomplete, redirect to onboarding
        if (!profile?.campus || !profile?.degree_program || !profile?.year_level) {
            redirect('/onboarding');
        }

        // Otherwise redirect to dashboard
        redirect('/dashboard');
    }

    // Show confirmation page for users who need to sign in
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-playfair">Email Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Your email has been verified successfully. You can now sign in to your account.
                    </p>
                </div>

                <Link href="/sign-in">
                    <Button size="lg" className="gap-2">
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
