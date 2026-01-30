'use client';

import { MessageSquare } from 'lucide-react';

export function CommunityHero() {
    return (
        <div className="w-full relative bg-[#7b1113] text-white pt-24 pb-20 px-4 flex flex-col items-center text-center overflow-hidden shadow-2xl">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7b1113] via-[#590d0e] to-[#3a0607]" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#fbbf24]/20 to-transparent rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-4xl w-full space-y-6">
                <div className="space-y-4">

                    <h1 className="text-5xl md:text-7xl font-bold font-playfair tracking-tight drop-shadow-xl leading-tight">
                        Community Ratings
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed italic font-playfair">
                        See what students are saying about professors across all UP campuses.
                    </p>
                </div>

                {/* Decorative Divider */}
                <div className="w-24 h-1 bg-[#fbbf24] mx-auto rounded-full opacity-80" />
            </div>
        </div>
    );
}
