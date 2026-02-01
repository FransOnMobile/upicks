'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Grid, Layers, User, Building2 } from 'lucide-react';

export type FilterType = 'all' | 'professor' | 'campus';
export type SortOption = 'latest' | 'highest' | 'lowest';

interface FilterBarProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
    selectedCampus: string | null;
    onCampusChange: (campus: string | null) => void;
}

export function FilterBar({ currentFilter, onFilterChange, currentSort, onSortChange, selectedCampus, onCampusChange }: FilterBarProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/5 backdrop-blur-sm p-2 rounded-2xl border border-white/10">

            {/* Filter Tabs */}
            <div className="flex p-1 bg-secondary/30 rounded-xl w-full sm:w-auto overflow-x-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('all')}
                    className={cn(
                        "rounded-lg px-4 font-medium transition-all duration-300",
                        currentFilter === 'all'
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                >
                    <Layers className="w-4 h-4 mr-2" />
                    All Ratings
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('professor')}
                    className={cn(
                        "rounded-lg px-4 font-medium transition-all duration-300",
                        currentFilter === 'professor'
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                >
                    <User className="w-4 h-4 mr-2" />
                    Professors
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('campus')}
                    className={cn(
                        "rounded-lg px-4 font-medium transition-all duration-300",
                        currentFilter === 'campus'
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                >
                    <Building2 className="w-4 h-4 mr-2" />
                    Campuses
                </Button>
            </div>

            {/* Campus & Sort */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Select value={selectedCampus || "all"} onValueChange={(val) => onCampusChange(val === "all" ? null : val)}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-secondary/20 border-white/10">
                        <SelectValue placeholder="All Campuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Campuses</SelectItem>
                        <SelectItem value="diliman">UP Diliman</SelectItem>
                        <SelectItem value="los-banos">UP Los Baños</SelectItem>
                        <SelectItem value="manila">UP Manila</SelectItem>
                        <SelectItem value="visayas">UP Visayas</SelectItem>
                        <SelectItem value="baguio">UP Baguio</SelectItem>
                        <SelectItem value="cebu">UP Cebu</SelectItem>
                        <SelectItem value="mindanao">UP Mindanao</SelectItem>
                        <SelectItem value="ou">UP Open University</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">Sort:</span>
                    <Select value={currentSort} onValueChange={(val) => onSortChange(val as SortOption)}>
                        <SelectTrigger className="w-full sm:w-[150px] bg-secondary/20 border-white/10">
                            <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Most Recent</SelectItem>
                            <SelectItem value="highest">Highest Rated</SelectItem>
                            <SelectItem value="lowest">Lowest Rated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
