'use client';

import { useState } from 'react';
import { Info, UserPlus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export function TipsTrigger() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:bg-white/20 group-hover:scale-110 transition-all shadow-lg">
                        <Info className="w-5 h-5" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold font-playfair text-[#7b1113]">
                        <UserPlus className="w-6 h-6" />
                        Adding a Professor
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        To maintain the quality and accuracy of our database, adding new professors is a moderated process.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 p-4 rounded-xl space-y-3 border border-border/50">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#7b1113] text-white flex items-center justify-center text-xs">1</span>
                            Search First
                        </h4>
                        <p className="text-sm text-muted-foreground ml-8">
                            Always check if the professor already exists. Try searching by their last name or college code.
                        </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-xl space-y-3 border border-border/50">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#fbbf24] text-black flex items-center justify-center text-xs">2</span>
                            Request Addition
                        </h4>
                        <p className="text-sm text-muted-foreground ml-8">
                            If you still can't find them, you will see an "Add Professor" option at the bottom of the search results when no matches are found.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
                        Got it, thanks!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
