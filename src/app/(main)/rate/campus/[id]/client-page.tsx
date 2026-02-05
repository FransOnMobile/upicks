'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { School, MapPin, ShieldCheck, ThumbsUp, MessageSquare, ArrowLeft, Star, TreePine, Utensils, Footprints } from 'lucide-react';
import { CampusRatingForm } from '@/components/campus-rating-form';
import { Skeleton } from "@/components/ui/skeleton";
import { submitCampusRating } from '@/app/actions/campus';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { ReviewReplies } from "@/components/review-replies";

// Enhanced Mock Data (Ideally fetch from DB if table exists, but hardcoded allows speed for now)
const CAMPUSES: Record<string, any> = {
    "diliman": {
        name: "UP Diliman",
        location: "Quezon City",
        description: "The flagship campus known for its expansive grounds, iconic oblation, and diverse academic programs.",
        color: "#7b1113",
        stats: { students: "25k+", area: "493 ha" }
    },
    "los-banos": {
        name: "UP Los Baños",
        location: "Laguna",
        description: "A pioneer in agriculture, forestry, and environmental sciences nestled at the foot of Mt. Makiling.",
        color: "#1e4d2b", // Green
        stats: { students: "12k+", area: "15,000 ha" }
    },
    "manila": {
        name: "UP Manila",
        location: "Manila",
        description: "The Health Sciences Center of the Philippines, dedicated to leadership in health education and research.",
        color: "#7b1113",
        stats: { students: "5k+", area: "14 ha" }
    },
    "visayas": {
        name: "UP Visayas",
        location: "Iloilo / Miagao",
        description: "Leading in fisheries and marine sciences education and research in the Visayas region.",
        color: "#005baa", // Blueish
        stats: { students: "4k+", area: "1,200 ha" }
    },
    "baguio": {
        name: "UP Baguio",
        location: "Baguio City",
        description: "Known for its strong programs in unparalleled cordillera studies and the arts.",
        color: "#7b1113",
        stats: { students: "2.5k+", area: "6 ha" }
    },
    "cebu": {
        name: "UP Cebu",
        location: "Cebu City",
        description: "A center of excellence in design, IT, and business management in the region.",
        color: "#7b1113",
        stats: { students: "1.5k+", area: "12 ha" }
    },
    "mindanao": {
        name: "UP Mindanao",
        location: "Davao City",
        description: "Providing quality education and fostering development in the Mindanao region.",
        color: "#7b1113",
        stats: { students: "1k+", area: "204 ha" }
    },
    "ou": {
        name: "UP Open University",
        location: "Online / Los Baños",
        description: "Pioneering open and distance eLearning for lifelong education.",
        color: "#7b1113",
        stats: { students: "4k+", area: "Virtual" }
    },
};

interface CampusDetailsClientProps {
    campusId: string;
}

export default function CampusDetailsClient({ campusId }: CampusDetailsClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const campusInfo = CAMPUSES[campusId];

    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [tags, setTags] = useState<any[]>([]);
    const [selectedReviewer, setSelectedReviewer] = useState<{ id: string, nickname: string } | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
    const [visibleCount, setVisibleCount] = useState(5);

    // Stats
    const [stats, setStats] = useState({
        overall: 0,
        facilities: 0,
        safety: 0,
        location: 0,
        studentLife: 0,
        count: 0,
        topTags: [] as string[]

    });


    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [localVotes, setLocalVotes] = useState<Set<string>>(new Set());
    const [votingMap, setVotingMap] = useState<Record<string, boolean>>({});

    // Fetch user votes if authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            // Load local votes
            const local = new Set<string>();
            reviews.forEach(r => {
                if (localStorage.getItem(`upvoted_campus_review_${r.id}`)) {
                    local.add(r.id);
                }
            });
            setLocalVotes(local);
            return;
        }

        const fetchVotes = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: votes } = await supabase
                    .from('campus_rating_votes')
                    .select('rating_id')
                    .eq('user_id', user.id);

                // If this is wrong, it will just return empty.
                if (votes) setUserVotes(new Set(votes.map(v => v.rating_id)));
            }
        }
        fetchVotes();
    }, [isAuthenticated, reviews.length]); // Dependencies

    const handleUpvote = async (reviewId: string) => {
        // Prevent spam clicking
        if (votingMap[reviewId]) return;
        setVotingMap(prev => ({ ...prev, [reviewId]: true }));

        const updateState = (delta: number, isVoted: boolean) => {
            setReviews(prev => prev.map(r =>
                r.id === reviewId ? { ...r, helpful_count: Math.max(0, (r.helpful_count || 0) + delta) } : r
            ));

            if (isAuthenticated) {
                setUserVotes(prev => {
                    const newSet = new Set(prev);
                    isVoted ? newSet.add(reviewId) : newSet.delete(reviewId);
                    return newSet;
                });
            } else {
                setLocalVotes(prev => {
                    const newSet = new Set(prev);
                    isVoted ? newSet.add(reviewId) : newSet.delete(reviewId);
                    return newSet;
                });
            }
        };

        try {
            if (isAuthenticated) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const isVoted = userVotes.has(reviewId);

                if (isVoted) {
                    // Remove vote
                    updateState(-1, false);
                    const { error } = await supabase
                        .from('campus_rating_votes')
                        .delete()
                        .match({ rating_id: reviewId, user_id: user.id });

                    if (!error) {
                        await supabase.rpc('decrement_campus_helpful_count', { row_id: reviewId });
                    } else {
                        // Revert
                        updateState(1, true);
                        console.error(error);
                    }
                } else {
                    // Add vote
                    updateState(1, true);
                    const { error } = await supabase
                        .from('campus_rating_votes')
                        .insert({ rating_id: reviewId, user_id: user.id });

                    if (!error) {
                        await supabase.rpc('increment_campus_helpful_count', { row_id: reviewId });
                    } else {
                        // Revert
                        updateState(-1, false);
                        console.error(error);
                    }
                }
            } else {
                // Local Storage Logic
                const key = `upvoted_campus_review_${reviewId}`;
                const hasLocalVote = localStorage.getItem(key);

                if (hasLocalVote) {
                    localStorage.removeItem(key);
                    updateState(-1, false);
                    await supabase.rpc('decrement_campus_helpful_count', { row_id: reviewId });
                } else {
                    localStorage.setItem(key, 'true');
                    updateState(1, true);
                    await supabase.rpc('increment_campus_helpful_count', { row_id: reviewId });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setVotingMap(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    const handleReport = async (reviewId: string) => {
        if (!isAuthenticated) {
            alert("Please sign in to report reviews.");
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

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setCurrentUserId(session?.user?.id);

            // Fetch Ratings with Tags
            const { data: ratingsData, error } = await supabase
                .from('campus_ratings')
                .select(`
                    *,
                    campus_rating_tag_associations (
                        campus_tags (name)
                    ),
                    users (nickname),
                    user_id,
                    campus_rating_replies(count)
                `)
                .eq('campus_id', campusId)
                .order('created_at', { ascending: false });

            if (ratingsData) {
                // Process Reviews
                const formattedReviews = ratingsData.map((r: any) => ({
                    ...r,
                    tags: r.campus_rating_tag_associations?.map((t: any) => t.campus_tags?.name).filter(Boolean) || [],
                    nickname: r.users?.nickname || null,
                    displayName: r.is_anonymous ? 'Anonymous Student' : (r.users?.nickname || 'Verified Student'),
                    reply_count: r.campus_rating_replies?.[0]?.count || 0
                }));

                setReviews(formattedReviews);

                // Calculate Stats
                const count = ratingsData.length;
                if (count > 0) {
                    const avgOverall = ratingsData.reduce((acc, r) => acc + r.overall_rating, 0) / count;
                    const avgFac = ratingsData.reduce((acc, r) => acc + (r.facilities_rating || 0), 0) / count;
                    const avgSafe = ratingsData.reduce((acc, r) => acc + (r.safety_rating || 0), 0) / count;
                    const avgLoc = ratingsData.reduce((acc, r) => acc + (r.location_rating || 0), 0) / count;
                    const avgLife = ratingsData.reduce((acc, r) => acc + (r.student_life_rating || 0), 0) / count;

                    // Tag Counts
                    const tagCounts: Record<string, number> = {};
                    formattedReviews.forEach(r => {
                        r.tags.forEach((t: string) => tagCounts[t] = (tagCounts[t] || 0) + 1);
                    });
                    const topTags = Object.entries(tagCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([name]) => name);

                    setStats({
                        overall: avgOverall,
                        facilities: avgFac,
                        safety: avgSafe,
                        location: avgLoc,
                        studentLife: avgLife,
                        count,
                        topTags
                    });
                }
            }

            // Fetch Tags for Form
            const { data: tagsData } = await supabase.from('campus_tags').select('*');
            if (tagsData) setTags(tagsData);

            setLoading(false);
        };

        if (campusInfo) {
            loadData();
        } else {
            setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, [campusId, campusInfo]);

    const handleRatingSubmit = async (data: any) => {
        try {
            const payload = {
                campusId,
                overallRating: data.overallRating,
                facilitiesRating: data.facilitiesRating,
                safetyRating: data.safetyRating,
                locationRating: data.locationRating,
                studentLifeRating: data.studentLifeRating,
                reviewText: data.reviewText,
                isAnonymous: data.isAnonymous,
                selectedTags: data.selectedTags
            };

            // Dynamically import to avoid server-action-in-client issues depending on Next.js version,
            // but standard import at top is usually fine.
            // Using the imported action:
            const result = await submitCampusRating(payload);

            if (result.error) {
                alert(result.error);
                return;
            }

            // Mark local storage as double-protection
            localStorage.setItem(`rated_campus_${campusId}`, Date.now().toString());
            window.location.reload();

        } catch (err) {
            console.error(err);
            alert("An unexpected error occurred.");
        }
    };

    if (loading) return <CampusSkeleton />;
    if (!campusInfo) return <div className="min-h-screen flex items-center justify-center">Campus not found</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div
                className="text-white pt-24 pb-12 px-4 shadow-xl relative overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: campusInfo.color || '#7b1113' }}
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <button onClick={() => router.back()} className="flex items-center text-white/70 hover:text-white mb-6 transition-colors group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/90 border border-white/20 shadow-inner">
                            <School className="w-12 h-12" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-3 tracking-tight">{campusInfo.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/80 text-lg mb-6">
                                <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm">
                                    <MapPin className="w-4 h-4" />
                                    {campusInfo.location}
                                </span>
                                {stats.count > 0 && (
                                    <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                        <Star className="w-4 h-4 fill-white text-white" />
                                        {stats.overall.toFixed(1)} / 5
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {stats.topTags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-[#fbbf24] text-[#7b1113] text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className="text-white/80 max-w-2xl text-lg leading-relaxed">{campusInfo.description}</p>
                        </div>

                        <div className="text-right hidden md:block">
                            <Button
                                size="lg"
                                className="bg-white text-[#7b1113] hover:bg-white/90 font-bold shadow-lg text-lg px-8"
                                onClick={() => setShowRatingForm(true)}
                            >
                                Rate {campusInfo.name}
                            </Button>
                            {!isAuthenticated && (
                                <p className="text-white/60 text-xs mt-2 text-center">Anonymous rating available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Column */}
                <div className="space-y-8">
                    {/* Quick Stats Card */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold font-playfair mb-6 flex items-center gap-2 pb-4 border-b border-border">
                            Campus Ratings
                        </h3>
                        <div className="space-y-6">
                            <RatingBar label="Facilities" icon={<School className="w-4 h-4" />} value={stats.facilities} />
                            <RatingBar label="Safety" icon={<ShieldCheck className="w-4 h-4" />} value={stats.safety} />
                            <RatingBar label="Location" icon={<MapPin className="w-4 h-4" />} value={stats.location} />
                            <RatingBar label="Student Life" icon={<Utensils className="w-4 h-4" />} value={stats.studentLife} />
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">{stats.count}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Ratings</div>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">{((stats.overall / 5) * 100).toFixed(0)}%</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Satisfaction</div>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6 md:hidden"
                            size="lg"
                            onClick={() => setShowRatingForm(true)}
                        >
                            Rate {campusInfo.name}
                        </Button>
                    </div>

                    {/* About Card */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold font-playfair mb-4">About Campus</h3>
                        <dl className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Students</dt>
                                <dd className="font-semibold">{campusInfo.stats?.students || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Land Area</dt>
                                <dd className="font-semibold">{campusInfo.stats?.area || 'N/A'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Reviews Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold font-playfair">Student Reviews</h2>
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

                    {reviews.length > 0 ? (
                        <>
                            {reviews
                                .sort((a, b) => {
                                    if (sortBy === 'highest') return b.overall_rating - a.overall_rating;
                                    if (sortBy === 'lowest') return a.overall_rating - b.overall_rating;
                                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                })
                                .slice(0, visibleCount)
                                .map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        onUpvote={handleUpvote}
                                        onReport={handleReport}
                                        isHelpful={isAuthenticated ? userVotes.has(review.id) : localVotes.has(review.id)}
                                        helpfulCount={review.helpful_count}
                                        onUserClick={(id, nickname) => setSelectedReviewer({ id, nickname })}
                                        isAuthenticated={isAuthenticated}
                                        currentUserId={currentUserId}
                                        initialReplyCount={review.reply_count}
                                    />
                                ))}

                            {visibleCount < reviews.length && (
                                <div className="flex justify-center mt-8 pb-8">
                                    <Button
                                        variant="outline"
                                        onClick={() => setVisibleCount(prev => prev + 5)}
                                        className="w-full md:w-auto min-w-[200px]"
                                    >
                                        Load More Reviews ({reviews.length - visibleCount} remaining)
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 opacity-60 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No ratings yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm">Be the first to share your experience at {campusInfo.name} and help others.</p>
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
                availableTags={tags} // Passed to form
            />

            <ReviewerProfileDialog
                isOpen={!!selectedReviewer}
                onClose={() => setSelectedReviewer(null)}
                userId={selectedReviewer?.id || ''}
                nickname={selectedReviewer?.nickname || ''}
            />
        </div>
    );
}

function getAvatarColor(nickname: string) {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
        'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
        'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
        'bg-pink-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < nickname.length; i++) {
        hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function ReviewerProfileDialog({ isOpen, onClose, userId, nickname }: { isOpen: boolean, onClose: () => void, userId: string, nickname: string }) {
    const supabase = createClient();
    const [stats, setStats] = useState<{ count: number, helpful: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            const fetchStats = async () => {
                // PRIVACY: Only fetch metrics for PUBLIC (non-anonymous) reviews.

                // 1. Professor Ratings
                const { count: profCount, error: profError } = await supabase
                    .from('ratings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                const { data: profHelpful } = await supabase
                    .from('ratings')
                    .select('helpful_count')
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                // 2. Campus Ratings
                const { count: campusCount, error: campusError } = await supabase
                    .from('campus_ratings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                const { data: campusHelpful } = await supabase
                    .from('campus_ratings')
                    .select('helpful_count')
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                const totalCount = (profCount || 0) + (campusCount || 0);
                const totalHelpful = (profHelpful?.reduce((acc, r) => acc + (r.helpful_count || 0), 0) || 0) +
                    (campusHelpful?.reduce((acc, r) => acc + (r.helpful_count || 0), 0) || 0);

                setStats({ count: totalCount, helpful: totalHelpful });
                setLoading(false);
            };
            fetchStats();
        }
    }, [isOpen, userId]);

    // Level calculation
    const getLevel = (count: number) => {
        if (count >= 50) return { title: "Dean's List", icon: <School className="w-4 h-4" /> };
        if (count >= 20) return { title: "Senior Reviewer", icon: <School className="w-4 h-4" /> };
        if (count >= 10) return { title: "Junior Reviewer", icon: <School className="w-4 h-4" /> };
        if (count >= 5) return { title: "Sophomore Reviewer", icon: <School className="w-4 h-4" /> };
        return { title: "Freshman Reviewer", icon: <School className="w-4 h-4" /> };
    };

    const level = stats ? getLevel(stats.count) : { title: "...", icon: null };
    const avatarColor = getAvatarColor(nickname);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl font-playfair shadow-xl ${avatarColor}`}>
                            {nickname.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center space-y-1">
                            <DialogTitle className="text-2xl font-bold font-playfair">{nickname}</DialogTitle>
                            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground items-center gap-1">
                                {level.icon}
                                {level.title}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-8 px-4">
                    <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/50">
                        <div className="text-3xl font-bold text-foreground mb-1">{loading ? "..." : stats?.count}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Reviews</div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/50">
                        <div className="text-3xl font-bold text-foreground mb-1 flex items-center justify-center gap-2">
                            {loading ? "..." : stats?.helpful}
                            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Helpful Votes</div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button variant="outline" onClick={onClose} className="w-full">Close Profile</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RatingBar({ label, icon, value }: { label: string, icon: any, value: number }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    {icon}
                    <span>{label}</span>
                </div>
                <span className="font-semibold">{value.toFixed(1)}</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#7b1113] rounded-full transition-all duration-1000"
                    style={{ width: `${(value / 5) * 100}%` }}
                />
            </div>
        </div>
    )
}

function ReviewCard({ review, onUpvote, onReport, isHelpful, helpfulCount, onUserClick, isAuthenticated, currentUserId, initialReplyCount }: { review: any, onUpvote: any, onReport: any, isHelpful: boolean, helpfulCount: number, onUserClick?: (id: string, nickname: string) => void, isAuthenticated?: boolean, currentUserId?: string, initialReplyCount?: number }) {
    const hasRealNickname = !review.is_anonymous && review.nickname;

    const handleProfileClick = () => {
        if (hasRealNickname && review.user_id && onUserClick) {
            onUserClick(review.user_id, review.nickname);
        }
    };

    return (
        <div className="group bg-card hover:bg-muted/30 border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            {/* Gradient accent */}
            <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500
                ${review.overall_rating >= 4 ? 'bg-green-500' : review.overall_rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}
                opacity-50 group-hover:opacity-100`}></div>

            <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-4">
                    <div
                        onClick={handleProfileClick}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl font-playfair shadow-md transition-transform group-hover:scale-110 duration-300
                        ${hasRealNickname ? getAvatarColor(review.nickname) : review.overall_rating >= 4 ? 'bg-green-600' : review.overall_rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}
                        ${hasRealNickname ? 'cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary/50' : ''}`}
                    >
                        {hasRealNickname ? review.nickname.charAt(0).toUpperCase() : review.overall_rating.toFixed(1)}
                    </div>
                    <div>
                        <div
                            onClick={handleProfileClick}
                            className={`font-bold text-foreground flex items-center gap-2 ${hasRealNickname ? 'cursor-pointer hover:underline decoration-dotted' : ''}`}
                        >
                            {review.displayName}
                            {hasRealNickname && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                {review.tags && review.tags.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[200px]">
                        {review.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] bg-secondary/70 hover:bg-secondary">
                                {tag}
                            </Badge>
                        ))}
                        {review.tags.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">+{review.tags.length - 3}</Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50 pl-3">
                <div className="flex flex-col gap-1 text-center border-r border-border/50 last:border-0">
                    <span className="uppercase tracking-widest text-[10px]">Facilities</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.facilities_rating)}`}>{review.facilities_rating}</span>
                </div>
                <div className="flex flex-col gap-1 text-center border-r border-border/50 last:border-0">
                    <span className="uppercase tracking-widest text-[10px]">Safety</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.safety_rating)}`}>{review.safety_rating}</span>
                </div>
                <div className="flex flex-col gap-1 text-center border-r border-border/50 last:border-0">
                    <span className="uppercase tracking-widest text-[10px]">Location</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.location_rating)}`}>{review.location_rating}</span>
                </div>
                <div className="flex flex-col gap-1 text-center">
                    <span className="uppercase tracking-widest text-[10px]">Social</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.student_life_rating)}`}>{review.student_life_rating}</span>
                </div>
            </div>

            <p className="text-foreground/90 leading-relaxed text-sm md:text-base mb-4 whitespace-pre-wrap pl-3">
                {review.review_text || <span className="text-muted-foreground italic">No written review provided.</span>}
            </p>

            {/* Mobile tags show at bottom */}
            <div className="sm:hidden flex flex-wrap gap-2 pl-3 mb-4">
                {review.tags && review.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                    </Badge>
                ))}
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border/50 pl-3">
                <button
                    onClick={() => onUpvote(review.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${isHelpful
                        ? 'text-[#800000] font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
                    <span>Helpful ({helpfulCount})</span>
                </button>
                <button
                    onClick={() => onReport(review.id)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>Report</span>
                </button>
            </div>

            {/* Replies Section */}
            <ReviewReplies
                ratingId={review.id}
                type="campus"
                isAuthenticated={isAuthenticated || false}
                currentUserId={currentUserId}
                initialReplyCount={initialReplyCount}
                onUserClick={onUserClick}
            />
        </div>
    )
}

function getRatingColor(rating: number) {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
}

function CampusSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-muted/10 pt-24 pb-12 px-4 shadow-sm relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <Skeleton className="w-32 h-32 rounded-2xl" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                </div>
            </div>
        </div>
    )
}
