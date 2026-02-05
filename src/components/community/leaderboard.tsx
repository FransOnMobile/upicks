'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Trophy, Medal, Star } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

interface TopProfessor {
    id: string;
    name: string;
    department: string;
    rating_count: number;
    avg_rating: number;
    campus: string;
}

const TIME_RANGES = {
    'week': '7 days',
    'month': '30 days',
    'all': '100 years'
};

export function Leaderboard({ timeRange = 'week' }: { timeRange?: 'week' | 'month' | 'all' }) {
    const [professors, setProfessors] = useState<TopProfessor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const supabase = createClient();
            // Using the new RPC that accepts an interval string
            const interval = TIME_RANGES[timeRange];
            const { data, error } = await supabase.rpc('get_trending_professors', { time_range: interval });

            if (error) {
                console.error("Error fetching leaderboard:", error);
            } else if (data) {
                setProfessors(data);
            }
            setIsLoading(false);
        };

        fetchLeaderboard();
    }, [timeRange]);

    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    if (professors.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm mb-8 max-w-2xl mx-auto">
                <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold font-playfair text-foreground mb-2">No data yet</h3>
                <p className="text-muted-foreground">No ratings found for this time period. Be the first to rate!</p>
            </div>
        );
    }

    // Assign positions for the podium: [2nd, 1st, 3rd]
    // If we have 1 prof: [null, 1st, null]
    // If we have 2 profs: [2nd, 1st, null]
    // If we have 3 profs: [2nd, 1st, 3rd]

    // professors is sorted by rank (desc).
    // profs[0] is #1
    // profs[1] is #2
    // profs[2] is #3

    const first = professors[0];
    const second = professors[1];
    const third = professors[2];

    return (
        <div className="w-full">
            <div className="flex items-end justify-center gap-4 md:gap-8 min-h-[300px] px-4 pb-4">
                {/* 2nd Place */}
                <div className={`flex-1 max-w-[150px] flex flex-col items-center justify-end ${second ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-200`}>
                    {second ? (
                        <PodiumItem
                            professor={second}
                            rank={2}
                            height="h-48"
                            textColor="text-gray-900"
                            glassClass="bg-gray-100/90"
                            ringColor="ring-gray-300"
                            badgeColor="bg-gray-400"
                        />
                    ) : <div className="h-44 w-full" />}
                </div>

                {/* 1st Place */}
                <div className={`flex-1 max-w-[180px] flex flex-col items-center z-10 -mx-2 justify-end ${first ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-100`}>
                    {first ? (
                        <PodiumItem
                            professor={first}
                            rank={1}
                            height="h-64"
                            textColor="text-yellow-950"
                            glassClass="bg-gradient-to-b from-yellow-300 to-yellow-400"
                            ringColor="ring-yellow-400"
                            badgeColor="bg-yellow-500"
                        />
                    ) : <div className="h-56 w-full" />}
                </div>

                {/* 3rd Place */}
                <div className={`flex-1 max-w-[150px] flex flex-col items-center justify-end ${third ? 'opacity-100' : 'opacity-0'} transition-all duration-700 delay-300`}>
                    {third ? (
                        <PodiumItem
                            professor={third}
                            rank={3}
                            height="h-44"
                            textColor="text-amber-950"
                            glassClass="bg-amber-200/90"
                            ringColor="ring-amber-300"
                            badgeColor="bg-amber-600"
                        />
                    ) : <div className="h-36 w-full" />}
                </div>
            </div>
        </div>
    );
}

function PodiumItem({
    professor,
    rank,
    height,
    textColor,
    glassClass,
    ringColor,
    badgeColor
}: {
    professor: TopProfessor,
    rank: number,
    height: string,
    textColor: string,
    glassClass: string,
    ringColor: string,
    badgeColor: string
}) {
    return (
        <Link href={`/rate/professor/${professor.id}`} className="flex flex-col items-center w-full group cursor-pointer relative top-0 hover:-top-3 transition-all duration-500 ease-out">
            {/* Avatar / Crown */}
            <div className="relative mb-4 group-hover:scale-110 transition-transform duration-500 z-30">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border-4 ${ringColor} flex items-center justify-center shadow-2xl relative z-20 overflow-hidden`}>
                    <span className="text-2xl md:text-3xl font-black font-playfair text-[#7b1113]">{professor.name.charAt(0)}</span>
                </div>
                {rank === 1 && (
                    <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 text-4xl md:text-6xl animate-bounce z-30 filter drop-shadow-xl duration-1000">
                        👑
                    </div>
                )}
                <div className={`absolute -bottom-3 -right-3 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm text-white shadow-lg z-40 ring-4 ring-white ${badgeColor}`}>
                    #{rank}
                </div>
            </div>

            {/* Floating Card */}
            <div className={`w-full ${height} ${glassClass} rounded-[2rem] relative overflow-hidden shadow-xl border border-white/40 flex flex-col justify-between p-4 md:p-5 ${textColor} backdrop-blur-md group-hover:shadow-2xl group-hover:border-white/60 transition-all duration-500 z-10`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent opacity-50" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col h-full justify-between items-center text-center">
                    <div className="w-full">
                        <p className="font-bold text-sm md:text-base leading-tight mb-1 line-clamp-2">{professor.name}</p>
                        <p className="text-[10px] md:text-xs uppercase tracking-wider opacity-70 font-semibold truncate px-1">{professor.campus}</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-full">
                        <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] font-bold opacity-80">{professor.rating_count} Ratings</span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-1.5 shadow-sm flex items-center gap-1.5 ring-1 ring-black/5">
                            <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-black text-gray-900">{professor.avg_rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function LeaderboardSkeleton() {
    return (
        <div className="flex items-end justify-center gap-4 h-[250px] mb-12">
            {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 max-w-[120px] flex flex-col items-center gap-4 ${i === 2 ? 'mb-8' : ''}`}>
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <Skeleton className={`w-full rounded-t-xl ${i === 2 ? 'h-40' : 'h-32'}`} />
                </div>
            ))}
        </div>
    );
}
