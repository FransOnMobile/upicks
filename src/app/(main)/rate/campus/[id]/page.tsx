'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, School, ThumbsUp, MessageSquare, ArrowLeft, MapPin, ShieldCheck } from 'lucide-react';
import { CampusRatingForm } from '@/components/campus-rating-form';
import { Skeleton } from "@/components/ui/skeleton";

// Mock Data for Campus Details (since we don't have a campuses table)
const CAMPUSES: Record<string, any> = {
    "diliman": { name: "UP Diliman", location: "Quezon City", description: "The flagship campus known for its expansive grounds and diverse academic programs." },
    "los-banos": { name: "UP Los Baños", location: "Laguna", description: "A pioneer in agriculture, forestry, and environmental sciences." },
    "manila": { name: "UP Manila", location: "Manila", description: "The Health Sciences Center of the Philippines." },
    "visayas": { name: "UP Visayas", location: "Iloilo / Miagao", description: "Leading in fisheries and marine sciences education and research." },
    "baguio": { name: "UP Baguio", location: "Baguio City", description: "Known for its strong programs in unparalleled cordillera studies and the arts." },
    "cebu": { name: "UP Cebu", location: "Cebu City", description: "A center of excellence in design, IT, and business management in the region." },
    "mindanao": { name: "UP Mindanao", location: "Davao City", description: "Providing quality education and fostering development in the Mindanao region." },
    "ou": { name: "UP Open University", location: "Online / Los Baños", description: "Pioneering open and distance eLearning for lifelong education." },
};

export default function CampusDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const campusId = params.id as string;
    const supabase = createClient();
    const campusInfo = CAMPUSES[campusId];

    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [stats, setStats] = useState({
        overall: 0,
        facilities: 0,
        safety: 0,
        count: 0
    });

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);

            // Fetch Ratings
            const { data: ratingsData, error } = await supabase
                .from('campus_ratings')
                .select('*')
                .eq('campus_id', campusId)
                .order('created_at', { ascending: false });

            if (error && error.code) {
                console.error("Error loading campus ratings", error);
            }

            if (ratingsData) {
                setReviews(ratingsData);

                // Calculate Stats
                const count = ratingsData.length;
                if (count > 0) {
                    const avgOverall = ratingsData.reduce((acc, r) => acc + r.overall_rating, 0) / count;
                    const avgFac = ratingsData.reduce((acc, r) => acc + (r.facilities_rating || 0), 0) / count;
                    const avgSafe = ratingsData.reduce((acc, r) => acc + (r.safety_rating || 0), 0) / count;
                    setStats({
                        overall: avgOverall,
                        facilities: avgFac,
                        safety: avgSafe,
                        count
                    });
                }
            }
            setLoading(false);
        };

        if (campusInfo) {
            loadData();
        } else {
            setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const isAuth = !!session;
            setIsAuthenticated(isAuth);
            if (!isAuth) {
                setShowRatingForm(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [campusId, campusInfo]);

    const handleRatingSubmit = async (data: any) => {
        if (!isAuthenticated) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('campus_ratings')
            .insert({
                campus_id: campusId,
                user_id: user.id,
                overall_rating: data.overallRating,
                facilities_rating: data.facilitiesRating,
                safety_rating: data.safetyRating,
                location_rating: data.locationRating,
                student_life_rating: data.studentLifeRating,
                review_text: data.reviewText,
                is_anonymous: data.isAnonymous
            });

        if (error) {
            console.error(error);
            alert("Failed to submit rating.");
        } else {
            window.location.reload();
        }
    };

    const handleHelpful = async (reviewId: string) => {
        // Optimistic update
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r));

        // Actual DB update
        const currentReview = reviews.find(r => r.id === reviewId);
        if (!currentReview) return;

        const { error } = await supabase
            .from('campus_ratings')
            .update({ helpful_count: (currentReview.helpful_count || 0) + 1 })
            .eq('id', reviewId);

        if (error) {
            console.error("Error upvoting:", error);
            // Revert optimistic update
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: r.helpful_count } : r));
        }
    };

    const handleReport = async (reviewId: string) => {
        if (!isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const reason = prompt("Please provide a reason for reporting this review:");
        if (!reason) return;

        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                target_type: 'campus_rating',
                target_id: reviewId,
                reason: reason,
                status: 'pending'
            });

        if (error) {
            console.error("Error reporting:", error);
            alert("Failed to submit report.");
        } else {
            alert("Report submitted for review. Thank you for helping keep our community safe.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-20">
                {/* Skeleton Hero */}
                <div className="bg-muted/10 pt-24 pb-12 px-4 shadow-sm relative overflow-hidden">
                    <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-10 w-2/3 max-w-lg" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-5 w-48" />
                            </div>
                            <Skeleton className="h-20 w-full max-w-2xl" />
                        </div>
                    </div>
                </div>

                {/* Skeleton Content */}
                <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-8 w-40 mb-4" />
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                                <div className="flex justify-between">
                                    <div className="flex gap-4">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                </div>
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    if (!campusInfo) return <div className="min-h-screen flex items-center justify-center">Campus not found</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-[#7b1113] text-white pt-24 pb-12 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <button onClick={() => router.back()} className="flex items-center text-white/70 hover:text-white mb-6 transition-colors group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/80 border border-white/20 shadow-inner">
                            <School className="w-12 h-12" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-2 tracking-tight">{campusInfo.name}</h1>
                            <div className="flex items-center gap-2 text-white/80 text-lg mb-4">
                                <MapPin className="w-5 h-5" />
                                {campusInfo.location}
                            </div>
                            <p className="text-white/70 max-w-2xl text-lg">{campusInfo.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-end justify-end gap-2 mb-1">
                                <span className="text-6xl font-black font-playfair">{stats.overall.toFixed(1)}</span>
                                <span className="text-white/60 text-xl font-medium mb-2">/ 5.0</span>
                            </div>
                            <div className="text-white/80 font-medium">{stats.count} ratings</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Column */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold font-playfair mb-4 flex items-center gap-2">
                            Campus Ratings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Facilities</span>
                                <span className="font-semibold">{stats.facilities.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Safety</span>
                                <span className="font-semibold">{stats.safety.toFixed(1)}</span>
                            </div>
                        </div>
                        <Button
                            className="w-full mt-6 text-lg py-6 font-semibold shadow-lg bg-[#7b1113] hover:bg-[#901c1e]"
                            onClick={() => {
                                if (!isAuthenticated) router.push(`/sign-in?next=/rate/campus/${campusId}`);
                                else setShowRatingForm(true);
                            }}
                        >
                            Rate this Campus
                        </Button>
                    </div>
                </div>

                {/* Reviews Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold font-playfair">Student Reviews</h2>
                        <div className="flex gap-2">
                            <select
                                className="bg-card border border-border rounded-md text-sm p-2"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                        </div>
                    </div>

                    {reviews.length > 0 ? (
                        reviews
                            .sort((a, b) => {
                                if (sortBy === 'highest') return b.overall_rating - a.overall_rating;
                                if (sortBy === 'lowest') return a.overall_rating - b.overall_rating;
                                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                            })
                            .map((review) => (
                                <div key={review.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl font-playfair
                                            ${review.overall_rating >= 4 ? 'bg-green-600' : review.overall_rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                                {review.overall_rating}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    {review.is_anonymous ? 'Anonymous Student' : 'Verified Student'}
                                                    {!review.is_anonymous && (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20">
                                                            Verified
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Ratings Pill (only show if they exist) */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {review.facilities_rating > 0 && (
                                            <div className="text-xs bg-muted px-2 py-1 rounded-md flex items-center gap-1" title="Facilities Rating">
                                                <School className="w-3 h-3 text-muted-foreground" />
                                                <span>Fac: {review.facilities_rating}</span>
                                            </div>
                                        )}
                                        {review.safety_rating > 0 && (
                                            <div className="text-xs bg-muted px-2 py-1 rounded-md flex items-center gap-1" title="Safety Rating">
                                                <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                                                <span>Safe: {review.safety_rating}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-foreground/90 leading-relaxed text-sm md:text-base mb-6 whitespace-pre-wrap">
                                        {review.review_text || <span className="text-muted-foreground italic">No written review provided.</span>}
                                    </p>

                                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                        <button
                                            onClick={() => handleHelpful(review.id)}
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>Helpful ({review.helpful_count || 0})</span>
                                        </button>
                                        <button
                                            onClick={() => handleReport(review.id)}
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Report</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="text-center py-12 opacity-60 bg-muted/20 rounded-xl border border-dashed border-border">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-bold">No ratings yet</h3>
                            <p className="text-muted-foreground mb-4">Be the first to share your experience at {campusInfo.name}!</p>
                            <Button variant="outline" onClick={() => setShowRatingForm(true)}>Write a Review</Button>
                        </div>
                    )}
                </div>
            </div>

            <CampusRatingForm
                isOpen={showRatingForm}
                onClose={() => setShowRatingForm(false)}
                campusId={campusId}
                campusName={campusInfo.name}
                onSubmit={handleRatingSubmit}
            />
        </div>
    );
}
