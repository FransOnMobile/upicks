'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, UserCircle } from 'lucide-react';

export function CommunityFeed() {
    const [ratings, setRatings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRatings = async () => {
            const { data } = await supabase
                .from("ratings")
                .select(`
                    id,
                    overall_rating,
                    review_text,
                    created_at,
                    helpful_count,
                    professors (name, department_id, campus),
                    courses (code, name),
                    users (year_level, degree_program)
                `)
                .order("created_at", { ascending: false })
                .limit(20);

            if (data) setRatings(data);
            setLoading(false);
        };

        fetchRatings();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading feed...</div>;
    }

    if (ratings.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No ratings found.</div>;
    }

    return (
        <div className="grid gap-4">
            {ratings.map((rating) => (
                <Card key={rating.id} className="hover:shadow-custom-hover transition-all duration-300 rounded-xl border-border/50 bg-card/80 backdrop-blur-sm group hover:-translate-y-0.5">
                    <CardHeader className="pb-3 flex flex-row justify-between items-start">
                        <div>
                            <h3 className="font-bold text-xl font-playfair tracking-tight group-hover:text-primary transition-colors">{rating.professors?.name}</h3>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <span className="bg-secondary/50 border border-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                                    {rating.courses?.code}
                                </span>
                                <span>•</span>
                                <span className="text-xs uppercase tracking-wider font-medium">{rating.professors?.campus === 'diliman' ? 'UP Diliman' : 'UP Mindanao'}</span>
                            </div>
                        </div>
                        <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold font-playfair border border-primary/10">
                            <Star className="w-4 h-4 mr-1.5 fill-current" />
                            {rating.overall_rating}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-4 border-l-2 border-primary/20">
                            <p className="text-foreground/90 italic mb-4 font-serif leading-relaxed text-lg">"{rating.review_text || 'No review text provided.'}"</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-muted p-1 rounded-full">
                                    <UserCircle className="w-3 h-3" />
                                </div>
                                <span className="font-medium uppercase tracking-wide">{rating.users?.degree_program || 'Student'} • {rating.users?.year_level || 'Unknown Year'}</span>
                            </div>
                            <span className="font-mono opacity-70">{new Date(rating.created_at).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
