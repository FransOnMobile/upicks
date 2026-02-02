'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from "@/utils/supabase/client";
import { RatingCard } from './RatingCard';
import { FilterBar, FilterType, SortOption } from './FilterBar';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

import { ReviewDetailsDialog, ReviewDetails } from './ReviewDetailsDialog';
import { ReviewerProfileDialog } from "@/components/reviewer-profile-dialog";

// Use shared type or keep local if simpler, but syncing is key.
// We will alias the one from Dialog for consistency.
type ExtendedRating = ReviewDetails;

const PAGE_SIZE = 12;

export function CommunityFeed() {
    const [ratings, setRatings] = useState<ExtendedRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortOption>('latest');
    const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [selectedRating, setSelectedRating] = useState<ExtendedRating | null>(null);
    const [selectedReviewer, setSelectedReviewer] = useState<{ id: string, nickname: string } | null>(null);
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [localVotes, setLocalVotes] = useState<Set<string>>(new Set());
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const supabase = createClient();

    const [stats, setStats] = useState({ total_ratings: 0, avg_prof_rating: 0, avg_campus_rating: 0 });

    const fetchStats = useCallback(async () => {
        const { data, error } = await supabase.rpc('get_community_stats');
        if (!error && data && data.length > 0) {
            setStats(data[0]);
        }
    }, [supabase]);

    // Check Auth & Fetch User Votes
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const isAuth = !!session;
            setIsAuthenticated(isAuth);

            if (isAuth && session.user) {
                const { data: votes } = await supabase
                    .from('rating_votes')
                    .select('rating_id')
                    .eq('user_id', session.user.id);
                if (votes) {
                    setUserVotes(new Set(votes.map(v => v.rating_id)));
                }
            } else {
                // Initial load of local votes checks happens on render/interaction usually, 
                // or we can scan visible ratings. For performance we just check on demand or use a known prefix scan?
                // We'll scan when ratings update.
            }
        };
        checkAuth();
    }, [supabase]);

    // Scan for local votes when ratings change (for anonymous users)
    useEffect(() => {
        if (!isAuthenticated && ratings.length > 0) {
            const local = new Set<string>();
            ratings.forEach(r => {
                const key = r.rating_type === 'professor'
                    ? `upvoted_review_${r.id}`
                    : `upvoted_campus_${r.id}`;
                if (localStorage.getItem(key)) {
                    local.add(r.id);
                }
            });
            setLocalVotes(local);
        }
    }, [ratings, isAuthenticated]);

    const handleUpvote = async (reviewId: string) => {
        const review = ratings.find(r => r.id === reviewId);
        if (!review) return;

        // Optimistic Update Helper
        const updateState = (delta: number, isVoted: boolean) => {
            setRatings(prev => prev.map(r =>
                r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + delta } : r
            ));

            // Sync selected rating if open
            if (selectedRating?.id === reviewId) {
                setSelectedRating(prev => prev ? { ...prev, helpful_count: (prev.helpful_count || 0) + delta } : null);
            }

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

        if (review.rating_type === 'professor') {
            // Smart Vote Logic (Parity with Professor Page)
            if (isAuthenticated) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return; // Should catch by state but safety check

                const hasVoted = userVotes.has(reviewId);
                if (hasVoted) {
                    updateState(-1, false);
                    await supabase.from('rating_votes').delete().match({ rating_id: reviewId, user_id: user.id });
                    await supabase.from('ratings').update({ helpful_count: (review.helpful_count || 1) - 1 }).eq('id', reviewId);
                } else {
                    updateState(1, true);
                    const { error } = await supabase.from('rating_votes').insert({ rating_id: reviewId, user_id: user.id });
                    if (!error) {
                        await supabase.from('ratings').update({ helpful_count: (review.helpful_count || 0) + 1 }).eq('id', reviewId);
                    } else {
                        updateState(-1, false); // Revert
                    }
                }
            } else {
                // Anon
                const key = `upvoted_review_${reviewId}`;
                const hasLocalVote = localStorage.getItem(key);
                if (hasLocalVote) {
                    localStorage.removeItem(key);
                    updateState(-1, false);
                    await supabase.from('ratings').update({ helpful_count: (review.helpful_count || 1) - 1 }).eq('id', reviewId);
                } else {
                    localStorage.setItem(key, 'true');
                    updateState(1, true);
                    await supabase.from('ratings').update({ helpful_count: (review.helpful_count || 0) + 1 }).eq('id', reviewId);
                }
            }
        } else {
            // Campus Rating (Simple Increment + Local Storage Debounce)
            const key = `upvoted_campus_${reviewId}`;
            if (localStorage.getItem(key)) return; // Prevent double vote locally

            localStorage.setItem(key, 'true');
            updateState(1, true);
            await supabase
                .from('campus_ratings')
                .update({ helpful_count: (review.helpful_count || 0) + 1 })
                .eq('id', reviewId);
        }
    };
    const fetchRatings = useCallback(async (isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
                fetchStats();
            } else {
                setLoadingMore(true);
            }

            const currentPage = isLoadMore ? page + 1 : 0;
            const from = currentPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase
                .from('unified_ratings_feed')
                .select('*');

            // Filters
            if (filter === 'professor') {
                query = query.eq('rating_type', 'professor');
            } else if (filter === 'campus') {
                query = query.eq('rating_type', 'campus');
            }

            if (selectedCampus) {
                query = query.eq('campus_filter', selectedCampus);
            }

            // Sort
            if (sort === 'latest') {
                query = query.order("created_at", { ascending: false });
            } else if (sort === 'highest') {
                query = query.order("overall_rating", { ascending: false });
            } else if (sort === 'lowest') {
                query = query.order("overall_rating", { ascending: true });
            }

            query = query.range(from, to);

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const mappedData: ExtendedRating[] = data.map((r: any) => ({
                    id: r.id,
                    overall_rating: r.overall_rating,
                    review_text: r.review_text,
                    created_at: r.created_at,
                    helpful_count: r.helpful_count,
                    rating_type: r.rating_type as 'professor' | 'campus',
                    campus: r.rating_type === 'campus' ? r.campus_filter : null,
                    professors: r.rating_type === 'professor' ? {
                        name: r.title,
                        department_id: null,
                        campus: r.campus_filter
                    } : null,
                    courses: r.course_code ? {
                        code: r.course_code,
                        name: r.course_name
                    } : null,
                    // Detailed Metrics
                    clarity: r.clarity,
                    fairness: r.fairness,
                    teaching_quality: r.teaching_quality,
                    would_take_again: r.would_take_again,
                    facilities_rating: r.facilities_rating,
                    safety_rating: r.safety_rating,
                    location_rating: r.location_rating,
                    student_life_rating: r.student_life_rating,
                    tags: r.tags || [],
                    textbook_used: r.textbook_used,
                    mandatory_attendance: r.mandatory_attendance,
                    grade: r.grade_received,
                    // User Mapping
                    nickname: r.nickname,
                    user_id: r.user_id,
                    is_anonymous: r.is_anonymous,
                }));

                if (isLoadMore) {
                    setRatings(prev => [...prev, ...mappedData]);
                } else {
                    setRatings(mappedData);
                }

                setHasMore(data.length >= PAGE_SIZE);

                if (isLoadMore) setPage(currentPage);
                else setPage(0);
            }
        } catch (error) {
            console.error("Error fetching ratings:", error);
            toast.error("Failed to load ratings");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter, sort, selectedCampus, page, supabase, fetchStats]);

    useEffect(() => {
        fetchRatings(false);
    }, [filter, sort, selectedCampus]);

    const handleLoadMore = () => {
        fetchRatings(true);
    };

    return (
        <div className="pb-24">
            {/* Stats Header - Responsive Scroller */}
            <div className="flex overflow-x-auto pb-4 md:grid md:grid-cols-3 gap-4 mb-6 snap-x snap-mandatory scrollbar-hide">
                <div className="min-w-[140px] flex-1 bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl text-center snap-center">
                    <div className="text-3xl font-bold font-playfair text-primary mb-1">
                        {stats.total_ratings > 0 ? stats.total_ratings.toLocaleString() : '-'}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Community Reviews</div>
                </div>
                <div className="min-w-[140px] flex-1 bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl text-center snap-center">
                    <div className="text-3xl font-bold font-playfair text-emerald-600 mb-1">
                        {Number(stats.avg_campus_rating).toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Campus</div>
                </div>
                <div className="min-w-[140px] flex-1 bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl text-center snap-center">
                    <div className="text-3xl font-bold font-playfair text-amber-500 mb-1">
                        {Number(stats.avg_prof_rating).toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Professor</div>
                </div>
            </div>

            <FilterBar
                currentFilter={filter}
                onFilterChange={setFilter}
                currentSort={sort}
                onSortChange={setSort}
                selectedCampus={selectedCampus}
                onCampusChange={setSelectedCampus}
            />

            {loading ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-secondary/30 rounded-xl break-inside-avoid" />
                    ))}
                </div>
            ) : ratings.length === 0 ? (
                <div className="text-center py-20 bg-secondary/10 rounded-3xl border-2 border-dashed border-secondary/30">
                    <p className="text-muted-foreground text-lg mb-4">No ratings found for this filter.</p>
                    <Button variant="outline" onClick={() => { setFilter('all'); setSort('latest'); setSelectedCampus(null); }}>
                        Reset Filters
                    </Button>
                </div>
            ) : (
                <>
                    {/* Masonry Layout */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {ratings.map((rating) => (
                            <div key={rating.id} className="break-inside-avoid">
                                <RatingCard
                                    rating={rating}
                                    onClick={() => setSelectedRating(rating)}
                                    onUserClick={(id, nickname) => setSelectedReviewer({ id, nickname })}
                                />
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-12 mb-8">
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Loading more...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Load More Ratings
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {!hasMore && ratings.length > 0 && (
                        <div className="text-center mt-12 mb-8 text-muted-foreground text-sm opacity-60">
                            You've reached the end of the list.
                        </div>
                    )}
                </>
            )}

            <ReviewDetailsDialog
                isOpen={!!selectedRating}
                onClose={() => setSelectedRating(null)}
                review={selectedRating}
                onUpvote={(id) => handleUpvote(id)}
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
