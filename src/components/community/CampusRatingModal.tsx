'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Star, Loader2 } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

export function CampusRatingModal({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [campus, setCampus] = useState<string>('');
    const [rating, setRating] = useState<number>(5);
    const [review, setReview] = useState('');

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campus) {
            toast.error("Please select a campus");
            return;
        }

        // Minimum 10 characters for review
        if (review.length < 10) {
            toast.error("Review must be at least 10 characters long");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to rate");
                return;
            }

            // Check for user details to ensure they can post (optional, consistent with professor rating)
            // For now, we assume if they can login they can rate.

            const { error } = await supabase
                .from('ratings')
                .insert({
                    rating_type: 'campus',
                    campus: campus,
                    overall_rating: rating,
                    review_text: review,
                    user_id: user.id,
                    // Fill required fields with defaults since this is a campus rating
                    clarity: 0,
                    teaching_quality: 0,
                    fairness: 0,
                    course_id: null, // Should be allowed null by migration
                    professor_id: null, // Should be allowed null by migration
                    is_anonymous: true
                });

            if (error) {
                console.error('Rating error:', error);
                toast.error("Failed to submit rating. Please try again.");
            } else {
                toast.success("Campus rating submitted successfully!");
                setOpen(false);
                // Reset form
                setCampus('');
                setRating(5);
                setReview('');
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-emerald-500/20 transition-all">
                    <Building2 className="w-4 h-4 mr-2" />
                    Rate a Campus
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-playfair font-bold">Rate a Campus</DialogTitle>
                    <DialogDescription>
                        Share your experience with the campus facilities, culture, and environment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="campus">Select Campus</Label>
                        <Select value={campus} onValueChange={setCampus}>
                            <SelectTrigger id="campus" className="bg-secondary/20 border-border/50">
                                <SelectValue placeholder="Select a UP campus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="diliman">UP Diliman</SelectItem>
                                <SelectItem value="mindanao">UP Mindanao</SelectItem>
                                {/* Add more campuses later if needed */}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Overall Rating</Label>
                            <span className="font-bold text-lg text-primary flex items-center">
                                {rating.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current" />
                            </span>
                        </div>
                        <Slider
                            value={[rating]}
                            min={1}
                            max={5}
                            step={0.5}
                            onValueChange={(val) => setRating(val[0])}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>Poor</span>
                            <span>Average</span>
                            <span>Excellent</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="review">Your Review</Label>
                        <Textarea
                            id="review"
                            placeholder="What do you think about the campus environment, facilities, or culture?"
                            className="resize-none min-h-[120px] bg-secondary/20 border-border/50 focus:border-primary/50"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground text-right">{review.length}/10 minimum characters</p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Rating"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
