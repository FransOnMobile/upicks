'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchHeroProps {
  onSearchChange: (value: string) => void;
  searchValue: string;
  totalProfessors: number;
  totalReviews: number;
  title?: string;
  subtitle?: string;
}

export function SearchHero({
  onSearchChange,
  searchValue,
  totalProfessors,
  totalReviews,
  title = "Find Your Professor",
  subtitle = "Search via name or department to see what students are saying."
}: SearchHeroProps) {
  return (
    <div className="w-full bg-[#faf8ff] noise-texture pt-24 pb-12 px-4 flex flex-col items-center text-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-5xl md:text-7xl font-bold text-[#2d2540] mb-6 leading-tight font-playfair">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-[#2d2540]/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <div className="relative max-w-2xl mx-auto w-full shadow-2xl rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <Input
            type="text"
            placeholder="Search for a professor..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-6 py-8 text-xl w-full bg-white border-none rounded-lg focus:ring-4 focus:ring-primary/20 placeholder:text-muted-foreground/40"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
