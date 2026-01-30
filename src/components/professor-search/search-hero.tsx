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
    <div className="w-full relative bg-[#7b1113] text-white pt-24 pb-20 px-4 flex flex-col items-center text-center overflow-hidden shadow-2xl">
      {/* Abstract Background Shapes - More Premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7b1113] via-[#590d0e] to-[#3a0607]" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#fbbf24]/20 to-transparent rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold font-playfair tracking-tight drop-shadow-xl loading-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed italic font-playfair">
            {subtitle}
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto w-full pt-4">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10 pt-4">
            <Search className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-14 pr-6 h-16 text-lg w-full bg-white/95 backdrop-blur-xl text-gray-900 border-0 rounded-2xl shadow-xl focus:ring-4 focus:ring-[#fbbf24]/30 placeholder:text-gray-400 transition-all hover:bg-white hover:scale-[1.01] duration-300"
            autoFocus
          />
        </div>

        {/* Quick Stats - More Elegant */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg">
            <span className="text-[#fbbf24]">{totalProfessors}</span> {statLabel1}
          </div>
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg">
            <span className="text-[#fbbf24]">{totalReviews}</span> {statLabel2}
          </div>
        </div>
      </div>
    </div>
  );
}
