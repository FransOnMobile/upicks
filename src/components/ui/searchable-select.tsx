"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList, // Import CommandList to properly wrap items
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverAnchor,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface SearchableSelectProps {
    items: { value: string; label: string }[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    emptyLabel?: React.ReactNode;
    className?: string;
}

export function SearchableSelect({
    items,
    value,
    onSelect,
    placeholder = "Search...",
    emptyLabel = "No item found.",
    className
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    // Use a ref to control width, but PopoverAnchor handles positioning
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Update input text when value changes
    React.useEffect(() => {
        if (value) {
            const item = items.find(i => i.value === value);
            if (item) setInputValue(item.label);
        }
    }, [value, items]);

    // Manual filtering for strict search results
    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {/* Anchor the popover to this container */}
            <PopoverAnchor asChild>
                <div
                    ref={containerRef}
                    className={cn(
                        "relative flex items-center w-full rounded-md border border-input bg-background shadow-sm focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
                        className
                    )}
                >
                    {/* Input Area */}
                    <Input
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => {
                            setOpen(true);
                        }}
                        // Remove borders from input itself, let container handle it
                        className="flex-1 border-none shadow-none focus-visible:ring-0 px-3 h-9 bg-transparent"
                    />

                    {/* Clear Button */}
                    {value && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-transparent text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect('');
                                setInputValue('');
                                setOpen(false);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Custom Trigger Button */}
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-l-none hover:bg-transparent"
                            onClick={() => setOpen(!open)}
                        >
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                </div>
            </PopoverAnchor>

            <PopoverContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="p-0"
                align="start"
                // Strict alignment and collision handling
                side="bottom"
                sideOffset={4}
                // Match width to container
                style={{ width: containerRef.current?.offsetWidth }}
                // Allow pointer events for scrolling
                onPointerDownOutside={(e) => {
                    // Only close if clicking outside, not when scrolling
                    const target = e.target as HTMLElement;
                    if (target.closest('[cmdk-list]')) {
                        e.preventDefault();
                    }
                }}
            >
                <Command shouldFilter={false}>
                    {/* Hiding command input as we drive it externally */}
                    <div className="hidden">
                        <CommandInput value={inputValue} onValueChange={setInputValue} />
                    </div>

                    <div
                        className="max-h-[200px] overflow-y-auto overscroll-contain"
                        onWheel={(e) => {
                            // Stop wheel events from propagating to parent
                            e.stopPropagation();
                        }}
                        onTouchMove={(e) => {
                            // Stop touch scroll from propagating
                            e.stopPropagation();
                        }}
                    >
                        <CommandList>
                            {filteredItems.length === 0 && (
                                <CommandEmpty>{emptyLabel}</CommandEmpty>
                            )}

                            <CommandGroup>
                                {filteredItems.slice(0, 50).map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.label}
                                        onSelect={() => {
                                            onSelect(item.value);
                                            setInputValue(item.label);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
