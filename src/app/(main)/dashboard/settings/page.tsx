'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, GraduationCap, Building2, Key, Trash2, Loader2, Check } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CAMPUSES = [
    { value: 'diliman', label: 'UP Diliman' },
    { value: 'los-banos', label: 'UP Los Baños' },
    { value: 'manila', label: 'UP Manila' },
    { value: 'visayas', label: 'UP Visayas' },
    { value: 'mindanao', label: 'UP Mindanao' },
    { value: 'baguio', label: 'UP Baguio' },
    { value: 'cebu', label: 'UP Cebu' },
    { value: 'open-university', label: 'UP Open University' },
];

const YEAR_LEVELS = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
    { value: '5th Year', label: '5th Year' },
    { value: 'Graduate', label: 'Graduate Student' },
    { value: 'Alumni', label: 'Alumni' },
];

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [campus, setCampus] = useState('');
    const [degreeProgram, setDegreeProgram] = useState('');
    const [yearLevel, setYearLevel] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/sign-in');
                return;
            }

            setEmail(user.email || '');

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setName(profile.name || '');
                setNickname(profile.nickname || '');
                setCampus(profile.campus || '');
                setDegreeProgram(profile.degree_program || '');
                setYearLevel(profile.year_level || '');
            }

            setLoading(false);
        };

        loadProfile();
    }, [router, supabase]);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('users')
            .update({
                name,
                nickname,
                campus,
                degree_program: degreeProgram,
                year_level: yearLevel,
            })
            .eq('id', user.id);

        setSaving(false);

        if (!error) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert('Failed to save changes: ' + error.message);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Delete user data from users table (this will cascade delete ratings)
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

        if (error) {
            alert('Failed to delete account: ' + error.message);
            setDeleting(false);
            return;
        }

        // Sign out
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-6 gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-playfair">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your profile and account preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your display name and personal details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed as it's used for account verification.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Account Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                                <p className="text-xs text-muted-foreground">This name is valid for account recovery and is <strong>not shared publicly</strong>.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nickname">Public Nickname (Optional)</Label>
                                <Input
                                    id="nickname"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="What should we call you?"
                                />
                                <p className="text-xs text-muted-foreground">This will be displayed on your profile and reviews. <strong>Do not use your real name.</strong></p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-primary" />
                                Academic Information
                            </CardTitle>
                            <CardDescription>
                                Update your campus, program, and year level
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Campus</Label>
                                <Select value={campus} onValueChange={setCampus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your campus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CAMPUSES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="degree">Degree Program</Label>
                                <Input
                                    id="degree"
                                    value={degreeProgram}
                                    onChange={(e) => setDegreeProgram(e.target.value)}
                                    placeholder="e.g., BS Computer Science"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Year Level</Label>
                                <Select value={yearLevel} onValueChange={setYearLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your year level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {YEAR_LEVELS.map((y) => (
                                            <SelectItem key={y.value} value={y.value}>
                                                {y.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full"
                        size="lg"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Saved!
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>

                    {/* Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-primary" />
                                Security
                            </CardTitle>
                            <CardDescription>
                                Manage your password and account security
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/reset-password">
                                <Button variant="outline" className="w-full">
                                    Change Password
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <Trash2 className="w-5 h-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Permanently delete your account and all associated data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        Delete Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            account and remove all your data including ratings and reviews.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            disabled={deleting}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {deleting ? 'Deleting...' : 'Yes, delete my account'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
