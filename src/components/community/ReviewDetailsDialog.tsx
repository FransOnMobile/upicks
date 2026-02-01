'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, School, GraduationCap, Building2, Calendar, ThumbsUp, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

// Consistent interface with CommunityFeed
export interface ReviewDetails {
    id: string;
    overall_rating: number | null;
    review_text: string | null;
    created_at: string | null;
    helpful_count: number | null;
    rating_type?: 'professor' | 'campus';
    campus?: string | null;
    professors?: {
        name: string;
        department_id: string | null;
        campus: string | null;
    } | null;
    courses?: {
        code: string;
        name: string;
    } | null;
    // Detailed Metrics
    clarity?: number | null;
    fairness?: number | null;
    teaching_quality?: number | null;
    would_take_again?: boolean | null;
    facilities_rating?: number | null;
    safety_rating?: number | null;
    location_rating?: number | null;
    student_life_rating?: number | null;
    tags?: string[] | null;
    textbook_used?: boolean | null;
    mandatory_attendance?: boolean | null;
    grade?: string | null;
}

interface ReviewDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    review: ReviewDetails | null;
    onUpvote?: (reviewId: string) => void;
}

export function ReviewDetailsDialog({ isOpen, onClose, review, onUpvote }: ReviewDetailsDialogProps) {
    if (!review) return null;

    const isCampus = review.rating_type === 'campus';
    const dateFormatted = review.created_at
        ? new Date(review.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : 'Recent';

    const renderRatingRow = (label: string, value: number | null | undefined, icon?: React.ReactNode) => {
        if (value === null || value === undefined) return null;
        return (
            <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 hover:bg-muted/30 px-2 rounded transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{value.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
                {/* Header Section with Gradient */}
                <div className={cn(
                    "p-6 pb-8 relative overflow-hidden text-white",
                    isCampus ? "bg-emerald-900/90" : "bg-[#7b1113]/90"
                )}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10">
                        <DialogHeader className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md">
                                    {isCampus ? <Building2 className="w-3.5 h-3.5 mr-1" /> : <GraduationCap className="w-3.5 h-3.5 mr-1" />}
                                    {isCampus ? 'Campus Review' : 'Professor Review'}
                                </Badge>
                                {review.campus && (
                                    <Badge variant="outline" className="text-white/80 border-white/20">
                                        {review.campus === 'diliman' ? 'UP Diliman' : review.campus}
                                    </Badge>
                                )}
                            </div>
                            <DialogTitle className="text-3xl font-playfair font-bold tracking-tight text-white leading-tight">
                                {isCampus
                                    ? (review.campus === 'diliman' ? 'UP Diliman' : review.campus)
                                    : review.professors?.name}
                            </DialogTitle>
                            {!isCampus && review.courses && (
                                <DialogDescription className="text-white/80 flex items-center gap-2 mt-1">
                                    <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded text-xs">
                                        {review.courses.code}
                                    </span>
                                    <span>{review.courses.name}</span>
                                </DialogDescription>
                            )}
                        </DialogHeader>

                        <div className="flex items-end justify-between mt-6">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex items-center justify-center w-16 h-16 rounded-2xl font-bold font-playfair text-3xl shadow-lg border border-white/10 backdrop-blur-md",
                                    "bg-white/10 text-white"
                                )}>
                                    {review.overall_rating?.toFixed(1)}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-sm font-medium text-white/90">Overall Rating</div>
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.round(review.overall_rating || 0) ? "fill-current" : "fill-none opacity-30")} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {!isCampus && review.would_take_again !== null && (
                                <div className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm",
                                    review.would_take_again
                                        ? "bg-green-500/20 text-green-100 border border-green-500/30"
                                        : "bg-red-500/20 text-red-100 border border-red-500/30"
                                )}>
                                    {review.would_take_again ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                    {review.would_take_again ? 'Would Take Again' : 'Would Not Take Again'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-8">
                    {/* Review Text */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            <span>Written Review</span>
                            <span className="flex items-center gap-1.5 normal-case">
                                <Calendar className="w-3.5 h-3.5" />
                                {dateFormatted}
                            </span>
                        </div>
                        <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                            <p className="text-foreground/90 leading-relaxed text-base whitespace-pre-wrap">
                                {review.review_text || <span className="text-muted-foreground opacity-60">No written review provided.</span>}
                            </p>
                        </div>
                    </div>

                    {/* Tags & Badges Section (New) */}
                    {(review.tags?.length || review.textbook_used) && (
                        <div className="flex flex-wrap gap-2 pb-4 border-b border-border/40">
                            {review.tags?.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 transition-colors">
                                    {tag}
                                </Badge>
                            ))}
                            {review.textbook_used && (
                                <Badge variant="outline" className="border-primary/30 text-primary">
                                    Textbook Required
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Detailed Ratings Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium col-span-full mb-2">
                            Detailed Ratings
                        </div>
                        {isCampus ? (
                            <>
                                {renderRatingRow('Facilities', review.facilities_rating, <Building2 className="w-4 h-4" />)}
                                {renderRatingRow('Safety', review.safety_rating, <ShieldCheckIcon className="w-4 h-4" />)}
                                {renderRatingRow('Location', review.location_rating, <MapPinIcon className="w-4 h-4" />)}
                                {renderRatingRow('Student Life', review.student_life_rating, <UsersIcon className="w-4 h-4" />)}
                            </>
                        ) : (
                            <>
                                {renderRatingRow('Clarity', review.clarity, <BookIcon className="w-4 h-4" />)}
                                {renderRatingRow('Fairness', review.fairness, <ScaleIcon className="w-4 h-4" />)}
                                {renderRatingRow('Teaching Quality', review.teaching_quality, <GraduationCap className="w-4 h-4" />)}
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 bg-muted/40 border-t border-border flex sm:justify-between items-center w-full gap-4">
                    <div className="text-xs text-muted-foreground italic flex-1 text-center sm:text-left">
                        Posted by Anonymous Student
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => review && onUpvote?.(review.id)}
                            className="flex-1 sm:flex-none gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful_count || 0})
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Simple Icon Wrappers to avoid import clutter if not available, or use standard Lucide
function ShieldCheckIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> }
function MapPinIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg> }
function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> }
function BookIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg> }
function ScaleIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></svg> }
