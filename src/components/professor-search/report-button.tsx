'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportButtonProps {
    targetId: string;
    targetType: 'professor' | 'rating' | 'department';
    isAuthenticated: boolean;
    className?: string;
    iconOnly?: boolean;
}

export function ReportButton({ targetId, targetType, isAuthenticated, className, iconOnly }: ReportButtonProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert("You must be logged in to report.");
            return;
        }

        setIsSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase
            .from('reports')
            .insert({
                target_id: targetId,
                target_type: targetType,
                reason,
                details,
                reporter_id: user.id
            });

        setIsSubmitting(false);
        setOpen(false);

        if (error) {
            alert("Failed to report: " + error.message);
        } else {
            alert("Report submitted. A moderator will review it shortly.");
            setReason('');
            setDetails('');
        }
    };

    if (!isAuthenticated) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size={iconOnly ? "icon" : "default"} className={`text-muted-foreground hover:text-destructive ${className}`}>
                    <Flag className="w-4 h-4 mr-2" />
                    {!iconOnly && "Report"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report {targetType}</DialogTitle>
                    <DialogDescription>
                        Help us keep the community safe and accurate.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Select value={reason} onValueChange={setReason} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="incorrect_info">Incorrect Information</SelectItem>
                                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                                <SelectItem value="duplicate">Duplicate Entry</SelectItem>
                                <SelectItem value="fake">Fake/Spam</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Details (Optional)</Label>
                        <Textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Provide more context..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting || !reason} variant="destructive">
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
