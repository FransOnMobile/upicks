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
  nicknames?: string[];
}

interface ProfessorCardProps {
  professor: Professor;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showPreview: boolean;
}

export function ProfessorCard({ professor, onClick, onMouseEnter, onMouseLeave, showPreview }: ProfessorCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
              ? 'fill-primary text-primary'
              : 'fill-none text-muted-foreground/30'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-custom-hover p-6 cursor-pointer hover:-translate-y-1 group border border-border/50 transition-all duration-300"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors font-playfair tracking-tight">
            {professor.name}
          </h3>
          <p className="text-sm text-foreground/60 font-medium uppercase tracking-wider text-xs">{professor.department}</p>
        </div>
        <div className="flex flex-col items-end bg-secondary/30 p-2 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-primary font-playfair">
              {professor.overallRating.toFixed(1)}
            </span>
          </div>
          {renderStars(Math.round(professor.overallRating))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-foreground/60">
        <MessageSquare className="w-4 h-4" />
        <span>{professor.reviewCount} {professor.reviewCount === 1 ? 'review' : 'reviews'}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {professor.topTags.slice(0, 3).map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-secondary/50 text-foreground border border-border/50 text-xs px-2.5 py-1 rounded-md font-medium"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {showPreview && professor.recentReview && (
        <div className="absolute inset-x-0 -bottom-2 translate-y-full bg-popover/95 backdrop-blur-md rounded-xl shadow-xl p-5 z-20 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-4 h-4 bg-popover absolute -top-2 left-8 rotate-45 border-t border-l border-primary/20"></div>
          <h4 className="text-sm font-semibold text-foreground mb-2 font-playfair">Recent Review</h4>
          <p className="text-sm text-foreground/80 leading-relaxed italic font-serif">
            "{professor.recentReview}"
          </p>
        </div>
      )}
    </div>
  );
}
