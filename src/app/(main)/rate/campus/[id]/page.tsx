'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, School, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RateCampusPage() {
    const params = useParams();
    const router = useRouter();
    const campusId = params.id as string;
    const [submitted, setSubmitted] = useState(false);

    // Mock Campus Name based on ID
    const campusName = campusId === 'diliman' ? 'UP Diliman' :
        campusId === 'mindanao' ? 'UP Mindanao' :
            'University of the Philippines';

    const [ratings, setRatings] = useState({
        facilities: 0,
        safety: 0,
        community: 0,
        happiness: 0
    });

    const [reviewText, setReviewText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
        }, 800);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold font-playfair mb-2 text-center">Thank You!</h2>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                    Your rating for {campusName} has been submitted. Your feedback helps the community grow stronger.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => router.push('/')} variant="outline">
                        Return Home
                    </Button>
                    <Button onClick={() => router.push('/rate?campus=' + campusId)}>
                        Find Professors
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-primary/5 border-b border-border py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <School className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-playfair">{campusName}</h1>
                            <p className="text-muted-foreground">Rate your campus experience</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto px-4 mt-8">
                <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-xl border border-border shadow-sm">

                    <div className="grid gap-8 md:grid-cols-2">
                        <RatingInput
                            label="Facilities"
                            description="Quality of classrooms, labs, and amenities"
                            value={ratings.facilities}
                            onChange={(v) => setRatings({ ...ratings, facilities: v })}
                        />
                        <RatingInput
                            label="Safety"
                            description="Security and general feeling of safety"
                            value={ratings.safety}
                            onChange={(v) => setRatings({ ...ratings, safety: v })}
                        />
                        <RatingInput
                            label="Community"
                            description="Student organizations and social life"
                            value={ratings.community}
                            onChange={(v) => setRatings({ ...ratings, community: v })}
                        />
                        <RatingInput
                            label="Overall Happiness"
                            description="How happy are you studying here?"
                            value={ratings.happiness}
                            onChange={(v) => setRatings({ ...ratings, happiness: v })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Detailed Review (Optional)</label>
                        <textarea
                            className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Share more details about your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                    </div>

                    <Button type="submit" size="lg" className="w-full font-semibold">
                        Submit Rating
                    </Button>
                </form>
            </div>
        </div>
    );
}

function RatingInput({ label, description, value, onChange }: { label: string, description: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <div className="font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`p-1 rounded-md transition-all hover:scale-110 ${star <= value ? 'text-yellow-500' : 'text-muted-foreground/30'
                            }`}
                    >
                        <Star className={`w-8 h-8 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
            <div className="text-sm font-medium text-primary h-5">
                {value > 0 ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value - 1] : ''}
            </div>
        </div>
    )
}
