'use client';

import { User } from '@supabase/supabase-js';

interface DashboardHeroProps {
    user: User;
    campus?: string;
    program?: string;
}

export function DashboardHero({ user, campus, program }: DashboardHeroProps) {
    // Get first name or display name
    const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'Student';

    // Format Campus Name
    const formatCampus = (c?: string) => {
        if (!c) return 'UP System';
        if (c === 'diliman') return 'UP Diliman';
        if (c === 'los-banos') return 'UP Los Baños';
        if (c === 'manila') return 'UP Manila';
        if (c === 'visayas') return 'UP Visayas';
        if (c === 'cebu') return 'UP Cebu';
        if (c === 'baguio') return 'UP Baguio';
        if (c === 'mindanao') return 'UP Mindanao';
        if (c === 'ou') return 'UP Open University';
        return c;
    }

    return (
        <div className="w-full relative bg-[#7b1113] text-white pt-28 pb-20 px-4 flex flex-col items-center text-center overflow-hidden shadow-2xl">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7b1113] via-[#590d0e] to-[#3a0607]" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#fbbf24]/20 to-transparent rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-4xl w-full space-y-6">
                <div className="space-y-4">

                    <h1 className="text-4xl md:text-6xl font-bold font-playfair tracking-tight drop-shadow-xl leading-tight">
                        Welcome back, {firstName}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed font-playfair flex items-center justify-center gap-2">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-base border border-white/10">
                            {formatCampus(campus)}
                        </span>
                        {program && (
                            <span className="hidden md:inline-block opacity-60">•</span>
                        )}
                        {program && (
                            <span className="hidden md:inline-block">{program}</span>
                        )}
                    </p>
                </div>

                {/* Decorative Divider */}
                <div className="w-24 h-1 bg-[#fbbf24] mx-auto rounded-full opacity-80" />
            </div>
        </div>
    );
}
