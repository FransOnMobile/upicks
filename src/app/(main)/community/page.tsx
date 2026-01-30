import { CommunityFeed } from '@/components/professor-search/community-feed';

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-background noise-texture">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight text-foreground">Community Ratings</h1>
                    <p className="text-muted-foreground text-lg">
                        See what students are saying about professors across UP campuses.
                    </p>
                </header>

                <div className="space-y-6">
                    <CommunityFeed />
                </div>
            </div>
        </div>
    );
}
