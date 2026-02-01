'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from "@/utils/supabase/client";

interface CampusRatingFormProps {
    isOpen: boolean;
    onClose: () => void;
    campusId: string;
    campusName: string;
    onSubmit: (data: any) => Promise<void>;
}

export function CampusRatingForm({ isOpen, onClose, campusId, campusName, onSubmit }: CampusRatingFormProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        overallRating: 0,
        facilitiesRating: 0,
        safetyRating: 0,
        locationRating: 0,
        studentLifeRating: 0,
        reviewText: '',
        isAnonymous: false,
    });

    const handleRatingClick = (category: string, value: number) => {
        setFormData(prev => ({ ...prev, [category]: value }));
    };

    const renderStars = (category: string, currentVal: number, label: string) => (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(category, star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-8 h-8 ${star <= currentVal
                                ? 'fill-[#fbbf24] text-[#fbbf24]'
                                : 'fill-none text-muted-foreground/30 hover:text-[#fbbf24]/50'
                                }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-playfair font-bold text-[#7b1113]">Rate {campusName}</DialogTitle>
                    <DialogDescription>
                        Share your experience to help future Isko't Iska.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {step === 1 ? (
                        <>
                            {renderStars('overallRating', formData.overallRating, 'Overall Experience')}
                            {renderStars('facilitiesRating', formData.facilitiesRating, 'Facilities & Infrastructure')}
                            {renderStars('safetyRating', formData.safetyRating, 'Safety & Security')}
                            {renderStars('locationRating', formData.locationRating, 'Location & Accessibility')}
                            {renderStars('studentLifeRating', formData.studentLifeRating, 'Student Life & Community')}

                            <Button
                                className="w-full mt-4 bg-[#7b1113] hover:bg-[#901c1e]"
                                onClick={() => setStep(2)}
                                disabled={!formData.overallRating}
                            >
                                Next
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Write a Review (Optional)</label>
                                <textarea
                                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Tell us more about the campus environment, culture, and tips for freshmen..."
                                    value={formData.reviewText}
                                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="anonymous"
                                    checked={formData.isAnonymous}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked as boolean })}
                                />
                                <label
                                    htmlFor="anonymous"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Post anonymously
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                                <Button
                                    className="flex-1 bg-[#7b1113] hover:bg-[#901c1e]"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
