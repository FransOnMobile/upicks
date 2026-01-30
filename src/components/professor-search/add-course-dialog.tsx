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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';

interface AddCourseDialogProps {
    onAdd: (name: string, code: string) => Promise<void>;
    trigger?: React.ReactNode;
}

export function AddCourseDialog({ onAdd, trigger }: AddCourseDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !code) return;

        setIsLoading(true);
        await onAdd(name, code);
        setIsLoading(false);
        setOpen(false);
        setName('');
        setCode('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Course
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl bg-card/95 backdrop-blur-md border-primary/10 shadow-custom-hover">
                <DialogHeader>
                    <DialogTitle className="font-playfair text-2xl tracking-tight">Add New Course</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Missing a course from the dropdown? Add it here.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="course-code" className="text-sm font-medium">Course Code</Label>
                        <Input
                            id="course-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g. CS 191"
                            className="rounded-lg bg-background/50 border-input/50 focus:ring-primary/20"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="course-name" className="text-sm font-medium">Course Title</Label>
                        <Input
                            id="course-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Software Engineering"
                            className="rounded-lg bg-background/50 border-input/50 focus:ring-primary/20"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full rounded-lg font-semibold bg-primary hover:bg-primary/90">
                            {isLoading ? "Submitting..." : "Submit for Review"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
