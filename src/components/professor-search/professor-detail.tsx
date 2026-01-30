'use client';

import { Star, ThumbsUp, Flag, X, TrendingUp, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

import { ReportButton } from './report-button';

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  course: string;
  tags: string[];
  helpful_count: number;
  created_at: string;
  is_anonymous: boolean;
  author?: string;
  teaching_quality: number;
  fairness: number;
  clarity: number;
}

interface ProfessorDetailProps {
  isOpen: boolean;
  onClose: () => void;
  professor: {
    id: string;
    name: string;
    department: string;
    overallRating: number;
    reviewCount: number;
    wouldTakeAgainPercent?: number;
    campus?: string;
  };
  reviews: Review[];
  onUpvote: (reviewId: string) => void;
  onRateClick: () => void;
  isAuthenticated: boolean;
}

export function ProfessorDetail({
  isOpen,
  onClose,
  professor,
  reviews,
  onUpvote,
  onRateClick,
  isAuthenticated
}: ProfessorDetailProps) {
  const [sortBy, setSortBy] = useState<'helpful' | 'recent'>('helpful');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      return b.helpful_count - a.helpful_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
              ? 'fill-[#800000] text-[#800000]'
              : 'fill-none text-[#2d2540]/20'
              }`}
          />
        ))}
      </div>
    );
  };

  const avgTeachingQuality = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.teaching_quality, 0) / reviews.length
    : 0;
  const avgFairness = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.fairness, 0) / reviews.length
    : 0;
  const avgClarity = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.clarity, 0) / reviews.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[6px]">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 hover:bg-[#faf8ff]"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex justify-between items-start pr-10">
            <div>
              <DialogTitle className="text-3xl font-bold text-[#2d2540]">
                {professor.name}
              </DialogTitle>
              <p className="text-lg text-[#2d2540]/60 font-medium">{professor.department}</p>
            </div>
            <div>
              <ReportButton
                targetId={professor.id}
                targetType="professor"
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex gap-8 items-start">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#800000] mb-2">
                {professor.overallRating.toFixed(1)}
              </div>
              {renderStars(Math.round(professor.overallRating))}
              <div className="text-sm text-[#2d2540]/60 mt-2">
                {professor.reviewCount} {professor.reviewCount === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[#2d2540]">Teaching Quality</span>
                  <span className="text-sm font-semibold text-[#800000]">{avgTeachingQuality.toFixed(1)}</span>
                </div>
                <Progress value={(avgTeachingQuality / 5) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[#2d2540]">Fairness</span>
                  <span className="text-sm font-semibold text-[#800000]">{avgFairness.toFixed(1)}</span>
                </div>
                <Progress value={(avgFairness / 5) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[#2d2540]">Clarity</span>
                  <span className="text-sm font-semibold text-[#800000]">{avgClarity.toFixed(1)}</span>
                </div>
                <Progress value={(avgClarity / 5) * 100} className="h-2" />
              </div>
            </div>

            {professor.wouldTakeAgainPercent !== undefined && (
              <div className="text-center bg-[#faf8ff] rounded-[4px] p-4 min-w-[120px]">
                <div className="text-3xl font-bold text-[#800000] mb-1">
                  {professor.wouldTakeAgainPercent}%
                </div>
                <div className="text-xs text-[#2d2540]/60 font-medium">Would Take Again</div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onRateClick}
              className="bg-[#800000] hover:bg-[#600000] text-white rounded-[4px] shadow-custom hover:shadow-custom-hover font-semibold"
            >
              Rate This Professor
            </Button>
          </div>

          <div className="border-t border-[rgba(100,80,140,0.12)] pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#2d2540]">Student Reviews</h3>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('helpful')}
                  className={sortBy === 'helpful'
                    ? 'bg-[#800000] hover:bg-[#600000] text-white rounded-[2px]'
                    : 'border-[rgba(100,80,140,0.12)] rounded-[2px]'
                  }
                >
                  Most Helpful
                </Button>
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                  className={sortBy === 'recent'
                    ? 'bg-[#800000] hover:bg-[#600000] text-white rounded-[2px]'
                    : 'border-[rgba(100,80,140,0.12)] rounded-[2px]'
                  }
                >
                  Most Recent
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {sortedReviews.length === 0 ? (
                <div className="text-center py-8 text-[#2d2540]/60">
                  No reviews yet. Be the first to review this professor!
                </div>
              ) : (
                sortedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-[#faf8ff] rounded-[4px] p-5 border border-[rgba(100,80,140,0.12)]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3 items-center">
                        {renderStars(review.rating)}
                        <Badge variant="outline" className="text-xs border-[rgba(100,80,140,0.12)] rounded-[2px]">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {review.course}
                        </Badge>
                      </div>
                      <span className="text-xs text-[#2d2540]/60">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[#2d2540] leading-relaxed mb-3">
                      {review.reviewText}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {review.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-white text-[#2d2540] border border-[rgba(100,80,140,0.12)] text-xs rounded-[2px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-[#2d2540]/60">
                        By {review.is_anonymous ? 'Anonymous' : review.author || 'Anonymous'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpvote(review.id)}
                          className="text-[#2d2540]/60 hover:text-[#800000] hover:bg-[#faf8ff]"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {review.helpful_count}
                        </Button>
                        <ReportButton
                          targetId={review.id}
                          targetType="rating"
                          isAuthenticated={isAuthenticated}
                          iconOnly
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
