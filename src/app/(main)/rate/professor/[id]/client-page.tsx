'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, School, BookOpen, ThumbsUp, MessageSquare, ArrowLeft, ShieldCheck, Scale, MapPin, Skull } from 'lucide-react';
import { RatingForm } from '@/components/professor-search/rating-form';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getAvatarColor } from "@/lib/avatar-utils";
import { ProfessorNicknames } from "@/components/professor-nicknames";
import { ReviewReplies } from "@/components/review-replies";

interface ProfessorDetailsClientProps {
    professorId: string;
    initialData: {
        professor: any;
        reviews: any[];
        userVotes: string[]; // Passed as array, converted to Set
        ratedCourseIds: string[];
        availableTags?: any[]; // Optional initial tags
    }
}

export default function ProfessorDetailsClient({ professorId, initialData }: ProfessorDetailsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Initialize state from Server Data
    const [professor, setProfessor] = useState<any>(initialData.professor);
    const [reviews, setReviews] = useState<any[]>(initialData.reviews);
    const [ratedCourseIds, setRatedCourseIds] = useState<string[]>(initialData.ratedCourseIds);
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set(initialData.userVotes));

    const [localVotes, setLocalVotes] = useState<Set<string>>(new Set());
    const [votingMap, setVotingMap] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false); // No longer loading initially!
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [courses, setCourses] = useState<any[]>([]); // Lazy loaded
    const [tags, setTags] = useState<any[]>(initialData.availableTags || []);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [selectedReviewer, setSelectedReviewer] = useState<{ id: string, nickname: string } | null>(null);
    const [highlightedReviewId, setHighlightedReviewId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
    const [visibleCount, setVisibleCount] = useState(5);

    // Auth State Management
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setCurrentUserId(session?.user?.id);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const isAuth = !!session;
            setIsAuthenticated(isAuth);
            setCurrentUserId(session?.user?.id);
            if (!isAuth) {
                setShowRatingForm(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Lazy load courses only when needed
    useEffect(() => {
        if (showRatingForm && courses.length === 0) {
            const loadCourses = async () => {
                // Optimized: Do not fetch all 5000 if possible, but for now we mirror logic to avoid breaking
                // Ideally we should use a search API or filtered fetch.
                // We'll keep the limit as requested but move it here.
                const { data } = await supabase.from('courses').select('*').limit(5000).order('code');
                if (data) setCourses(data);

                // Also ensure tags if missing
                if (tags.length === 0) {
                    const { data: t } = await supabase.from('rating_tags').select('*');
                    if (t) setTags(t);
                }
            };
            loadCourses();
        }
    }, [showRatingForm, courses.length, tags.length, supabase]);

    useEffect(() => {
        // Load local votes for anon users
        if (!isAuthenticated && reviews.length > 0) {
            const local = new Set<string>();
            reviews.forEach(r => {
                if (localStorage.getItem(`upvoted_review_${r.id}`)) {
                    local.add(r.id);
                }
            });
            setLocalVotes(local);
        }

        // Handle Highlighted Review
        const reviewId = searchParams.get('reviewId');
        if (reviewId && !loading && reviews.length > 0) {
            setHighlightedReviewId(reviewId);
            // Wait a tick for rendering
            setTimeout(() => {
                const element = document.getElementById(`review-${reviewId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Remove highlight after 3 seconds
                    setTimeout(() => setHighlightedReviewId(null), 3000);
                }
            }, 500);
        }
    }, [reviews, isAuthenticated, loading, searchParams]);

    const handleUpvote = async (reviewId: string) => {
        if (votingMap[reviewId]) return; // Prevent spam
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

                const hasVoted = userVotes.has(reviewId);

                if (hasVoted) {
                    // Remove vote
                    updateState(-1, false);
                    await supabase.from('rating_votes').delete().match({ rating_id: reviewId, user_id: user.id });
                    await supabase.rpc('decrement_helpful_count', { row_id: reviewId });
                } else {
                    // Add vote
                    updateState(1, true);
                    const { error } = await supabase.from('rating_votes').insert({ rating_id: reviewId, user_id: user.id });
                    if (!error) {
                        await supabase.rpc('increment_helpful_count', { row_id: reviewId });
                    } else {
                        updateState(-1, false); // Revert
                    }
                }
            } else {
                // Anonymous Flow
                const key = `upvoted_review_${reviewId}`;
                const hasLocalVote = localStorage.getItem(key);

                if (hasLocalVote) {
                    localStorage.removeItem(key);
                    updateState(-1, false);
                    await supabase.rpc('decrement_helpful_count', { row_id: reviewId });
                } else {
                    localStorage.setItem(key, 'true');
                    updateState(1, true);
                    await supabase.rpc('increment_helpful_count', { row_id: reviewId });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setVotingMap(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    const handleRatingSubmit = async (data: any) => {
        if (!isAuthenticated) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: insertedRating, error } = await supabase
            .from('ratings')
            .insert({
                professor_id: professorId,
                course_id: data.courseId,
                user_id: user.id,
                teaching_quality: data.teachingQuality,
                fairness: data.fairness,
                clarity: data.clarity,
                difficulty: data.difficulty,
                mandatory_attendance: data.mandatoryAttendance,
                textbook_used: data.textbookUsed,
                grade_received: data.gradeReceived,
                review_text: data.reviewText,
                would_take_again: data.wouldTakeAgain,
                is_anonymous: data.isAnonymous
            })
            .select()
            .single();

        if (insertedRating && !error) {
            for (const tagId of data.selectedTags) {
                await supabase.from('rating_tag_associations').insert({ rating_id: insertedRating.id, tag_id: tagId });
            }
            window.location.reload(); // Simple reload to refresh data
        } else {
            console.error(error);
            alert("Failed to submit rating.");
        }
    };


    const handleReport = async (reviewId: string) => {
        if (!isAuthenticated) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const reason = prompt("Please provide a reason for reporting this review:");
        if (!reason) return;

        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                target_type: 'rating', // Correct schema value
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



    if (!professor) {
        return <div className="min-h-screen flex items-center justify-center">Professor not found</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Hero Section */}
            <div className="bg-[#7b1113] text-white pt-24 pb-12 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-white/70 hover:text-white mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-playfair font-bold border border-white/20 shadow-inner">
                            {professor.name.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-3 tracking-tight">
                                {professor.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/80 text-lg mb-6">
                                <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm">
                                    <School className="w-4 h-4" />
                                    {professor.department}
                                </span>
                                {professor.campus && (
                                    <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm border border-white/10">
                                        <MapPin className="w-4 h-4" />
                                        {professor.campus}
                                    </span>
                                )}
                                <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                    <Star className="w-4 h-4 fill-white text-white" />
                                    {professor.overallRating.toFixed(1)} / 5
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {professor.topTags.map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-[#fbbf24] text-[#7b1113] text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Professor Nicknames */}
                            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                <ProfessorNicknames
                                    professorId={professorId}
                                    professorName={professor.name}
                                    isAuthenticated={isAuthenticated}
                                    className="[&_.text-muted-foreground]:text-white/60 [&_.text-primary]:text-white [&_button]:text-white/80 [&_button:hover]:text-white [&_span]:text-white/90 [&_.bg-yellow-50]:bg-yellow-400/20 [&_.text-yellow-700]:text-yellow-200 [&_.border-yellow-400\/50]:border-yellow-200/50"
                                />
                            </div>
                        </div>

                        <div className="text-right hidden md:block">
                            <Button
                                size="lg"
                                className="bg-white text-[#7b1113] hover:bg-white/90 font-bold shadow-lg text-lg px-8"
                                onClick={() => {
                                    if (!isAuthenticated) router.push(`/sign-in?next=/rate/professor/${professorId}`);
                                    else setShowRatingForm(true);
                                }}
                            >
                                Rate {professor.name}
                            </Button>
                            {!isAuthenticated && (
                                <p className="text-white/60 text-xs mt-2 text-center">Anonymous rating available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Actions */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold font-playfair mb-6 flex items-center gap-2 pb-4 border-b border-border">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Quick Stats
                        </h3>
                        <div className="space-y-6">
                            <RatingBar label="Difficulty" icon={<Skull className="w-4 h-4" />} value={professor.difficulty} inverse />
                            <RatingBar label="Teaching" icon={<BookOpen className="w-4 h-4" />} value={professor.teachingQuality} />
                            <RatingBar label="Fairness" icon={<Scale className="w-4 h-4" />} value={professor.fairness} />
                            <RatingBar label="Clarity" icon={<MessageSquare className="w-4 h-4" />} value={professor.clarity} />
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">{professor.reviewCount}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Ratings</div>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">{professor.wouldTakeAgainPercentage}%</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Take Again</div>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6 text-lg py-6 font-semibold shadow-lg md:hidden"
                            onClick={() => {
                                if (!isAuthenticated) router.push(`/sign-in?next=/rate/professor/${professorId}`);
                                else setShowRatingForm(true);
                            }}
                        >
                            Rate this Professor
                        </Button>
                    </div>

                    {/* Subjects Taught Card */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold font-playfair mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Subjects Taught
                        </h3>
                        {professor.subjectStats && professor.subjectStats.length > 0 ? (
                            <div className="space-y-3">
                                {professor.subjectStats.map((stat: any) => (
                                    <div key={stat.code} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{stat.code}</span>
                                            <span className="text-xs text-muted-foreground">{stat.count} ratings</span>
                                        </div>
                                        <div className={`font-bold ${getRatingColor(stat.rating)}`}>
                                            {stat.rating.toFixed(1)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground text-sm py-4">
                                No ratings recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Reviews */}
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
                                    if (sortBy === 'highest') return b.rating - a.rating;
                                    if (sortBy === 'lowest') return a.rating - b.rating;
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
                                        isHighlighted={review.id === highlightedReviewId}
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
                        <div className="text-center py-12 opacity-60 bg-muted/20 rounded-xl border border-dashed border-border">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-bold">No reviews yet</h3>
                            <p className="text-muted-foreground">Be the first to rate this professor!</p>
                            <Button variant="link" onClick={() => setShowRatingForm(true)}>Write a review</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filtered courses based on campus, if available in course data */}
            <RatingForm
                isOpen={showRatingForm}
                onClose={() => setShowRatingForm(false)}
                professorId={professorId}
                professorName={professor?.name || ''}
                professorCampus={professor?.campus}
                courses={courses.filter(c => {
                    // Strict filtering:
                    // 1. If professor has a campus, ONLY show courses from that campus.
                    // 2. If professor has NO campus (unlikely for verified), show everything or just globals? 
                    //    Let's fallback to showing globals + matching campus if any.
                    if (professor?.campus) {
                        // STRICT MODE: Now that migration adds campus column, filter strictly.
                        // Courses without campus will be hidden (migration deletes them anyway).
                        if (!c.campus) return false;

                        const profCampus = professor.campus.toLowerCase().trim();
                        const courseCampus = c.campus.toLowerCase().trim();

                        // Strict match: exact or one contains the other (e.g., "diliman" matches "diliman")
                        return courseCampus === profCampus ||
                            (profCampus.length > 3 && courseCampus.includes(profCampus)) ||
                            (courseCampus.length > 3 && profCampus.includes(courseCampus));
                    }
                    return true;
                })}
                availableTags={tags}
                onSubmit={handleRatingSubmit}
                ratedCourseIds={ratedCourseIds}
            />

            <ReviewerProfileDialog
                isOpen={!!selectedReviewer}
                onClose={() => setSelectedReviewer(null)}
                userId={selectedReviewer?.id || ''}
                nickname={selectedReviewer?.nickname || ''}
            />
        </div >
    );
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
        if (count >= 20) return { title: "Senior Reviewer", icon: <BookOpen className="w-4 h-4" /> };
        if (count >= 10) return { title: "Junior Reviewer", icon: <BookOpen className="w-4 h-4" /> };
        if (count >= 5) return { title: "Sophomore Reviewer", icon: <BookOpen className="w-4 h-4" /> };
        return { title: "Freshman Reviewer", icon: <BookOpen className="w-4 h-4" /> };
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

function getRatingColor(rating: number, inverse = false) {
    if (inverse) {
        // For difficulty: 5 is "high difficulty" (red?), 1 is "easy" (green?)
        if (rating >= 4) return 'text-red-500';
        if (rating >= 2.5) return 'text-yellow-600';
        return 'text-green-600';
    }
    if (rating >= 4) return 'text-green-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
}

function ReviewCard({ review, onUpvote, onReport, isHelpful, helpfulCount, onUserClick, isHighlighted, isAuthenticated, currentUserId, initialReplyCount }: { review: any, onUpvote: any, onReport: any, isHelpful: boolean, helpfulCount: number, onUserClick?: (id: string, nickname: string) => void, isHighlighted?: boolean, isAuthenticated?: boolean, currentUserId?: string, initialReplyCount?: number }) {
    const hasRealNickname = !review.is_anonymous && review.nickname;

    const handleProfileClick = () => {
        if (hasRealNickname && review.user_id && onUserClick) {
            onUserClick(review.user_id, review.nickname);
        }
    };

    return (
        <div
            id={`review-${review.id}`}
            className={cn(
                "group bg-card hover:bg-muted/30 border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden",
                isHighlighted && "ring-4 ring-[#fbbf24] bg-[#fbbf24]/5"
            )}
        >
            {/* Gradient accent */}
            <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500
                ${review.overall_rating >= 4 ? 'bg-green-500' : review.overall_rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}
                opacity-50 group-hover:opacity-100`}></div>

            <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-4">
                    <div
                        onClick={handleProfileClick}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl font-playfair shadow-md transition-transform group-hover:scale-110 duration-300
                            ${hasRealNickname ? getAvatarColor(review.nickname) : review.rating >= 4 ? 'bg-green-600' : review.rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}
                            ${hasRealNickname ? 'cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary/50' : ''}`}
                    >
                        {hasRealNickname ? review.nickname.charAt(0).toUpperCase() : review.rating.toFixed(1)}
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
                        <div className="text-xs text-muted-foreground flex gap-2 items-center flex-wrap">
                            <span className="font-semibold text-foreground/80">{review.course || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            {review.grade && (
                                <>
                                    <span>•</span>
                                    <span className={review.grade.startsWith('1') ? 'text-green-600 font-medium' : ''}>
                                        Grade: {review.grade}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop Tags */}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50 pl-3">
                <div className="flex flex-col gap-1 text-center border-r border-border/50 last:border-0">
                    <span className="uppercase tracking-widest text-[10px]">Teaching</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.teaching_quality)}`}>{review.teaching_quality}</span>
                </div>
                <div className="flex flex-col gap-1 text-center border-r border-border/50 last:border-0">
                    <span className="uppercase tracking-widest text-[10px]">Fairness</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.fairness)}`}>{review.fairness}</span>
                </div>
                <div className="flex flex-col gap-1 text-center border-r border-border/50 last:border-0">
                    <span className="uppercase tracking-widest text-[10px]">Clarity</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.clarity)}`}>{review.clarity}</span>
                </div>
                <div className="flex flex-col gap-1 text-center">
                    <span className="uppercase tracking-widest text-[10px]">Diff</span>
                    <span className={`font-bold text-sm ${getRatingColor(review.difficulty, true)}`}>{review.difficulty}</span>
                </div>
            </div>

            {/* Text content */}
            <p className="text-foreground/90 leading-relaxed text-sm md:text-base mb-4 pl-3 whitespace-pre-wrap">
                {review.reviewText}
            </p>

            {/* Metadata & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50 pl-3">
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                        Attendance: {review.attendance}
                    </Badge>
                    {review.textbook_used && (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            Textbook Required
                        </Badge>
                    )}
                    {/* Mobile tags fallback */}
                    <div className="sm:hidden flex gap-1">
                        {review.tags && review.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
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
            </div>

            {/* Replies Section */}
            <ReviewReplies
                ratingId={review.id}
                type="professor"
                isAuthenticated={isAuthenticated || false}
                currentUserId={currentUserId}
                initialReplyCount={initialReplyCount}
                onUserClick={onUserClick}
            />
        </div>
    )
}

function RatingBar({ label, icon, value, inverse = false }: { label: string, icon: any, value: number, inverse?: boolean }) {
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
                    className={`h-full rounded-full transition-all duration-1000 ${getRatingBarColor(value, inverse)}`}
                    style={{ width: `${(value / 5) * 100}%` }}
                />
            </div>
        </div>
    )
}

function getRatingBarColor(rating: number, inverse: boolean) {
    if (inverse) {
        if (rating >= 4) return 'bg-red-500';
        if (rating >= 2.5) return 'bg-yellow-500';
        return 'bg-green-500';
    }
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
}
