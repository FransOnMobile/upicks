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
  statLabel1?: string;
  statLabel2?: string;
}

export function SearchHero({
  onSearchChange,
  searchValue,
  totalProfessors,
  totalReviews,
  title = "Find Your Professor",
  subtitle = "Search by name, department, or course code",
  statLabel1 = "Professors",
  statLabel2 = "Reviews",
}: SearchHeroProps) {
  return (
    <div className="w-full relative bg-gradient-to-br from-[#7b1113] to-[#590d0e] text-white pt-24 pb-16 px-4 flex flex-col items-center text-center overflow-hidden shadow-2xl">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#ffb74d] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 font-playfair tracking-tight drop-shadow-md">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
          {subtitle}
        </p>

        <div className="relative max-w-2xl mx-auto w-full pt-8">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10 pt-8">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-14 pr-6 h-16 text-lg w-full bg-white/95 backdrop-blur-md text-gray-900 border-0 rounded-full shadow-xl focus:ring-4 focus:ring-white/30 placeholder:text-gray-500 transition-all hover:bg-white"
            autoFocus
          />
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-8 mt-8 text-white/80 text-sm font-medium tracking-wider uppercase">
          <div>{totalProfessors} {statLabel1}</div>
          <div className="w-px h-4 bg-white/30" />
          <div>{totalReviews} {statLabel2}</div>
        </div>
      </div>
    </div>
  );
}
