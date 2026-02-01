import { CommunityFeed } from '@/components/community/CommunityFeed';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Ratings | UPicks',
    description: 'See what the UP community is saying about professors and campuses.',
};

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background Gradients Removed */}

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-foreground">
                <header className="mb-16 md:mb-24 text-center max-w-3xl mx-auto relative z-10">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-secondary text-sm font-medium text-secondary-foreground animate-fade-in-up">
                        The Voice of the Community
                    </div>
                    <h1 className="text-4xl md:text-6xl font-playfair font-black mb-6 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 animate-fade-in-up animation-delay-100">
                        Community Ratings
                    </h1>
                    <div className="w-24 h-1.5 bg-[#7b1113] mx-auto rounded-full mb-6 animate-fade-in-up animation-delay-150"></div>
                    <p className="text-muted-foreground text-lg md:text-xl leading-relaxed animate-fade-in-up animation-delay-200">
                        Honest, anonymous feedback from students across UP campuses.
                        <br className="hidden md:block" />
                        Rate your professors and your campus experience.
                    </p>
                </header>

                <div className="relative z-10 animate-fade-in-up animation-delay-300 min-h-[500px]">
                    <CommunityFeed />
                </div>
            </div>
        </div>
    );
}
