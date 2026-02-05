'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    School,
    Star,
    MessageSquare,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ClientDashboardProps {
    user: any;
    userProfile: any;
    recentRatings: any[];
    myProfRatings: any[];
    myCampusRatings: any[];
}

export function ClientDashboard({
    user,
    userProfile,
    recentRatings,
    myProfRatings,
    myCampusRatings
}: ClientDashboardProps) {
    const [profRatingsLimit, setProfRatingsLimit] = useState(3);
    const [campusRatingsLimit, setCampusRatingsLimit] = useState(3);

    const displayName = userProfile?.nickname || userProfile?.name || user.email?.split('@')[0] || 'Student';

    // Calculate total contributions
    const totalReviews = (myProfRatings?.length || 0) + (myCampusRatings?.length || 0);

    return (
        <main className="w-full bg-background min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold font-playfair text-foreground tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Welcome back, <span className="font-semibold text-foreground">{displayName}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/settings">
                            <Button variant="outline" size="sm">Settings</Button>
                        </Link>
                        <Link href="/rate">
                            <Button className="font-semibold shadow-lg shadow-primary/20">Rate a Professor</Button>
                        </Link>
                    </div>
                </header>

                {/* Stats & Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Stat 1: Profile Status */}
                    <Card className="rounded-2xl border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Academic Profile</CardTitle>
                            <School className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-playfair mb-1">
                                {userProfile.campus === 'diliman' ? 'UP Diliman' :
                                    userProfile.campus ? userProfile.campus.replace(/-/g, ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()) : 'UP System'}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                                {userProfile.degree_program} • {userProfile.year_level}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Stat 2: Contributions */}
                    <Card className="rounded-2xl border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Impact</CardTitle>
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-playfair mb-1">{totalReviews}</div>
                            <p className="text-xs text-muted-foreground">Total Reviews Contributed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="feed" className="w-full space-y-8">
                    <TabsList className="bg-muted/50 p-1 rounded-full border border-border/50 inline-flex">
                        <TabsTrigger value="feed" className="rounded-full px-6 py-2 text-sm">Activity Feed</TabsTrigger>
                        <TabsTrigger value="my-reviews" className="rounded-full px-6 py-2 text-sm">My Reviews</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Activity Feed */}
                    <TabsContent value="feed" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-playfair flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Community Highlights
                            </h2>
                            <Link href="/community" className="text-sm text-primary hover:underline font-medium">
                                View Full Feed
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentRatings && recentRatings.length > 0 ? (
                                recentRatings.map((rating: any) => {
                                    const isProf = rating.rating_type === 'professor';
                                    const href = isProf
                                        ? `/rate/professor/${rating.professor_id}`
                                        : `/rate/campus/${rating.campus_filter}`;

                                    return (
                                        <Link key={rating.id} href={href} className="block h-full group">
                                            <Card className="h-full flex flex-col rounded-xl border-border/40 bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                                                <CardHeader className="pb-3 space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <Badge variant={isProf ? "secondary" : "outline"} className="text-[10px] uppercase tracking-wider">
                                                            {isProf ? "Professor" : "Campus"}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            {rating.overall_rating}
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-lg font-playfair line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                        {rating.title}
                                                    </h3>
                                                </CardHeader>
                                                <CardContent className="flex-1">
                                                    <p className="text-sm text-foreground/70 line-clamp-3 italic font-serif leading-relaxed">
                                                        "{rating.review_text || 'No comment provided.'}"
                                                    </p>
                                                    <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground flex items-center justify-between">
                                                        <span>{isProf ? rating.course_code : (rating.campus_filter === 'diliman' ? 'UP Diliman' : 'Campus')}</span>
                                                        <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-16 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
                                    <p className="text-muted-foreground font-medium">No recent activity found.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab 2: My Reviews */}
                    <TabsContent value="my-reviews" className="animate-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Professor Reviews Column */}
                            <section className="space-y-4">
                                <h3 className="text-xl font-bold font-playfair flex items-center gap-2 text-foreground/80">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    Professor Reviews <span className="text-sm font-sans font-normal text-muted-foreground ml-2">({myProfRatings?.length || 0})</span>
                                </h3>

                                <div className="space-y-3">
                                    {myProfRatings && myProfRatings.length > 0 ? (
                                        <>
                                            {myProfRatings.slice(0, profRatingsLimit).map((rating: any) => (
                                                <Link key={rating.id} href={`/rate/professor/${rating.professors?.id}`} className="block group">
                                                    <Card className="rounded-xl border-border/40 hover:border-primary/50 transition-all hover:bg-muted/30">
                                                        <CardContent className="p-4 flex justify-between items-start gap-4">
                                                            <div className="space-y-1">
                                                                <div className="font-bold text-base group-hover:text-primary transition-colors">
                                                                    {rating.professors?.name}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground line-clamp-2 italic">"{rating.review_text}"</p>
                                                                <p className="text-xs text-muted-foreground/50 pt-1">{new Date(rating.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="shrink-0 flex items-center gap-1 font-bold text-sm bg-secondary/50 px-2 py-1 rounded">
                                                                <Star className="w-3 h-3 fill-current text-primary" />
                                                                {rating.overall_rating}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}

                                            {profRatingsLimit < myProfRatings.length && (
                                                <Button
                                                    variant="ghost"
                                                    className="w-full text-muted-foreground hover:text-primary text-sm"
                                                    onClick={() => setProfRatingsLimit(prev => prev + 5)}
                                                >
                                                    Show {Math.min(5, myProfRatings.length - profRatingsLimit)} More
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-8 text-center border border-dashed rounded-xl bg-muted/20">
                                            <p className="text-sm text-muted-foreground mb-4">You haven't rated any professors yet.</p>
                                            <Link href="/rate">
                                                <Button size="sm" variant="outline">Rate a Professor</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Campus Reviews Column */}
                            <section className="space-y-4">
                                <h3 className="text-xl font-bold font-playfair flex items-center gap-2 text-foreground/80">
                                    <School className="w-5 h-5 text-blue-500" />
                                    Campus Reviews <span className="text-sm font-sans font-normal text-muted-foreground ml-2">({myCampusRatings?.length || 0})</span>
                                </h3>

                                <div className="space-y-3">
                                    {myCampusRatings && myCampusRatings.length > 0 ? (
                                        <>
                                            {myCampusRatings.slice(0, campusRatingsLimit).map((rating: any) => (
                                                <Link key={rating.id} href={`/rate/campus/${rating.campus_id}`} className="block group">
                                                    <Card className="rounded-xl border-border/40 hover:border-primary/50 transition-all hover:bg-muted/30">
                                                        <CardContent className="p-4 flex justify-between items-start gap-4">
                                                            <div className="space-y-1">
                                                                <div className="font-bold text-base capitalize group-hover:text-primary transition-colors">
                                                                    {rating.campus_id.replace(/-/g, ' ')}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground line-clamp-2 italic">"{rating.review_text}"</p>
                                                                <p className="text-xs text-muted-foreground/50 pt-1">{new Date(rating.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="shrink-0 flex items-center gap-1 font-bold text-sm bg-secondary/50 px-2 py-1 rounded">
                                                                <Star className="w-3 h-3 fill-current text-primary" />
                                                                {rating.overall_rating}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}

                                            {campusRatingsLimit < myCampusRatings.length && (
                                                <Button
                                                    variant="ghost"
                                                    className="w-full text-muted-foreground hover:text-primary text-sm"
                                                    onClick={() => setCampusRatingsLimit(prev => prev + 5)}
                                                >
                                                    Show {Math.min(5, myCampusRatings.length - campusRatingsLimit)} More
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-8 text-center border border-dashed rounded-xl bg-muted/20">
                                            <p className="text-sm text-muted-foreground mb-4">You haven't rated any campuses yet.</p>
                                            <Link href="/campuses">
                                                <Button size="sm" variant="outline">Rate a Campus</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </section>

                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
