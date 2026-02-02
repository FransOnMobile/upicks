'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Tag, Loader2, Check, Clock, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeNickname } from '@/lib/security';
import { submitNickname } from '@/app/actions';

interface Nickname {
    id: string;
    nickname: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_by: string | null;
    created_at: string;
}

interface ProfessorNicknamesProps {
    professorId: string;
    professorName: string;
    isAuthenticated: boolean;
    className?: string;
}

export function ProfessorNicknames({
    professorId,
    professorName,
    isAuthenticated,
    className
}: ProfessorNicknamesProps) {
    const supabase = createClient();
    const [nicknames, setNicknames] = useState<Nickname[]>([]);
    const [userNicknames, setUserNicknames] = useState<Nickname[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newNickname, setNewNickname] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        loadNicknames();
    }, [professorId]);

    const loadNicknames = async () => {
        setIsLoading(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            // Fetch approved nicknames (visible to everyone)
            const { data: approved } = await supabase
                .from('professor_nicknames')
                .select('*')
                .eq('professor_id', professorId)
                .eq('status', 'approved')
                .order('created_at', { ascending: true });

            setNicknames(approved || []);

            // Fetch user's own submissions (pending/rejected)
            if (user) {
                const { data: userSubmissions } = await supabase
                    .from('professor_nicknames')
                    .select('*')
                    .eq('professor_id', professorId)
                    .eq('submitted_by', user.id)
                    .eq('status', 'pending');

                setUserNicknames(userSubmissions || []);
            }
        } catch (error) {
            console.error('Error loading nicknames:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess(false);

        const cleanNickname = sanitizeNickname(newNickname);

        if (!cleanNickname || cleanNickname.length < 2) {
            setSubmitError('Nickname must be at least 2 characters');
            return;
        }

        if (cleanNickname.length > 50) {
            setSubmitError('Nickname must be 50 characters or less');
            return;
        }

        // Check if nickname already exists
        const existingNicknames = [...nicknames, ...userNicknames].map(n => n.nickname.toLowerCase());
        if (existingNicknames.includes(cleanNickname.toLowerCase())) {
            setSubmitError('This nickname has already been suggested');
            return;
        }

        setIsSubmitting(true);

        try {
            // Note: Auth check is also done on server, but client check provides better UX
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSubmitError('You must be logged in to suggest nicknames');
                return;
            }

            // Create FormData for server action
            const formData = new FormData();
            formData.append('professorId', professorId);
            formData.append('nickname', cleanNickname);

            // Call Server Action
            const result = await submitNickname(formData);

            if (result.error) {
                setSubmitError(result.error);
                return;
            }

            setSubmitSuccess(true);
            setNewNickname('');

            // Refresh nicknames
            await loadNicknames();

            // Close modal after a delay
            setTimeout(() => {
                setShowModal(false);
                setSubmitSuccess(false);
            }, 2000);

        } catch (error) {
            setSubmitError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <Check className="w-3 h-3 text-green-600" />;
            case 'pending':
                return <Clock className="w-3 h-3 text-yellow-600" />;
            case 'rejected':
                return <X className="w-3 h-3 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'pending':
                return 'Awaiting moderation';
            case 'rejected':
                return 'Not approved';
            default:
                return status;
        }
    };

    // Combine and dedupe all nicknames for display
    const allNicknames = [
        ...nicknames,
        ...userNicknames.filter(un => !nicknames.some(n => n.id === un.id))
    ];

    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading nicknames...</span>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className={cn("space-y-3", className)}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Also known as
                        </span>
                    </div>
                    {isAuthenticated && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowModal(true)}
                            className="h-7 text-xs gap-1 text-primary hover:text-primary"
                        >
                            <Plus className="w-3 h-3" />
                            Suggest
                        </Button>
                    )}
                </div>

                {/* Nicknames Display */}
                <div className="flex flex-wrap gap-2">
                    {allNicknames.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            No nicknames yet. {isAuthenticated ? 'Be the first to suggest one!' : 'Sign in to suggest one.'}
                        </p>
                    ) : (
                        allNicknames.map((nickname) => (
                            <Tooltip key={nickname.id}>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant={nickname.status === 'approved' ? 'secondary' : 'outline'}
                                        className={cn(
                                            "text-sm font-normal transition-all cursor-help",
                                            nickname.status === 'approved' && "bg-primary/10 text-primary hover:bg-primary/20",
                                            nickname.status === 'pending' && "border-yellow-400/50 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                                        )}
                                    >
                                        {nickname.status !== 'approved' && (
                                            <span className="mr-1">{getStatusIcon(nickname.status)}</span>
                                        )}
                                        {nickname.nickname}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    {nickname.submitted_by === currentUserId && (
                                        <span className="font-medium">Your suggestion • </span>
                                    )}
                                    {getStatusLabel(nickname.status)}
                                </TooltipContent>
                            </Tooltip>
                        ))
                    )}
                </div>

                {/* Suggest Nickname Modal */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary" />
                                Suggest a Nickname
                            </DialogTitle>
                            <DialogDescription>
                                Help others find <span className="font-medium">{professorName}</span> by suggesting common nicknames or aliases students use.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="e.g., Doc John, Sir JD, Prof. D"
                                    value={newNickname}
                                    onChange={(e) => setNewNickname(e.target.value)}
                                    maxLength={50}
                                    disabled={isSubmitting || submitSuccess}
                                    className="text-base"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {newNickname.length}/50 characters • Your suggestion will be reviewed by moderators
                                </p>
                            </div>

                            {submitError && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-md">
                                    <X className="w-4 h-4" />
                                    {submitError}
                                </div>
                            )}

                            {submitSuccess && (
                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 px-3 py-2 rounded-md">
                                    <Check className="w-4 h-4" />
                                    Nickname submitted! A moderator will review it soon.
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || submitSuccess || !newNickname.trim()}
                                    className="min-w-[100px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : submitSuccess ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Submitted!
                                        </>
                                    ) : (
                                        'Submit'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
