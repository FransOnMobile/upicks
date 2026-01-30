import { CommunityFeed } from '@/components/professor-search/community-feed';
import { CommunityHero } from '@/components/community/community-hero';

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-background noise-texture">
            <CommunityHero />

            <div className="max-w-4xl mx-auto px-4 py-8 -mt-16 relative z-20">
                <div className="space-y-6">
                    <CommunityFeed />
                </div>
            </div>
        </div>
    );
}
