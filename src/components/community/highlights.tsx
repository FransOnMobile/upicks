'use client';

import { useState, useEffect } from 'react';
import { Leaderboard } from './leaderboard';
import { Sparkles, Quote, MapPin, ArrowRight, ThumbsUp, ChevronRight } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function Highlights() {
    // defaults to 'week' effectively
    const timeRange = 'week';

    return (
        <div className="space-y-32 pb-20">
            {/* 1. Trending Professors (Leaderboard) */}
            <section className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold tracking-widest uppercase mb-4">
                        <Sparkles className="w-3 h-3" />
                        <span>Weekly Community Highlights</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-playfair font-black text-foreground tracking-tight">
                        This Week's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7b1113] to-[#fbbf24]">Stars</span>.
                    </h2>
                    <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
                        The professors, voices, and campuses sparking the most conversation this week.
                    </p>

                </div>

                <div className="pt-8 px-4">
                    <Leaderboard timeRange={timeRange} />
                    <p className="text-sm text-muted-foreground/50 max-w-xl mx-auto mt-8 italic">
                        🏆 The podium ranks professors based on the <span className="font-semibold text-foreground/70">most ratings received</span> this week.
                    </p>
                </div>
            </section>

            {/* 2. Community Voice (Editorial Quote) */}
            <TopCommentSection timeRange={timeRange} />

            {/* 3. Top Campus (Immersive Banner) */}
            <div className="max-w-7xl mx-auto px-4">
                <TopCampusSection timeRange={timeRange} />
            </div>
        </div>
    );
}

function TopCommentSection({ timeRange }: { timeRange: string }) {
    const [comment, setComment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComment = async () => {
            setLoading(true);
            const supabase = createClient();
            const interval = '7 days';

            const { data, error } = await supabase.rpc('get_top_helpful_comment', {
                time_range: interval
            });

            if (data && data.length > 0) {
                setComment(data[0]);
            } else {
                setComment(null);
            }
            setLoading(false);
        };
        fetchComment();
    }, [timeRange]);

    if (loading) return <Skeleton className="h-[400px] w-full max-w-5xl mx-auto rounded-3xl" />;

    if (!comment) {
        return (
            <section className="relative w-full py-16 px-4 overflow-hidden border-y border-border/30 bg-muted/20">
                <div className="max-w-3xl mx-auto text-center">
                    <Quote className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif text-foreground/80 mb-2">No Community Voice Yet</h3>
                    <p className="text-muted-foreground">Be the first to write a helpful review this week!</p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative w-full py-24 px-4 overflow-hidden border-y border-border/40 bg-muted/30">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-[0.03] pointer-events-none">
                <Quote className="absolute -top-10 -left-10 w-64 h-64 text-foreground rotate-12" />
                <Quote className="absolute -bottom-10 -right-10 w-64 h-64 text-foreground rotate-[192deg]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col items-center text-center mb-12">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#fbbf24] mb-3">The Community Voice</span>
                    <h3 className="text-3xl md:text-4xl font-serif text-foreground">Most Helpful Review</h3>
                </div>

                <Link href={`/rate/professor/${comment.professor_id}?reviewId=${comment.id}`} className="group block relative bg-card hover:bg-card/80 border border-border/50 hover:border-[#fbbf24]/50 rounded-[2.5rem] p-8 md:p-16 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01]">
                    <div className="absolute top-8 left-8 text-6xl font-serif text-[#fbbf24]/20 font-black">“</div>

                    <blockquote className="text-2xl md:text-4xl font-serif leading-relaxed text-foreground/90 italic text-center mb-12 relative z-10">
                        {comment.review_text}
                    </blockquote>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7b1113] to-[#590d0e] text-white flex items-center justify-center font-bold font-playfair text-xl shadow-lg ring-4 ring-background">
                                {comment.user_nickname.charAt(0)}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg text-foreground">{comment.user_nickname}</p>
                                <p className="text-sm text-muted-foreground">Verified Student</p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-12 bg-border/50" />

                        <div className="text-left">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Reviewing</p>
                            <div className="font-bold text-lg text-[#7b1113] group-hover:underline decoration-[#fbbf24] underline-offset-4 flex items-center gap-2">
                                Prof. {comment.professor_name}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-12 bg-border/50" />

                        <div className="flex items-center gap-2 bg-green-500/10 text-green-700 px-5 py-2.5 rounded-full border border-green-500/20 font-bold text-sm">
                            <ThumbsUp className="w-4 h-4 fill-current" />
                            {comment.helpful_count} Found Helpful
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    )
}

function TopCampusSection({ timeRange }: { timeRange: string }) {
    const [campus, setCampus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampus = async () => {
            setLoading(true);
            const supabase = createClient();
            const interval = '7 days';

            const { data, error } = await supabase.rpc('get_top_campus', {
                time_range: interval
            });

            if (data && data.length > 0) {
                setCampus(data[0]);
            }
            setLoading(false);
        };
        fetchCampus();
    }, [timeRange]);

    if (loading) return <Skeleton className="h-[400px] w-full rounded-xl" />;

    if (!campus) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold font-serif">Campus of the Week</h3>
                        <p className="text-muted-foreground">Highest rated campus based on student feedback</p>
                    </div>
                </div>
                <div className="bg-muted/30 border border-dashed border-border rounded-[2.5rem] p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h4 className="text-xl font-serif text-foreground/80 mb-2">No Campus Ratings Yet</h4>
                    <p className="text-muted-foreground max-w-md">Rate your campus experience to help it appear here!</p>
                    <Link href="/campuses" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7b1113] hover:underline">
                        Browse Campuses <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const CAMPUS_NAMES: Record<string, string> = {
        'diliman': 'UP Diliman',
        'los-banos': 'UP Los Baños',
        'manila': 'UP Manila',
        'visayas': 'UP Visayas',
        'baguio': 'UP Baguio',
        'cebu': 'UP Cebu',
        'mindanao': 'UP Mindanao',
        'ou': 'UP Open University'
    };

    const campusName = CAMPUS_NAMES[campus.campus_id] || campus.campus_id || 'Unknown Campus';

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold font-serif">Campus of the Week</h3>
                    <p className="text-muted-foreground">Highest rated campus based on student feedback</p>
                </div>
                <Link href="/campuses" className="hidden md:flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
                    View All Campuses
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <Link
                href={`/rate/campus/${campus.campus_id}`}
                className="group relative w-full min-h-[450px] flex items-end transition-transform duration-500 hover:scale-[1.005]"
            >
                {/* Visual Container (Rounded & Clipped) */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 z-0">
                    {/* Background Image / Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7b1113] via-[#590d0e] to-black transition-transform duration-700 group-hover:scale-105"></div>

                    {/* Organic Shapes */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fbbf24]/10 rounded-full blur-[100px] -mr-32 -mt-32 mix-blend-overlay animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[80px] -ml-20 -mb-20 mix-blend-overlay"></div>

                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("/noise.png")' }}></div>

                    {/* Large "Winner" Text Background */}
                    <div className="absolute top-10 w-full text-center overflow-hidden">
                        <h1 className="text-[13vw] font-black text-white/[0.04] leading-none uppercase font-playfair select-none pointer-events-none tracking-tighter transform group-hover:translate-y-2 transition-transform duration-700">
                            TopRated
                        </h1>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full p-8 md:p-16 flex flex-col md:flex-row items-end justify-between gap-8 text-white">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#fbbf24] text-black px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#fbbf24]/20">
                                #1 Top Rated
                            </div>
                        </div>

                        <div>
                            <h2 className="text-5xl md:text-8xl font-black font-playfair tracking-tighter leading-none mb-4 group-hover:text-[#fbbf24] transition-colors duration-300">
                                {campusName}
                            </h2>
                            <div className="flex items-center gap-3 text-white/80">
                                <MapPin className="w-5 h-5 text-[#fbbf24]" />
                                <span className="text-lg font-medium">Best Student Experience This Week</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-4 md:gap-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="text-center px-4">
                            <div className="text-5xl font-black text-[#fbbf24] tracking-tight">{campus.avg_rating}</div>
                            <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold mt-2">Avg Rating</div>
                        </div>
                        <div className="w-px h-16 bg-white/10" />
                        <div className="text-center px-4">
                            <div className="text-5xl font-black text-white tracking-tight">{campus.rating_count}</div>
                            <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold mt-2">New Reviews</div>
                        </div>
                        <div className="hidden lg:flex ml-4 rounded-full bg-white p-4 text-black group-hover:bg-[#fbbf24] group-hover:scale-110 transition-all duration-300 shadow-lg">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
