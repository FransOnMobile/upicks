'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, School, BookOpen, ThumbsUp, MessageSquare, ArrowLeft, ShieldCheck, Scale, MapPin } from 'lucide-react';
import { RatingForm } from '@/components/professor-search/rating-form';
import { Skeleton } from "@/components/ui/skeleton";
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

interface ProfessorDetailsClientProps {
    professorId: string;
}

export default function ProfessorDetailsClient({ professorId }: ProfessorDetailsClientProps) {
    const router = useRouter();
    const supabase = createClient();

    const [professor, setProfessor] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [ratedCourseIds, setRatedCourseIds] = useState<string[]>([]);
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [localVotes, setLocalVotes] = useState<Set<string>>(new Set());
    const [votingMap, setVotingMap] = useState<Record<string, boolean>>({});
    const [isThinking, setIsThinking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [selectedReviewer, setSelectedReviewer] = useState<{ id: string, nickname: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);

            // Fetch Professor Details
            const { data: profData, error } = await supabase
                .from('professors')
                .select(`
                    *,
                    departments:department_id (name)
                `)
                .eq('id', professorId)
                .single();

            if (error || !profData) {
                console.error("Error loading professor", error);
                setLoading(false);
                return;
            }

            // Fetch User Data & Votes if authenticated
            if (session?.user) {
                const { data: userRatings } = await supabase
                    .from('ratings')
                    .select('course_id')
                    .eq('professor_id', professorId)
                    .eq('user_id', session.user.id);

                if (userRatings) {
                    setRatedCourseIds(userRatings.map(r => r.course_id));
                }

                const { data: votes } = await supabase
                    .from('rating_votes')
                    .select('rating_id')
                    .eq('user_id', session.user.id);

                if (votes) {
                    setUserVotes(new Set(votes.map(v => v.rating_id)));
                }
            }

            // Fetch Reviews
            // Fetch Reviews
            const { data: ratingsData } = await supabase
                .from('ratings')
                .select(`
                    *,
                    courses (code, name),
                    rating_tag_associations (
                        rating_tags (name)
                    ),
                    users (nickname),
                    user_id
                `)
                .eq('professor_id', professorId)
                .order('created_at', { ascending: false });

            // Process Reviews & Stats
            const formattedReviews = ratingsData?.map((r: any) => ({
                id: r.id,
                rating: r.overall_rating,
                reviewText: r.review_text || '',
                course: r.courses?.code || 'Unknown',
                tags: r.rating_tag_associations?.map((t: any) => t.rating_tags?.name).filter(Boolean) || [],
                helpful_count: r.helpful_count || 0,
                created_at: r.created_at,
                is_anonymous: r.is_anonymous,
                teaching_quality: r.teaching_quality,
                fairness: r.fairness,
                clarity: r.clarity,
                difficulty: r.difficulty, // Added difficulty mapping
                grade: r.grade_received,
                attendance: r.mandatory_attendance ? 'Mandatory' : 'Optional',
                would_take_again: r.would_take_again,
                nickname: r.users?.nickname || null,
                user_id: r.user_id,
                displayName: r.is_anonymous ? 'Anonymous Student' : (r.users?.nickname || 'Verified Student')
            })) || [];

            // Calculate Aggregates
            const totalReviews = formattedReviews.length;
            const avgRating = totalReviews > 0
                ? formattedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;

            const avgDifficulty = totalReviews > 0
                ? formattedReviews.reduce((sum, r) => sum + (r.difficulty || 0), 0) / totalReviews
                : 0;

            const avgTeaching = totalReviews > 0
                ? formattedReviews.reduce((sum, r) => sum + (r.teaching_quality || 0), 0) / totalReviews
                : 0;

            const avgFairness = totalReviews > 0
                ? formattedReviews.reduce((sum, r) => sum + (r.fairness || 0), 0) / totalReviews
                : 0;

            const avgClarity = totalReviews > 0
                ? formattedReviews.reduce((sum, r) => sum + (r.clarity || 0), 0) / totalReviews
                : 0;

            const wouldTakeAgainCount = formattedReviews.filter(r => r.would_take_again).length;
            const wouldTakeAgainPercentage = totalReviews > 0
                ? Math.round((wouldTakeAgainCount / totalReviews) * 100)
                : 0;

            // Extract top tags
            const tagCounts: Record<string, number> = {};
            formattedReviews.forEach(r => {
                r.tags.forEach((t: string) => tagCounts[t] = (tagCounts[t] || 0) + 1);
            });
            const topTags = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a) // Sort by count descending
                .slice(0, 5) // Take top 5
                .map(([name]) => name);

            // Subject Stats
            const subjectStatsMap: Record<string, { total: number, count: number }> = {};
            formattedReviews.forEach(r => {
                const code = r.course || 'Unknown';
                if (!subjectStatsMap[code]) {
                    subjectStatsMap[code] = { total: 0, count: 0 };
                }
                subjectStatsMap[code].total += r.rating;
                subjectStatsMap[code].count += 1;
            });

            const subjectStats = Object.entries(subjectStatsMap).map(([code, data]) => ({
                code,
                rating: data.total / data.count,
                count: data.count
            })).sort((a, b) => b.count - a.count);

            setProfessor({
                ...profData,
                departments: profData.departments,
                overallRating: avgRating,
                reviewCount: totalReviews,
                wouldTakeAgainPercentage,
                difficulty: avgDifficulty,
                teachingQuality: avgTeaching,
                fairness: avgFairness,
                clarity: avgClarity,
                topTags: topTags,
                subjectStats
            });

            setReviews(formattedReviews);

            // Load Metadata for Form
            // Fetch courses with a higher limit to bypass default 1000 row limit
            // Ideally we filter by campus server-side, but due to Potential string mismatches ("UP Mindanao" vs "mindanao"),
            // we will fetch a larger batch and filter client-side for now, or use a permissive query if possible.
            // For now, increasing limit is the safest fix for "Deep recurring issue" of missing data.
            // Using Promise.all for parallel fetching (performance optimization)
            const [coursesResult, tagsResult] = await Promise.all([
                supabase
                    .from('courses')
                    .select('*')
                    .limit(5000)
                    .order('code'),
                supabase.from('rating_tags').select('*')
            ]);

            const coursesData = coursesResult.data;
            let tagsData = tagsResult.data;

            // Seed tags if empty
            if (!tagsData || tagsData.length === 0) {
                const defaultTags = [
                    { name: 'Inspirational', category: 'positive' },
                    { name: 'Respected', category: 'positive' },
                    { name: 'Accessible', category: 'positive' },
                    { name: 'Clear Grading', category: 'positive' },
                    { name: 'Engaging', category: 'positive' },
                    { name: 'Gives Feedback', category: 'positive' },
                    { name: 'Tough Grader', category: 'negative' },
                    { name: 'Late Grader', category: 'negative' },
                    { name: 'Monotone', category: 'negative' },
                    { name: 'Heavy Workload', category: 'negative' },
                    { name: 'Strict Attendance', category: 'negative' },
                    { name: 'Pop Quizzes', category: 'neutral' }
                ];

                const { error: seedError } = await supabase.from('rating_tags').insert(defaultTags);
                if (!seedError) {
                    const { data: refreshedTags } = await supabase.from('rating_tags').select('*');
                    tagsData = refreshedTags;
                }
            }

            if (coursesData) setCourses(coursesData);
            if (tagsData) setTags(tagsData);

            setLoading(false);
        };

        loadData();

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
    }, [professorId]);

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
    }, [reviews, isAuthenticated]);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-20">
                {/* Skeleton Header */}
                <div className="bg-muted/10 pt-24 pb-12 px-4 shadow-sm relative overflow-hidden">
                    <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-10 w-3/4 max-w-md" />
                            <div className="flex gap-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Skeleton Stats */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-14 w-full mt-6 rounded-lg" />
                        </div>
                    </div>

                    {/* Skeleton Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-8 w-48 mb-4" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                                <div className="flex justify-between">
                                    <div className="flex gap-4">
                                        <Skeleton className="w-12 h-12 rounded-lg" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                                    className="[&_.text-muted-foreground]:text-white/60 [&_.text-primary]:text-white [&_button]:text-white/80 [&_button:hover]:text-white [&_span]:text-white/90"
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
                            <RatingBar label="Difficulty" icon={<ShieldCheck className="w-4 h-4" />} value={professor.difficulty} inverse />
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
                        reviews
                            .sort((a, b) => {
                                if (sortBy === 'highest') return b.rating - a.rating;
                                if (sortBy === 'lowest') return a.rating - b.rating;
                                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                            })
                            .map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onUpvote={handleUpvote}
                                    onReport={handleReport}
                                    isHelpful={isAuthenticated ? userVotes.has(review.id) : localVotes.has(review.id)}
                                    helpfulCount={review.helpful_count}
                                    onUserClick={(id, nickname) => setSelectedReviewer({ id, nickname })}
                                />
                            ))
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

function ReviewCard({ review, onUpvote, onReport, isHelpful, helpfulCount, onUserClick }: { review: any, onUpvote: any, onReport: any, isHelpful: boolean, helpfulCount: number, onUserClick?: (id: string, nickname: string) => void }) {
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
                ${review.rating >= 4 ? 'bg-green-500' : review.rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}
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
