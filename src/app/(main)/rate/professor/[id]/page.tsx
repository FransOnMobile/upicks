'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, School, BookOpen, ThumbsUp, MessageSquare, ArrowLeft } from 'lucide-react';
import { RatingForm } from '@/components/professor-search/rating-form';
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfessorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const professorId = params.id as string;
    const supabase = createClient();

    const [professor, setProfessor] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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

            // Fetch Reviews
            const { data: ratingsData } = await supabase
                .from('ratings')
                .select(`
                    *,
                    courses (code, name),
                    rating_tag_associations (
                        rating_tags (name)
                    )
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
                difficulty: r.difficulty,
                would_take_again: r.would_take_again,
                grade: r.grade_received,
                attendance: r.mandatory_attendance ? 'Mandatory' : 'Optional'
            })) || [];

            // Calculate Aggregates
            const totalReviews = formattedReviews.length;
            const avgRating = totalReviews > 0
                ? formattedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;

            // Calculate Difficulty (average of non-null values)
            const difficultyRatings = formattedReviews.filter(r => r.difficulty != null);
            const avgDifficulty = difficultyRatings.length > 0
                ? difficultyRatings.reduce((sum, r) => sum + r.difficulty, 0) / difficultyRatings.length
                : 0;

            // Calculate Would Take Again (percentage of true values)
            const wouldTakeAgainRatings = formattedReviews.filter(r => r.would_take_again != null);
            const wouldTakeAgainPercent = wouldTakeAgainRatings.length > 0
                ? Math.round((wouldTakeAgainRatings.filter(r => r.would_take_again).length / wouldTakeAgainRatings.length) * 100)
                : null;

            // Extract top tags
            const tagCounts: Record<string, number> = {};
            formattedReviews.forEach(r => {
                r.tags.forEach((t: string) => tagCounts[t] = (tagCounts[t] || 0) + 1);
            });
            const topTags = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name]) => name);

            setProfessor({
                ...profData,
                department: profData.departments?.name,
                overallRating: avgRating,
                reviewCount: totalReviews,
                topTags: topTags,
                difficulty: avgDifficulty,
                wouldTakeAgain: wouldTakeAgainPercent
            });

            setReviews(formattedReviews);

            // Load Metadata for Form
            const { data: coursesData } = await supabase.from('courses').select('*').order('code');
            const { data: tagsData } = await supabase.from('rating_tags').select('*');
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

    const handleUpvote = async (reviewId: string) => {
        if (!isAuthenticated) {
            router.push(`/sign-in?next=/rate/professor/${professorId}`);
            return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Should be covered by auth check but safe guard

        // Optimistic update
        setReviews(prev => prev.map(r => {
            if (r.id === reviewId) {
                return { ...r, helpful_count: r.helpful_count + 1 };
            }
            return r;
        }));

        // DB Call
        const currentReview = reviews.find(r => r.id === reviewId);
        if (!currentReview) return;

        const { error } = await supabase
            .from('ratings')
            .update({ helpful_count: currentReview.helpful_count + 1 })
            .eq('id', reviewId);

        if (error) {
            console.error("Error upvoting:", error);
            alert("Failed to upvote. Please try again.");
            // Revert optimistic update
            setReviews(prev => prev.map(r => {
                if (r.id === reviewId) {
                    return { ...r, helpful_count: r.helpful_count }; // Revert
                }
                return r;
            }));
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
                            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-2 tracking-tight">
                                {professor.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/80 text-lg mb-6">
                                <span className="flex items-center gap-2">
                                    <School className="w-5 h-5" />
                                    {professor.department}
                                </span>
                                {professor.campus && (
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm border border-white/20">
                                        {professor.campus}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {professor.topTags.map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-[#fbbf24] text-[#7b1113] text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-end justify-end gap-2 mb-1">
                                <span className="text-6xl font-black font-playfair">{professor.overallRating.toFixed(1)}</span>
                                <span className="text-white/60 text-xl font-medium mb-2">/ 5.0</span>
                            </div>
                            <div className="text-white/80 font-medium">
                                Based on {professor.reviewCount} reviews
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Actions */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold font-playfair mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Quick Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Reviews</span>
                                <span className="font-semibold">{professor.reviewCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Difficulty</span>
                                <span className="font-semibold">{professor.difficulty > 0 ? professor.difficulty.toFixed(1) + ' / 5' : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Would Take Again</span>
                                <span className="font-semibold">{professor.wouldTakeAgain !== null ? professor.wouldTakeAgain + '%' : 'N/A'}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6 text-lg py-6 font-semibold shadow-lg"
                            onClick={() => {
                                if (!isAuthenticated) router.push(`/sign-in?next=/rate/professor/${professorId}`);
                                else setShowRatingForm(true);
                            }}
                        >
                            Rate this Professor
                        </Button>
                    </div>
                </div>

                {/* Right Column: Reviews */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold font-playfair">Student Reviews</h2>
                        {/* Sort Dropdown could go here */}
                    </div>

                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl font-playfair
                                            ${review.rating >= 4 ? 'bg-green-600' : review.rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                            {review.rating.toFixed(1)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">
                                                {review.course}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex gap-2">
                                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={review.grade?.startsWith('1') ? 'text-green-600 font-medium' : ''}>
                                                    Grade: {review.grade || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {!review.is_anonymous && (
                                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            Verified Student
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {review.tags.map((tag: string, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs font-normal">
                                            {tag}
                                        </Badge>
                                    ))}
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                        Attendance: {review.attendance}
                                    </Badge>
                                </div>

                                <p className="text-foreground/90 leading-relaxed text-sm md:text-base mb-6">
                                    {review.reviewText}
                                </p>

                                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                    <button
                                        onClick={() => handleUpvote(review.id)}
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>Helpful ({review.helpful_count})</span>
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
                            <h3 className="text-lg font-bold">No reviews yet</h3>
                            <p className="text-muted-foreground">Be the first to rate this professor!</p>
                            <Button variant="link" onClick={() => setShowRatingForm(true)}>Write a review</Button>
                        </div>
                    )}
                </div>
            </div>

            <RatingForm
                isOpen={showRatingForm}
                onClose={() => setShowRatingForm(false)}
                professorId={professorId}
                professorName={professor?.name || ''}
                courses={courses}
                availableTags={tags}
                onSubmit={handleRatingSubmit}
            />
        </div>
    );
}
