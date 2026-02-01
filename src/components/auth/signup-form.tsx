"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { signUpAction, signInWithGoogle } from "@/app/actions";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const signUpSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email").refine(
        (email) => email.endsWith("@up.edu.ph"),
        "Email must end with @up.edu.ph"
    ),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    const onSubmit = (data: SignUpFormValues) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("full_name", data.full_name);
            formData.append("email", data.email);
            formData.append("password", data.password);

            // Call server action
            await signUpAction(formData);
            // Ideally actions should handle redirect/toast in a more integrated way or return state
            // But for simplicity in this hybrid approach, we trust the action's redirect or error
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
                <div className="space-y-2 text-center mb-6">
                    <h1 className="text-3xl font-bold font-playfair tracking-tight text-[#7b1113]">Sign up</h1>
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            className="text-primary font-medium hover:underline transition-all"
                            href="/sign-in"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => signInWithGoogle()}
                        formNoValidate
                        type="button"
                    >
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Sign up with Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="you@up.edu.ph" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <div className="text-xs text-muted-foreground">
                                        Must be 8+ chars, upper & lowercase, numbers
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
