'use client';

import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
    const supabase = createClient();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [modPendingCount, setModPendingCount] = useState(0);
    const [isMod, setIsMod] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Check if moderator
            const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
            const isModerator = profile?.role === 'moderator' || profile?.role === 'admin';
            setIsMod(isModerator);

            // Fetch Notifications
            await fetchNotifications(user.id);

            // Fetch Mod Pending (if mod)
            if (isModerator) {
                await fetchModPending();
            }

            // Realtime Subscription
            const channel = supabase
                .channel('notifications_channel')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        setNotifications(prev => [payload.new, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };
        init();
    }, []);

    const fetchNotifications = async (uid: string) => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const fetchModPending = async () => {
        // Count pending reports
        const { count: reportCount } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Count pending nicknames
        const { count: nickCount } = await supabase
            .from('professor_nicknames')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Count unverified professors (optional, adding if simple)
        const { count: profCount } = await supabase
            .from('professors')
            .select('*', { count: 'exact', head: true })
            .eq('is_verified', false);

        setModPendingCount((reportCount || 0) + (nickCount || 0) + (profCount || 0));
    };

    const markAsRead = async (id: string, link?: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await supabase.from('notifications').update({ is_read: true }).eq('id', id);

        if (link) {
            setIsOpen(false);
            router.push(link);
        }
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        if (userId) {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
        }
    };

    if (!userId) return null;

    const totalAlerts = unreadCount + (isMod ? modPendingCount : 0);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-foreground/80 hover:text-primary hover:bg-transparent">
                    <Bell className="w-5 h-5" />
                    {totalAlerts > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#7b1113] rounded-full animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4 bg-popover/95 backdrop-blur-md border-border shadow-2xl" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto text-xs text-muted-foreground hover:text-foreground p-0" onClick={markAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {/* Mod Section */}
                    {isMod && modPendingCount > 0 && (
                        <div className="p-2 border-b border-border bg-yellow-500/5">
                            <Link
                                href="/moderator"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Moderator Action Needed</p>
                                    <p className="text-xs text-muted-foreground">You have {modPendingCount} pending items to review.</p>
                                </div>
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 ml-auto pointer-events-none">
                                    {modPendingCount}
                                </Badge>
                            </Link>
                        </div>
                    )}

                    {notifications.length === 0 && (!isMod || modPendingCount === 0) ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "p-4 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                                    !n.is_read ? "bg-muted/10 border-l-2 border-l-primary" : "opacity-70"
                                )}
                                onClick={() => markAsRead(n.id, n.link)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {n.type === 'upvote' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                        {n.type === 'mod_alert' && <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                                        {n.type === 'report' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                        {!['upvote', 'report', 'mod_alert'].includes(n.type) && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-sm leading-tight text-foreground", n.type === 'mod_alert' && "font-medium text-red-600")}>
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
