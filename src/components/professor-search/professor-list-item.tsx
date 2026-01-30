'use client';

import { Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Professor {
    id: string;
    name: string;
    department: string;
    departmentId: string;
    overallRating: number;
    reviewCount: number;
    topTags: string[];
    recentReview?: string;
    campus?: string;
}

interface ProfessorListItemProps {
    professor: Professor;
    onClick: () => void;
}

export function ProfessorListItem({ professor, onClick }: ProfessorListItemProps) {
    return (
        <div
            className="bg-card hover:bg-muted/30 border-b border-border p-4 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            onClick={onClick}
        >
            <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1 font-playfair tracking-tight group-hover:text-primary">
                    {professor.name}
                </h3>
                <p className="text-sm text-foreground/60 font-medium uppercase tracking-wider text-xs mb-2">
                    {professor.department}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {professor.topTags.slice(0, 3).map((tag, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-secondary/50 text-foreground border border-border/50 text-xs px-2 py-0.5 rounded-md font-medium"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-6 sm:text-right">
                <div className="flex flex-col items-start sm:items-end">
                    <div className="flex items-center gap-1.5 text-foreground/80 mb-0.5">
                        <span className="text-sm font-semibold">Quality</span>
                    </div>
                    <div className={`text-3xl font-black font-playfair ${professor.overallRating >= 4 ? 'text-green-600' : professor.overallRating >= 2.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {professor.overallRating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {professor.reviewCount} {professor.reviewCount === 1 ? 'rating' : 'ratings'}
                    </div>
                </div>
            </div>
        </div>
    );
}
