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

interface AddDepartmentDialogProps {
    onAdd: (name: string, code: string) => Promise<void>;
    trigger?: React.ReactNode;
}

export function AddDepartmentDialog({ onAdd, trigger }: AddDepartmentDialogProps) {
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
                        Add Department
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl bg-card/95 backdrop-blur-md border-primary/10 shadow-custom-hover">
                <DialogHeader>
                    <DialogTitle className="font-playfair text-2xl tracking-tight">Add New Department</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Can't find your department? Add it here.
                        It will be reviewed by our moderators.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="dept-name" className="text-sm font-medium">Department Name</Label>
                        <Input
                            id="dept-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Department of Computer Science"
                            className="rounded-lg bg-background/50 border-input/50 focus:ring-primary/20"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dept-code" className="text-sm font-medium">Department Code</Label>
                        <Input
                            id="dept-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g. DCS, CS"
                            className="rounded-lg bg-background/50 border-input/50 focus:ring-primary/20"
                            required
                        />
                        <p className="text-xs text-muted-foreground">Short abbreviation for the department.</p>
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
