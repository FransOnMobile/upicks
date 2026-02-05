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
import { Badge } from '@/components/ui/badge';

interface CampusRatingFormProps {
    isOpen: boolean;
    onClose: () => void;
    campusId: string;
    campusName: string;
    onSubmit: (data: any) => Promise<void>;
    availableTags?: any[];
}

export function CampusRatingForm({ isOpen, onClose, campusId, campusName, onSubmit, availableTags = [] }: CampusRatingFormProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        overallRating: 0,
        facilitiesRating: 0,
        safetyRating: 0,
        locationRating: 0,
        studentLifeRating: 0,
        reviewText: '',
        isAnonymous: true,
        selectedTags: [] as string[]
    });

    const handleRatingClick = (category: string, value: number) => {
        setFormData(prev => ({ ...prev, [category]: value }));
    };

    const toggleTag = (tagId: string) => {
        setFormData(prev => {
            const current = prev.selectedTags;
            if (current.includes(tagId)) {
                return { ...prev, selectedTags: current.filter(id => id !== tagId) };
            } else {
                if (current.length >= 5) return prev; // Limit to 5 tags
                return { ...prev, selectedTags: [...current, tagId] };
            }
        });
    };

    const renderStars = (category: string, currentVal: number, label: string) => (
        <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
                {label}
                {currentVal > 0 && <span className="text-primary font-bold">{currentVal}/5</span>}
            </label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(category, star)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
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
        try {
            await onSubmit(formData);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate completion for step 1
    const step1Complete = formData.overallRating > 0 &&
        formData.facilitiesRating > 0 &&
        formData.safetyRating > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-playfair font-bold text-[#7b1113]">Rate {campusName}</DialogTitle>
                    <DialogDescription>
                        Step {step} of 2
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {step === 1 ? (
                        <>
                            {renderStars('overallRating', formData.overallRating, 'Overall Experience *')}
                            {renderStars('facilitiesRating', formData.facilitiesRating, 'Facilities & Infrastructure *')}
                            {renderStars('safetyRating', formData.safetyRating, 'Safety & Security *')}
                            {renderStars('locationRating', formData.locationRating, 'Location & Accessibility')}
                            {renderStars('studentLifeRating', formData.studentLifeRating, 'Student Life & Community')}

                            <Button
                                className="w-full mt-4 bg-[#7b1113] hover:bg-[#901c1e] h-12 text-lg"
                                onClick={() => setStep(2)}
                                disabled={!step1Complete}
                            >
                                Next
                            </Button>
                            {!step1Complete && <p className="text-xs text-center text-muted-foreground">Please rate required fields (*)</p>}
                        </>
                    ) : (
                        <>
                            {/* Tags Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">What stands out? (Select up to 5)</label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                                    {availableTags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant={formData.selectedTags.includes(tag.id) ? "default" : "outline"}
                                            className={`cursor-pointer px-3 py-1 ${formData.selectedTags.includes(tag.id) ? 'bg-[#7b1113] hover:bg-[#901c1e]' : 'hover:bg-secondary'}`}
                                            onClick={() => toggleTag(tag.id)}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Write a Review (Optional)</label>
                                <textarea
                                    className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Tell us more about the campus environment, culture, and tips for freshmen..."
                                    value={formData.reviewText}
                                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                                    maxLength={500}
                                />
                                <div className="text-right text-xs text-muted-foreground">{formData.reviewText.length}/500</div>
                            </div>

                            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg">
                                <Checkbox
                                    id="anonymous"
                                    checked={formData.isAnonymous}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked as boolean })}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="anonymous"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Post anonymously
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        Your name will be hidden from the public review.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">Back</Button>
                                <Button
                                    className="flex-1 bg-[#7b1113] hover:bg-[#901c1e] h-12 font-bold"
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
