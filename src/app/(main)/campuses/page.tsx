'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, School, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SearchHero } from '@/components/professor-search/search-hero';

export default function CampusDirectoryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen bg-background">
            {/* Hero / Search Section - Matching Professor Page Style */}
            <SearchHero
                onSearchChange={setSearchTerm}
                searchValue={searchTerm}
                totalProfessors={campuses.length}
                totalReviews={2450}
                title="Find Your Campus"
                subtitle="Explore all UP campuses across the Philippines"
                statLabel1="Campuses"
                statLabel2="Total Ratings"
            />

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {isSearching && loading ? ( // Simulate skeleton when "loading"
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-card rounded-xl border border-border/50 animate-pulse relative overflow-hidden">
                                <div className="h-full w-full bg-muted/30" />
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
                                        <div className="group h-full bg-card border border-border rounded-xl p-6 shadow-custom hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7b1113]/5 to-transparent rounded-bl-full -mr-4 -mt-4" />

                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 bg-[#7b1113]/10 rounded-lg flex items-center justify-center text-[#7b1113]">
                                                    <School className="w-6 h-6" />
                                                </div>
                                                <Badge variant="outline" className="bg-[#7b1113]/5 border-[#7b1113]/20 text-[#7b1113]">
                                                    {campus.location}
                                                </Badge>
                                            </div>

                                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[#7b1113] transition-colors font-playfair">
                                                {campus.name}
                                            </h3>

                                            <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">
                                                {campus.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center text-amber-500 text-sm font-bold">
                                                    <Star className="w-4 h-4 fill-current mr-1" />
                                                    <span>N/A</span>
                                                </div>
                                                <div className="flex items-center text-sm font-semibold text-[#7b1113] group-hover:underline">
                                                    Rate Campus
                                                    <ArrowRight className="w-4 h-4 ml-1" />
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

// Helper badge component if needed, or import from ui
function Badge({ children, className, variant }: any) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {children}
        </span>
    )
}
