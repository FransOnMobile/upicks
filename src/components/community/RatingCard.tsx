'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, School, User, GraduationCap, Building2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ReviewDetails } from './ReviewDetailsDialog';

interface RatingCardProps {
    rating: ReviewDetails; // Use shared type
    onClick?: () => void;
}

export function RatingCard({ rating, onClick }: RatingCardProps) {
    const isCampusRating = rating.rating_type === 'campus' || !rating.professors;

    // Format date
    const dateFormatted = rating.created_at
        ? new Date(rating.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent';

    return (
        <Card
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden transition-all duration-300 border-white/10",
                "bg-white/5 backdrop-blur-md dark:bg-black/20 cursor-pointer active:scale-[0.99] hover:bg-white/10", // Reduced shadow/movement
                isCampusRating
                    ? "hover:border-emerald-500/30"
                    : "hover:border-primary/30"
            )}>
            {/* Decorative gradient blob Removed */}

            <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 pt-1">
                        {/* Header / Title */}
                        <div className="flex items-center gap-2">
                            {isCampusRating ? (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-0.5 h-5 text-[10px]">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    Campus
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 h-5 text-[10px]">
                                    <GraduationCap className="w-3 h-3 mr-1" />
                                    Professor
                                </Badge>
                            )}
                            {rating.campus && (
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    {rating.campus === 'diliman' ? 'UP Diliman' :
                                        rating.campus === 'mindanao' ? 'UP Mindanao' : rating.campus}
                                </span>
                            )}
                            {rating.professors?.campus && !rating.campus && (
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    {rating.professors.campus === 'diliman' ? 'UP Diliman' : 'UP Mindanao'}
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-lg tracking-tight text-foreground leading-tight">
                            {isCampusRating
                                ? (rating.campus === 'diliman' ? 'UP Diliman' : rating.campus === 'mindanao' ? 'UP Mindanao' : 'University Campus')
                                : rating.professors?.name || 'Unknown Professor'}
                        </h3>

                        {/* Sub-info (Course for professors) */}
                        {!isCampusRating && rating.courses && (
                            <div className="flex items-center text-xs text-muted-foreground/80">
                                <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded text-[10px] font-semibold mr-2 text-secondary-foreground">
                                    {rating.courses.code || 'COURSE'}
                                </span>
                                <span className="truncate max-w-[180px]">{rating.courses.name || 'Details'}</span>
                            </div>
                        )}
                    </div>

                    {/* Rating Score & Date */}
                    <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                            "flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-base shadow-sm border",
                            rating.overall_rating && rating.overall_rating >= 4.0
                                ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
                                : rating.overall_rating && rating.overall_rating >= 2.5
                                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400"
                                    : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                        )}>
                            <Star className={cn("w-3.5 h-3.5 mr-1 fill-current")} />
                            {rating.overall_rating?.toFixed(1) || '-'}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                            {dateFormatted}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 pb-5 px-6">
                <p className="text-sm leading-relaxed text-foreground/80 line-clamp-4 mb-3">
                    {rating.review_text || <span className="italic text-muted-foreground">No written review.</span>}
                </p>

                {/* Footer Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {rating.textbook_used && (
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-primary/20 text-primary">Textbook</Badge>
                    )}
                    {rating.tags?.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 h-5 bg-secondary/50 text-muted-foreground">
                            {tag}
                        </Badge>
                    ))}
                    {rating.tags && rating.tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground ml-1">+{rating.tags.length - 2}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
