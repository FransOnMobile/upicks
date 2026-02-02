'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { School, ThumbsUp } from 'lucide-react';
import { getAvatarColor } from '@/lib/avatar-utils';

interface ReviewerProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    nickname: string;
}

export function ReviewerProfileDialog({ isOpen, onClose, userId, nickname }: ReviewerProfileDialogProps) {
    const supabase = createClient();
    const [stats, setStats] = useState<{ count: number, helpful: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            const fetchStats = async () => {
                // 1. Professor Ratings
                const { count: profCount } = await supabase
                    .from('ratings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                const { data: profHelpful } = await supabase
                    .from('ratings')
                    .select('helpful_count')
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                // 2. Campus Ratings
                const { count: campusCount } = await supabase
                    .from('campus_ratings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                const { data: campusHelpful } = await supabase
                    .from('campus_ratings')
                    .select('helpful_count')
                    .eq('user_id', userId)
                    .eq('is_anonymous', false);

                const totalCount = (profCount || 0) + (campusCount || 0);
                const totalHelpful = (profHelpful?.reduce((acc, r) => acc + (r.helpful_count || 0), 0) || 0) +
                    (campusHelpful?.reduce((acc, r) => acc + (r.helpful_count || 0), 0) || 0);

                setStats({ count: totalCount, helpful: totalHelpful });
                setLoading(false);
            };
            fetchStats();
        }
    }, [isOpen, userId, supabase]);

    const getLevel = (count: number) => {
        if (count >= 50) return { title: "Dean's List", icon: <School className="w-4 h-4" /> };
        if (count >= 20) return { title: "Senior Reviewer", icon: <School className="w-4 h-4" /> };
        if (count >= 10) return { title: "Junior Reviewer", icon: <School className="w-4 h-4" /> };
        if (count >= 5) return { title: "Sophomore Reviewer", icon: <School className="w-4 h-4" /> };
        return { title: "Freshman Reviewer", icon: <School className="w-4 h-4" /> };
    };

    const level = stats ? getLevel(stats.count) : { title: "...", icon: null };
    const avatarColor = getAvatarColor(nickname);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl font-playfair shadow-xl ${avatarColor}`}>
                            {nickname.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center space-y-1">
                            <DialogTitle className="text-2xl font-bold font-playfair">{nickname}</DialogTitle>
                            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground items-center gap-1">
                                {level.icon}
                                {level.title}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-8 px-4">
                    <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/50">
                        <div className="text-3xl font-bold text-foreground mb-1">{loading ? "..." : stats?.count}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Reviews</div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/50">
                        <div className="text-3xl font-bold text-foreground mb-1 flex items-center justify-center gap-2">
                            {loading ? "..." : stats?.helpful}
                            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Helpful Votes</div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button variant="outline" onClick={onClose} className="w-full">Close Profile</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
