import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { completeOnboardingAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormMessage, Message } from "@/components/form-message";

export default async function OnboardingPage(props: {
    searchParams: Promise<Message>;
}) {
    const searchParams = await props.searchParams;

    // Redirect to dashboard if profile is already complete
    // Redirect to dashboard if profile is already complete
    // We check for campus and year_level as the main indicators
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: userProfile } = await supabase
            .from("users")
            .select("campus, year_level")
            .eq("id", user.id)
            .single();

        if (userProfile?.campus && userProfile?.year_level) {
            return redirect("/dashboard");
        }
    }

    return (
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
                <p className="text-muted-foreground">
                    We need a few more details to personalize your experience.
                </p>
            </div>

            <form className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="campus">Campus</Label>
                    <div className="relative">
                        <select
                            id="campus"
                            name="campus"
                            required
                            defaultValue=""
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        >
                            <option value="" disabled>Select your campus</option>
                            <option value="diliman">UP Diliman</option>
                            <option value="los-banos">UP Los Baños</option>
                            <option value="manila">UP Manila</option>
                            <option value="visayas">UP Visayas</option>
                            <option value="baguio">UP Baguio</option>
                            <option value="cebu">UP Cebu</option>
                            <option value="mindanao">UP Mindanao</option>
                            <option value="ou">UP Open University</option>
                        </select>
                        <svg
                            className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="student_number">Student Number</Label>
                    <Input
                        id="student_number"
                        name="student_number"
                        placeholder="e.g. 202X-XXXXX"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="degree_program">Degree Program</Label>
                    <Input
                        id="degree_program"
                        name="degree_program"
                        placeholder="e.g. BS Computer Science"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="year_level">Year Level</Label>
                    <div className="relative">
                        <select
                            id="year_level"
                            name="year_level"
                            required
                            defaultValue=""
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        >
                            <option value="" disabled>Select year level</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="5th Year">5th Year</option>
                            <option value="Other">Other</option>
                        </select>
                        <svg
                            className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <SubmitButton
                    className="w-full"
                    formAction={completeOnboardingAction}
                    pendingText="Saving..."
                >
                    Complete Profile
                </SubmitButton>

                {searchParams && (
                    <FormMessage message={searchParams} />
                )}
            </form>
        </div>
    );
}
