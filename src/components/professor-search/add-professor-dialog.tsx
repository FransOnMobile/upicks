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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { AddDepartmentDialog } from './add-department-dialog';
import { createClient } from "../../../supabase/client";

interface AddProfessorDialogProps {
    onAdd: (name: string, deptCode: string, courseCode: string) => Promise<void>;
    departments: Array<{ id: string; name: string; code: string }>;
    trigger?: React.ReactNode;
}

export function AddProfessorDialog({ onAdd, departments, trigger }: AddProfessorDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [deptCode, setDeptCode] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !deptCode || !courseCode) return;

        setIsLoading(true);
        await onAdd(name, deptCode, courseCode);
        setIsLoading(false);
        setOpen(false);
        setName('');
        setDeptCode('');
        setCourseCode('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button className="font-medium bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-all active:scale-95">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Professor
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl bg-card/95 backdrop-blur-md border-primary/10 shadow-custom-hover">
                <DialogHeader>
                    <DialogTitle className="font-playfair text-2xl tracking-tight">Add New Professor</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Can't find your professor? Add them to the list so you can rate them.
                        This will be reviewed by our moderators before appearing publicly.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">Professor Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Juan Dela Cruz"
                            className="rounded-lg bg-background/50 border-input/50 focus:ring-primary/20"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                        <Select value={deptCode} onValueChange={setDeptCode} required>
                            <SelectTrigger className="rounded-lg bg-background/50 border-input/50 focus:ring-primary/20">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] rounded-xl">
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.code}>
                                        {dept.name} ({dept.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end mt-1">
                            <AddDepartmentDialog
                                onAdd={async (name, code) => {
                                    const supabase = createClient();
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (!user) return;
                                    const { error } = await supabase.from('departments').insert({
                                        name,
                                        code,
                                        is_verified: false,
                                        submitted_by: user.id
                                    });
                                    if (error) {
                                        alert("Failed: " + error.message);
                                    } else {
                                        alert("Department submitted for review!");
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="course" className="text-sm font-medium">Course Taught</Label>
                        <Input
                            id="course"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            placeholder="e.g. CS 11, MATH 20"
                            className="rounded-lg bg-background/50 border-input/50 focus:ring-primary/20"
                            required
                        />
                        <p className="text-xs text-muted-foreground">To help us verify, please specify a course they taught.</p>
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
