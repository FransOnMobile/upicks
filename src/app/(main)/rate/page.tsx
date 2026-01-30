'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { SearchHero } from '@/components/professor-search/search-hero';
import { Search } from 'lucide-react';
import { ProfessorListItem } from '@/components/professor-search/professor-list-item';
import { Professor } from '@/components/professor-search/professor-card';
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
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const campus = searchParams.get('campus');
    const [searchValue, setSearchValue] = useState("");
    const [sortBy, setSortBy] = useState('rating_desc');
    const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false); // Skeleton state

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Check Authentication
                const { data: { session } } = await supabase.auth.getSession();
                setIsAuthenticated(!!session);

                // Fetch Departments
                const { data: deps } = await supabase.from('departments').select('*').order('name');
                if (deps) setDepartments(deps);

                // Fetch Professors with Departments
                const { data: profs, error: profsError } = await supabase
                    .from('professors')
                    .select('*, departments(id, name, code)');

                if (profsError) throw profsError;

                // Fetch All Ratings (for client-side aggregation)
                // Note: For larger datasets, this should be done via a view or RPC
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
                        department: p.departments?.name || 'Unknown Department',
                        departmentId: p.department_id,
                        overallRating: avgRating,
                        reviewCount: totalRatings,
                        topTags: topTags,
                        recentReview: recentReview,
                        campus: p.campus
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
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                p.department.toLowerCase().includes(searchValue.toLowerCase())
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
                verification_notes: courseCode
            });

        if (error) {
            console.error(error);
            alert("Failed to add professor. " + error.message);
        } else {
            alert("Professor submitted for review! They will appear once verified.");
        }
    };

    // Dynamic Header Title
    const getHeaderTitle = () => {
        if (searchValue) return "Search Results";
        if (campus) return `${campus.charAt(0).toUpperCase() + campus.slice(1).replace('-', ' ')} Professors`;

        switch (sortBy) {
            case 'rating_desc': return "Highest Rated Professors";
            case 'reviews_desc': return "Most Reviewed Professors";
            case 'name_asc': return "All Professors";
            default: return "Our Professors";
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
                            {departments.map(d => (
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
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold font-playfair text-[#7b1113] relative inline-block">
                                    {getHeaderTitle()}
                                    <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-[#fbbf24] rounded-full"></span>
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
                                <div className="text-center py-24 opacity-60">
                                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-playfair text-foreground mb-2">
                                        {searchValue ? "No match found" : "Ready to search"}
                                    </h3>
                                    <p className="max-w-md mx-auto text-muted-foreground">
                                        {searchValue
                                            ? "We couldn't find any professor matching your search. Try different keywords or check the spelling."
                                            : "Enter a professor's name, department, or campus to get started."}
                                    </p>

                                    {searchValue && (
                                        <div className="mt-8">
                                            <AddProfessorDialog
                                                onAdd={handleAddProfessor}
                                                departments={departments}
                                                trigger={
                                                    <Button variant="outline" className="mt-4">
                                                        Add Missing Professor
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
