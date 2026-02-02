'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { SearchHero } from '@/components/professor-search/search-hero';
import { Search, UserPlus } from 'lucide-react';
import { ProfessorListItem } from '@/components/professor-search/professor-list-item';
import { Professor } from '@/components/professor-search/professor-card';
import { AddProfessorDialog } from '@/components/professor-search/add-professor-dialog';
import { Skeleton } from "@/components/ui/skeleton";
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
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const campus = searchParams.get('campus');
    const [searchValue, setSearchValue] = useState("");
    const [sortBy, setSortBy] = useState('rating_desc');
    const [userCampus, setUserCampus] = useState<string | null>(null);
    const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string; campus: string }>>([]);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false); // Skeleton state

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Check Authentication & Campus
                const { data: { session } } = await supabase.auth.getSession();
                setIsAuthenticated(!!session);

                if (session?.user) {
                    const { data: profile } = await supabase.from('users').select('campus').eq('id', session.user.id).single();
                    if (profile) setUserCampus(profile.campus);
                }

                // Fetch Departments
                const { data: deps } = await supabase.from('departments').select('*').order('name');
                if (deps) setDepartments(deps);

                // Fetch Professors from View (includes nicknames and departments)
                const { data: profs, error: profsError } = await supabase
                    .from('professor_search_view')
                    .select('*')
                    .order('name');

                if (profsError) throw profsError;

                // Fetch All Ratings (for client-side aggregation)
                const { data: ratings, error: ratingsError } = await supabase
                    .from('ratings')
                    .select('*, rating_tag_associations(rating_tags(name))');

                if (ratingsError) throw ratingsError;

                // Process Data
                const processedProfessors = profs?.map(p => {
                    const profRatings = ratings?.filter(r => r.professor_id === p.id) || [];
                    const totalRatings = profRatings.length;

                    const avgRating = totalRatings > 0
                        ? profRatings.reduce((sum, r) => sum + r.overall_rating, 0) / totalRatings
                        : 0;

                    // Extract top tags
                    const tagCounts: Record<string, number> = {};
                    profRatings.forEach(r => {
                        r.rating_tag_associations?.forEach((t: any) => {
                            if (t.rating_tags?.name) {
                                tagCounts[t.rating_tags.name] = (tagCounts[t.rating_tags.name] || 0) + 1;
                            }
                        });
                    });

                    const topTags = Object.entries(tagCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([name]) => name);

                    // Find most recent review comment
                    const recentReview = profRatings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.review_text;

                    return {
                        id: p.id,
                        name: p.name,
                        department: p.department_name || 'Unknown Department',
                        departmentId: p.department_id,
                        overallRating: avgRating,
                        reviewCount: totalRatings,
                        topTags: topTags,
                        recentReview: recentReview,
                        campus: p.campus || undefined,
                        nicknames: p.nicknames || []
                    };
                }) || [];

                setProfessors(processedProfessors);

            } catch (error) {
                console.error("Error loading rate page data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [supabase]);

    const filteredProfessors = useMemo(() => {
        let filtered = professors;

        if (searchValue) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.department.toLowerCase().includes(searchLower) ||
                (p.nicknames && p.nicknames.some((nick: string) => nick.toLowerCase().includes(searchLower)))
            );
        }

        if (campus) {
            filtered = filtered.filter(p => !p.campus || p.campus === campus);
        }

        // Apply sorting based on user selection or default to rating desc
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'rating_desc':
                    return b.overallRating - a.overallRating;
                case 'rating_asc':
                    return a.overallRating - b.overallRating;
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'reviews_desc':
                    return b.reviewCount - a.reviewCount;
                default:
                    return b.overallRating - a.overallRating;
            }
        });

        return filtered;
    }, [professors, searchValue, campus, sortBy]);


    const handleAddProfessor = async (name: string, deptCode: string, courseCode: string, campus: string) => {
        if (!isAuthenticated) {
            router.push('/sign-in');
            return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Find department by code AND campus
        const dept = departments.find(d =>
            (d.code.toLowerCase() === deptCode.toLowerCase() || d.name.toLowerCase().includes(deptCode.toLowerCase())) &&
            d.campus === campus
        );

        if (!dept) {
            alert(`College/Department not found for campus (${campus}).`);
            return;
        }

        // 1. Insert Professor
        const { data: profData, error: profError } = await supabase
            .from('professors')
            .insert({
                name,
                department_id: dept.id,
                campus: campus,
                is_verified: false,
                submitted_by: user.id,
                verification_notes: courseCode
            })
            .select()
            .single();

        if (profError) {
            console.error(profError);
            alert("Failed to add professor. " + profError.message);
            return;
        }

        // 2. Check/Insert Course
        if (courseCode) {
            // Check if course exists for this campus (or is global/null, but we prefer specific)
            const { data: existingCourses } = await supabase
                .from('courses')
                .select('id')
                .eq('code', courseCode)
                .or(`campus.eq.${campus},campus.is.null`);

            if (!existingCourses || existingCourses.length === 0) {
                // Insert new course
                const { error: courseError } = await supabase
                    .from('courses')
                    .insert({
                        code: courseCode,
                        name: courseCode, // Use code as name for now since we only have one input
                        campus: campus,
                        is_verified: false,
                        submitted_by: user.id
                    });

                if (courseError) console.error("Error auto-creating course:", courseError);
            }
        }

        alert("Professor submitted for review! They will appear once verified.");
    };

    // Dynamic Header Title
    const getHeaderTitle = () => {
        if (searchValue) return "Search Results";

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

        if (campus) return `${CAMPUS_NAMES[campus] || campus} Professors`;

        switch (sortBy) {
            case 'rating_desc': return "Highest Rated Professors";
            case 'reviews_desc': return "Most Reviewed Professors";
            case 'name_asc': return "All Professors";
            default: return "Our Professors";
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-background noise-texture">
                {/* Skeleton Hero */}
                <div className="w-full bg-muted/20 h-64 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto pt-24 px-4 text-center space-y-4">
                        <Skeleton className="h-16 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mx-auto" />
                        <div className="relative max-w-2xl mx-auto w-full pt-8">
                            <Skeleton className="h-16 w-full rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-8 -mt-8 relative z-20">
                    {/* Skeleton Filter Bar */}
                    <Skeleton className="h-20 w-full rounded-xl mb-8 opacity-80" />

                    {/* Skeleton Results */}
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-32 bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                                <div className="flex gap-4 w-full">
                                    <Skeleton className="w-16 h-16 rounded-xl" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                        <div className="flex gap-2 mt-2">
                                            <Skeleton className="h-5 w-16" />
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                    </div>
                                    <div className="w-24 space-y-2">
                                        <Skeleton className="h-8 w-16 ml-auto" />
                                        <Skeleton className="h-4 w-20 ml-auto" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-background noise-texture">
            <SearchHero
                onSearchChange={setSearchValue}
                searchValue={searchValue}
                totalProfessors={professors.length}
                totalReviews={professors.reduce((sum, p) => sum + p.reviewCount, 0)}
            />

            <div className="max-w-5xl mx-auto px-4 py-8 -mt-8 relative z-20">
                {/* Filter Bar */}
                <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                    <div className="flex flex-1 gap-4 w-full overflow-x-auto pb-2 md:pb-0">
                        {/* Campus Filter */}
                        <select
                            className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#7b1113]/20"
                            value={campus || ''}
                            onChange={(e) => {
                                const newCampus = e.target.value;
                                // Use router to push new param or remove it
                                const params = new URLSearchParams(searchParams.toString());
                                if (newCampus) params.set('campus', newCampus);
                                else params.delete('campus');
                                router.push(`/rate?${params.toString()}`);
                            }}
                        >
                            <option value="">All Campuses</option>
                            <option value="diliman">UP Diliman</option>
                            <option value="los-banos">UP Los Baños</option>
                            <option value="manila">UP Manila</option>
                            <option value="visayas">UP Visayas</option>
                            <option value="baguio">UP Baguio</option>
                            <option value="cebu">UP Cebu</option>
                            <option value="mindanao">UP Mindanao</option>
                            <option value="ou">UP Open University</option>
                        </select>

                        {/* Department Filter (Local state filtering for now) */}
                        <select
                            className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#7b1113]/20 max-w-[200px]"
                            onChange={(e) => {
                                // Simple local filter logic could go here, or just keep it simple for now
                                // Ideally this should also be a URL param for shareability
                                const deptId = e.target.value;
                                if (deptId) {
                                    // For now let's just use the search bar for departments as historically implemented?
                                    // Or strictly filter. Let's keep it simple: if selected, filter filteredProfessors further.
                                    // But filteredProfessors is memoized. We need a state for selectedDept.
                                }
                            }}
                        >
                            <option value="">All Departments</option>
                            {departments
                                .filter(d => !campus || d.campus === campus)
                                .map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                        <select
                            className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#7b1113]/20 w-full md:w-auto"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            disabled={!searchValue && !campus}
                        >
                            <option value="rating_desc">Highest Rated</option>
                            <option value="rating_asc">Lowest Rated</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="reviews_desc">Most Reviewed</option>
                        </select>
                    </div>
                </div>

                {/* Search Results Area */}
                <div className="min-h-[400px]">
                    {isSearching ? (
                        // Skeleton Loading
                        <div className="grid gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-card rounded-xl border border-border/50 animate-pulse flex items-center px-6 relative overflow-hidden">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 mr-6" />
                                    <div className="space-y-3 flex-1">
                                        <div className="h-6 w-1/3 bg-muted/50 rounded" />
                                        <div className="h-4 w-1/4 bg-muted/30 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 relative z-30">
                                <h2 className="text-3xl font-bold font-playfair text-[#7b1113] relative inline-block">
                                    {getHeaderTitle()}
                                    <div className="h-1 w-1/3 bg-[#fbbf24] rounded-full mt-2"></div>
                                </h2>
                            </div>

                            {filteredProfessors.length > 0 ? (
                                <div className="grid gap-4">
                                    {filteredProfessors.map((professor) => (
                                        <ProfessorListItem
                                            key={professor.id}
                                            professor={professor}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12">
                                    <div className="bg-gradient-to-br from-card to-muted/20 border border-border/60 rounded-2xl p-8 max-w-md mx-auto shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group text-center">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#7b1113]/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />

                                        <div className="relative z-10 flex flex-col items-center gap-4">
                                            <div className="p-4 bg-background rounded-2xl shadow-sm border border-border/50 group-hover:scale-110 transition-transform duration-300">
                                                {searchValue ? <Search className="w-8 h-8 text-[#7b1113]" /> : <Search className="w-8 h-8 text-muted-foreground" />}
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-bold text-xl font-playfair">
                                                    {searchValue ? "No match found" : "Ready to search"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                    {searchValue
                                                        ? `We couldn't find "${searchValue}". If they're missing, you can add them.`
                                                        : "Enter a professor's name, department, or campus to get started."}
                                                </p>
                                            </div>

                                            {searchValue && (
                                                <div className="pt-2 w-full">
                                                    <AddProfessorDialog
                                                        onAdd={handleAddProfessor}
                                                        departments={departments}
                                                        userCampus={userCampus}
                                                        trigger={
                                                            <Button className="w-full bg-[#7b1113] hover:bg-[#901c1e] text-white shadow-lg shadow-[#7b1113]/20 hover:shadow-[#7b1113]/40 transition-all">
                                                                Add Missing Professor
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}
