'use client';

import { useState, useEffect, useTransition } from 'react';
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAvatarColor } from '@/lib/avatar-utils';
import { addReply, getReplies, deleteReply, type ReplyType } from '@/app/actions/replies';

interface Reply {
    id: string;
    rating_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user_nickname: string;
    is_anonymous: boolean;
}

interface ReviewRepliesProps {
    ratingId: string;
    type: ReplyType;
    isAuthenticated: boolean;
    currentUserId?: string;
    initialReplyCount?: number;
    onUserClick?: (id: string, nickname: string) => void;
}

export function ReviewReplies({
    ratingId,
    type,
    isAuthenticated,
    currentUserId,
    initialReplyCount = 0,
    onUserClick
}: ReviewRepliesProps) {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [replyCount, setReplyCount] = useState(initialReplyCount);
    const [hasFetched, setHasFetched] = useState(false);

    // Initial fetch if there are replies
    useEffect(() => {
        if (initialReplyCount > 0 && !hasFetched) {
            fetchReplies();
        }
    }, [initialReplyCount]);

    const fetchReplies = async () => {
        setIsLoading(true);
        const result = await getReplies(ratingId, type);
        if (result.success) {
            setReplies(result.replies as Reply[]);
            setReplyCount(result.replies.length);
            setHasFetched(true);
        }
        setIsLoading(false);
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;

        setError(null);
        startTransition(async () => {
            const result = await addReply(ratingId, replyContent, type, isAnonymous);

            if (result.success && result.reply) {
                await fetchReplies();
                setReplyContent('');
                setIsAnonymous(false);
                setShowReplyForm(false);
                setIsExpanded(true); // Auto-expand to show the new reply (which usually goes to end)
            } else {
                setError(result.error || 'Failed to add reply');
            }
        });
    };

    const handleDeleteReply = async (replyId: string) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;

        startTransition(async () => {
            const result = await deleteReply(replyId, type);

            if (result.success) {
                setReplies(prev => prev.filter(r => r.id !== replyId));
                setReplyCount(prev => prev - 1);
            } else {
                setError(result.error || 'Failed to delete reply');
            }
        });
    };

    const canDeleteReply = (reply: Reply) => {
        if (!currentUserId) return false;
        if (reply.user_id !== currentUserId) return false;
        const replyDate = new Date(reply.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - replyDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24;
    };

    const characterCount = replyContent.length;
    const isOverLimit = characterCount > 500;

    // Visibility Logic:
    // If not expanded, show top 2. If expanded, show all.
    const visibleReplies = isExpanded ? replies : replies.slice(0, 2);
    const hiddenCount = replies.length - visibleReplies.length;

    return (
        <div className="mt-4 pt-4 border-t border-border/30">
            {/* Header / Stats - Only show if we have replies or if loading/error state implies interaction */}
            {replyCount > 0 && (
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground font-medium">
                    <MessageCircle className="w-4 h-4" />
                    <span>{replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</span>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !hasFetched && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Replies List */}
            {hasFetched && replies.length > 0 && (
                <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    {visibleReplies.map((reply) => (
                        <div
                            key={reply.id}
                            className="group/reply flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 transition-colors"
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold font-playfair shrink-0 select-none",
                                    reply.is_anonymous ? "bg-gray-400" : getAvatarColor(reply.user_nickname),
                                    !reply.is_anonymous && onUserClick && "cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary/20 transition-all"
                                )}
                                onClick={() => !reply.is_anonymous && onUserClick?.(reply.user_id, reply.user_nickname)}
                            >
                                {reply.is_anonymous ? '?' : reply.user_nickname.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={cn(
                                            "font-semibold text-sm text-foreground",
                                            !reply.is_anonymous && onUserClick && "cursor-pointer hover:underline decoration-dotted"
                                        )}
                                        onClick={() => !reply.is_anonymous && onUserClick?.(reply.user_id, reply.user_nickname)}
                                    >
                                        {reply.user_nickname}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatRelativeTime(reply.created_at)}
                                    </span>
                                    {canDeleteReply(reply) && (
                                        <button
                                            onClick={() => handleDeleteReply(reply.id)}
                                            disabled={isPending}
                                            className="ml-auto opacity-0 group-hover/reply:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                            title="Delete reply"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
                                    {reply.content}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Expand/Collapse Toggle */}
                    {replyCount > 2 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 ml-11 mt-2 transition-colors"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-3 h-3" />
                                    Show less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3 h-3" />
                                    View {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4">
                    {error}
                </div>
            )}

            {/* Actions / Form */}
            <div className="ml-1">
                {isAuthenticated ? (
                    <>
                        {!showReplyForm ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReplyForm(true)}
                                className="text-muted-foreground hover:text-foreground h-8 px-2 -ml-2"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Reply
                            </Button>
                        ) : (
                            <div className="space-y-3 animate-in fade-in duration-200 bg-muted/20 p-4 rounded-xl border border-border/40">
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write your reply... (Max 500 characters)"
                                    className="min-h-[80px] resize-none text-sm bg-background"
                                    maxLength={550}
                                />

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="rounded border-gray-300 text-[#7b1113] focus:ring-[#7b1113]"
                                            />
                                            Reply Anonymously
                                        </label>
                                        <span className={cn(
                                            "text-xs",
                                            isOverLimit ? "text-destructive" : "text-muted-foreground"
                                        )}>
                                            {characterCount}/500
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowReplyForm(false);
                                                setReplyContent('');
                                                setError(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSubmitReply}
                                            disabled={isPending || !replyContent.trim() || isOverLimit}
                                            className="gap-2 bg-[#7b1113] hover:bg-[#5a0d0f]"
                                        >
                                            {isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            Post Reply
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        <a href="/sign-in" className="text-[#7b1113] hover:underline font-medium">
                            Sign in
                        </a>
                        {' '}to reply
                    </div>
                )}
            </div>
        </div>
    );
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}
