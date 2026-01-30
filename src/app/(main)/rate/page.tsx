'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "../../../../supabase/client";
import { SearchHero } from '@/components/professor-search/search-hero';
import { ProfessorListItem } from '@/components/professor-search/professor-list-item';
import { ProfessorCard, Professor } from '@/components/professor-search/professor-card';
import { ProfessorDetail } from '@/components/professor-search/professor-detail';
import { RatingForm } from '@/components/professor-search/rating-form';
import { AddProfessorDialog } from '@/components/professor-search/add-professor-dialog';
import { Button } from '@/components/ui/button';

export default function RatePage() {
    // ... content moved to RatePageContent
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background noise-texture text-muted-foreground">Loading...</div>}>
            <RatePageContent />
        </Suspense>
    );
}

function RatePageContent() {
    const searchParams = useSearchParams();
    const campus = searchParams.get('campus');
    const [searchValue, setSearchValue] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [hoverCardId, setHoverCardId] = useState<string | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndLoad = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/sign-in?next=/rate');
                return;
            }
            setIsAuthenticated(true);

            await Promise.all([
                loadDepartments(),
                loadProfessors(),
                loadTags()
            ]);
            setIsLoading(false);
        };

        checkAuthAndLoad();
    }, [supabase.auth, router]);


    const loadDepartments = async () => {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .order('name');

        if (data && !error) {
            setDepartments(data);
        }
    };

    const loadProfessors = async () => {
        // Attempt to fetch with campus column, fallback if it fails (migration not run)
        // Note: JS client won't throw on extra columns usually, but good to be careful.
        // However, if the column doesn't exist, Supabase API might error.

        // We will try standard fetch.
        const { data: professorsData, error: profError } = await supabase
            .from('professors')
            .select(`
        *,
        departments:department_id (name),
        ratings (
          id,
          overall_rating,
          created_at
        )
      `)
            .order('name'); // Added basic ordering

        if (profError) {
            console.error("Error loading professors:", profError);
            // If error is about 'campus' column missing, it usually comes as an error.
            // But here we are selecting *, so if the column is missing in DB, it just won't be returned unless we explicitly asked for it?
            // Wait, select('*') returns all existing columns. 
            // If the '0 professors' issue persists, it might because the tables are indeed empty despite the user running migrations?
            return;
        }

        if (professorsData) {
            const { data: tagsData } = await supabase
                .from('rating_tag_associations')
                .select(`
          rating_id,
          rating_tags (name)
        `);

            const formattedProfessors = professorsData.map((prof: any) => {
                const profRatings = prof.ratings || [];
                const avgRating = profRatings.length > 0
                    ? profRatings.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / profRatings.length
                    : 0;

                const ratingIds = profRatings.map((r: any) => r.id);
                const profTags = tagsData?.filter((t: any) => ratingIds.includes(t.rating_id)) || [];
                const tagCounts: Record<string, number> = {};
                profTags.forEach((t: any) => {
                    const tagName = t.rating_tags?.name;
                    if (tagName) {
                        tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
                    }
                });
                const topTags = Object.entries(tagCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([name]) => name);

                const recentRating = profRatings
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                return {
                    id: prof.id,
                    name: prof.name,
                    department: prof.departments?.name || 'Unknown',
                    departmentId: prof.department_id,
                    overallRating: avgRating,
                    reviewCount: profRatings.length,
                    topTags: topTags,
                    recentReview: recentRating?.review_text || '',
                    campus: prof.campus // This will be undefined if column doesn't exist, handled gracefully
                };
            });

            setProfessors(formattedProfessors);
        }
    };

    const loadTags = async () => {
        const { data } = await supabase.from('rating_tags').select('*');
        if (data) setTags(data);
    };



    // Relaxed filtering
    const filteredProfessors = useMemo(() => {
        let filtered = professors;

        if (searchValue) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                p.department.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        // Removed detailed filters as requested

        // Campus filter: Show if match OR if professor has no campus (legacy/global)
        if (campus) {
            filtered = filtered.filter(p => !p.campus || p.campus === campus);
        }

        return filtered;
    }, [professors, searchValue, campus]);

    const handleProfessorClick = async (professor: Professor) => {
        setSelectedProfessor(professor);
        // ... (rest of logic same) ...
        const { data: ratingsData } = await supabase
            .from('ratings')
            .select(`
        *,
        courses (code, name),
        rating_tag_associations (
          rating_tags (name)
        )
      `)
            .eq('professor_id', professor.id);

        if (ratingsData) {
            const formattedReviews = ratingsData.map((r: any) => ({
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
                clarity: r.clarity
            }));
            setReviews(formattedReviews);
        }

        const { data: coursesData } = await supabase
            .from('courses')
            .select('*')
            .order('code');

        if (coursesData) setCourses(coursesData);

        setShowDetail(true);
    };

    // ... (rest of handlers same) ...
    const handleUpvote = async (reviewId: string) => {
        if (!isAuthenticated) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: existingVote } = await supabase
            .from('rating_helpful_votes')
            .select('*')
            .eq('rating_id', reviewId)
            .eq('user_id', user.id)
            .single();
        if (existingVote) {
            await supabase.from('rating_helpful_votes').delete().eq('id', existingVote.id);
            await supabase.rpc('decrement_helpful_count', { rating_id: reviewId });
        } else {
            await supabase.from('rating_helpful_votes').insert({ rating_id: reviewId, user_id: user.id });
            // increment logic...
            const { data: rating } = await supabase.from('ratings').select('helpful_count').eq('id', reviewId).single();
            await supabase.from('ratings').update({ helpful_count: (rating?.helpful_count || 0) + 1 }).eq('id', reviewId);
        }
        if (selectedProfessor) handleProfessorClick(selectedProfessor);
    };

    const handleAddProfessor = async (name: string, deptCode: string, courseCode: string) => {
        if (!isAuthenticated) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('users').select('campus').eq('id', user.id).single();
        const userCampus = profile?.campus;
        if (!userCampus) {
            alert("Please complete your profile first.");
            return;
        }
        const dept = departments.find(d => d.code === deptCode || d.name.toLowerCase().includes(deptCode.toLowerCase()));
        if (!dept) {
            alert("Department not found. Please use a valid code (e.g. CS, MATH).");
            return;
        }
        const { error } = await supabase
            .from('professors')
            .insert({
                name,
                department_id: dept.id,
                campus: userCampus,
                is_verified: false,
                submitted_by: user.id,
                verification_notes: courseCode // Saving course info here
            });

        if (error) {
            console.error(error);
            alert("Failed to add professor. " + error.message);
        } else {
            alert("Professor submitted for review! They will appear once verified.");
            // We don't reload professors because they are unverified and won't show up anyway.
        }
    };

    const handleRatingSubmit = async (data: any) => {
        // ... existing implementation
        if (!isAuthenticated) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !selectedProfessor) return;
        const { data: insertedRating, error } = await supabase
            .from('ratings')
            .insert({
                professor_id: selectedProfessor.id,
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
            await loadProfessors();
            if (selectedProfessor) handleProfessorClick(selectedProfessor);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background noise-texture text-muted-foreground">Checking access...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background noise-texture">
            <SearchHero
                onSearchChange={setSearchValue}
                searchValue={searchValue}
                totalProfessors={professors.length}
                totalReviews={professors.reduce((sum, p) => sum + p.reviewCount, 0)}
            />

            <div className="max-w-4xl mx-auto px-4 py-12">

                {/* Search Results Area */}
                {searchValue && (
                    <div className="mb-4 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        {filteredProfessors.length} {filteredProfessors.length === 1 ? 'result' : 'results'} found
                    </div>
                )}

                {/* List Logic */}
                {searchValue ? (
                    <div className="space-y-4">
                        {filteredProfessors.map((professor) => (
                            <ProfessorListItem
                                key={professor.id}
                                professor={professor}
                                onClick={() => handleProfessorClick(professor)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-40">
                        <div className="mb-4 text-3xl font-bold font-playfair text-[#2d2540]">Start by searching</div>
                        <p>Enter a professor's name or department code above.</p>
                    </div>
                )}

                {/* Empty State / Add Professor CTA */}
                {searchValue && filteredProfessors.length === 0 && (
                    <div className="mt-12 text-center py-16 px-6 bg-card/60 backdrop-blur-sm rounded-xl border border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3 font-playfair">Professor not found?</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                            Looks like this professor hasn't been added yet. Add them to our directory and help your fellow students by being the first to rate!
                        </p>
                        <AddProfessorDialog
                            onAdd={handleAddProfessor}
                            departments={departments}
                            trigger={
                                <Button size="lg" className="font-semibold px-8 shadow-custom hover:shadow-custom-hover transition-all">
                                    Add a Professor
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>

            {/* Modal Logic */}
            {selectedProfessor && (
                <>
                    <ProfessorDetail
                        isOpen={showDetail}
                        onClose={() => setShowDetail(false)}
                        professor={selectedProfessor}
                        reviews={reviews}
                        onUpvote={handleUpvote}
                        isAuthenticated={isAuthenticated}
                        onRateClick={() => {
                            setShowDetail(false);
                            setShowRatingForm(true);
                        }}
                    />

                    <RatingForm
                        isOpen={showRatingForm}
                        onClose={() => setShowRatingForm(false)}
                        professorId={selectedProfessor.id}
                        professorName={selectedProfessor.name}
                        courses={courses}
                        availableTags={tags}
                        onSubmit={handleRatingSubmit}
                    />
                </>
            )}
        </div>
    );
}
