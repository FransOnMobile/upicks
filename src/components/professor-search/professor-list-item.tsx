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

import Link from 'next/link';
// ... imports

export interface ProfessorListItemProps {
    professor: Professor;
}

export function ProfessorListItem({ professor }: ProfessorListItemProps) {
    return (
        <Link href={`/rate/professor/${professor.id}`}>
            <div
                className="group bg-card hover:bg-muted/50 border border-border/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7b1113]/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    {/* Avatar / Placeholder */}
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-[#7b1113]/10 flex items-center justify-center text-[#7b1113] text-xl font-bold font-playfair border-2 border-[#7b1113]/20">
                            {professor.name.charAt(0)}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-foreground font-playfair tracking-tight group-hover:text-[#7b1113] transition-colors">
                                    {professor.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span className="font-medium text-foreground/80">{professor.department}</span>
                                    {professor.campus && (
                                        <>
                                            <span>•</span>
                                            <Badge variant="outline" className="text-xs bg-muted/50 font-normal">
                                                {professor.campus}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-lg self-start">
                                <div className="text-right">
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Rating</div>
                                    <div className="text-xs text-muted-foreground text-right">{professor.reviewCount} reviews</div>
                                </div>
                                <div className={`text-2xl font-black font-playfair ${professor.overallRating >= 4 ? 'text-green-600' :
                                    professor.overallRating >= 2.5 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {professor.overallRating.toFixed(1)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {professor.topTags.length > 0 ? (
                                professor.topTags.slice(0, 3).map((tag, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-secondary text-secondary-foreground border-transparent text-xs px-2.5 py-0.5"
                                    >
                                        {tag}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-muted-foreground italic">No tags yet</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
