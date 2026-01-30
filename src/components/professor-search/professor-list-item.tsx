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
                className="group bg-background hover:bg-muted/30 border border-border/60 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden hover:border-[#7b1113]/30"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7b1113]/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    {/* Avatar / Placeholder */}
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-[#7b1113] text-2xl font-bold font-playfair border-2 border-[#7b1113]/10 group-hover:border-[#7b1113]/30 transition-colors duration-300 shadow-sm">
                            {professor.name.charAt(0)}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground font-playfair tracking-tight group-hover:text-[#7b1113] transition-colors mb-1">
                                    {professor.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground/80">{professor.department}</span>
                                    {professor.campus && (
                                        <>
                                            <span>•</span>
                                            <Badge variant="outline" className="text-xs bg-muted/30 border-border/50 font-normal">
                                                {professor.campus}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-muted/20 px-4 py-2 rounded-xl self-start border border-border/50">
                                <div className="text-right">
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">Overall</div>
                                    <div className="text-xs text-muted-foreground text-right font-medium">{professor.reviewCount} reviews</div>
                                </div>
                                <div className={`text-3xl font-black font-playfair ${professor.overallRating >= 4 ? 'text-green-600' :
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
                                        className="bg-muted/50 text-muted-foreground border-transparent text-xs px-2.5 py-1 hover:bg-muted font-medium transition-colors"
                                    >
                                        {tag}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-muted-foreground italic opacity-70">No tags yet</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
