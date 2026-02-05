import { CommunityFeed } from '@/components/community/CommunityFeed';
import { Highlights } from '@/components/community/highlights';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
    title: 'Community Ratings | UPicks',
    description: 'See what the UP community is saying about professors and campuses.',
};

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background Gradients Removed */}

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-foreground">
                <Tabs defaultValue="highlights" className="w-full">
                    <div className="flex justify-center mb-12">
                        <TabsList className="bg-muted/50 p-1 rounded-full h-auto">
                            <TabsTrigger
                                value="highlights"
                                className="px-8 py-3 rounded-full text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                            >
                                Highlights
                            </TabsTrigger>
                            <TabsTrigger
                                value="feed"
                                className="px-8 py-3 rounded-full text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                            >
                                Live Feed
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="highlights" className="animate-in fade-in-50 duration-500">
                        <Highlights />
                    </TabsContent>

                    <TabsContent value="feed" className="animate-in fade-in-50 duration-500 min-h-[500px]">
                        <header className="mb-12 md:mb-16 text-center max-w-3xl mx-auto relative z-10">
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
                        <div className="w-full">
                            <CommunityFeed />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
