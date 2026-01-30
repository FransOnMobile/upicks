'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, School, ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SearchHero } from '@/components/professor-search/search-hero';

import { createClient } from "@/utils/supabase/client";

export default function CampusDirectoryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [totalRatings, setTotalRatings] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            const { count } = await supabase
                .from('campus_ratings')
                .select('*', { count: 'exact', head: true });

            if (count !== null) setTotalRatings(count);
        };
        fetchStats();
    }, []);

    // Simulate search loading effect
    useEffect(() => {
        if (searchTerm) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    // Mock Data (matches landing page data for consistency)
    const campuses = [
        {
            id: "diliman",
            name: "UP Diliman",
            location: "Quezon City",
            description: "The flagship campus known for its expansive grounds and diverse academic programs.",
        },
        {
            id: "los-banos",
            name: "UP Los Baños",
            location: "Laguna",
            description: "A pioneer in agriculture, forestry, and environmental sciences.",
        },
        {
            id: "manila",
            name: "UP Manila",
            location: "Manila",
            description: "The Health Sciences Center of the Philippines.",
        },
        {
            id: "visayas",
            name: "UP Visayas",
            location: "Iloilo / Miagao",
            description: "Leading in fisheries and marine sciences education and research.",
        },
        {
            id: "baguio",
            name: "UP Baguio",
            location: "Baguio City",
            description: "Known for its strong programs in unparalleled cordillera studies and the arts.",
        },
        {
            id: "cebu",
            name: "UP Cebu",
            location: "Cebu City",
            description: "A center of excellence in design, IT, and business management in the region.",
        },
        {
            id: "mindanao",
            name: "UP Mindanao",
            location: "Davao City",
            description: "Providing quality education and fostering development in the Mindanao region.",
        },
        {
            id: "ou",
            name: "UP Open University",
            location: "Online / Los Baños",
            description: "Pioneering open and distance eLearning for lifelong education.",
        },
    ];

    const filteredCampuses = campuses.filter(campus =>
        campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campus.location.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // Skeleton Loading Effect
    const isSearching = loading || !!searchTerm;

    return (
        <div className="min-h-screen bg-background noise-texture">
            {/* Hero / Search Section - Matching Professor Page Style */}
            <SearchHero
                onSearchChange={setSearchTerm}
                searchValue={searchTerm}
                totalProfessors={campuses.length}
                totalReviews={totalRatings}
                title="Find Your Campus"
                subtitle="Explore all UP campuses across the Philippines"
                statLabel1="Campuses"
                statLabel2="Campus Ratings"
            />

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {isSearching && loading ? ( // Simulate skeleton when "loading"
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-full bg-card border border-border/60 rounded-2xl p-6 flex flex-col space-y-4">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                    <Skeleton className="w-20 h-6" />
                                </div>
                                <Skeleton className="h-8 w-3/4" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                                <div className="pt-4 flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-6 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                            {filteredCampuses.length} Campuses Found
                        </div>

                        {filteredCampuses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredCampuses.map((campus) => (
                                    <Link key={campus.id} href={`/rate/campus/${campus.id}`}>
                                        <div className="group h-full bg-background border border-border/60 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden hover:border-[#7b1113]/30">
                                            {/* Decorative Corner gradient */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7b1113]/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

                                            <div className="flex items-start justify-between mb-6 relative z-10">
                                                <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-[#7b1113] group-hover:bg-[#7b1113]/5 transition-colors duration-300">
                                                    <School className="w-6 h-6" />
                                                </div>
                                                <Badge variant="outline" className="bg-muted/30 border-border font-normal text-muted-foreground">
                                                    {campus.location}
                                                </Badge>
                                            </div>

                                            <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-[#7b1113] transition-colors font-playfair tracking-tight">
                                                {campus.name}
                                            </h3>

                                            <p className="text-sm text-muted-foreground mb-8 flex-1 leading-relaxed">
                                                {campus.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                                                <div className="flex items-center text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                                    View Details
                                                </div>
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 group-hover:bg-[#7b1113] group-hover:text-white transition-all duration-300">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 opacity-50">
                                <School className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                <h3 className="text-xl font-bold">No campuses found</h3>
                                <p>Try adjusting your search terms.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


