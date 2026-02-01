"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    items: { value: string; label: string }[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    emptyLabel?: string;
    className?: string;
}

export function Combobox({ items, value, onSelect, placeholder = "Select item...", emptyLabel = "No item found.", className }: {
    items: { value: string; label: string }[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    emptyLabel?: React.ReactNode;
    className?: string;
}) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                >
                    {value
                        ? items.find((item) => item.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search...`} />
                    <CommandEmpty>{emptyLabel}</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                        {items.map((item) => (
                            <CommandItem
                                key={item.value}
                                value={item.label}
                                onSelect={() => {
                                    onSelect(item.value);
                                    setOpen(false)
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
                </Command>
            </PopoverContent>
        </Popover>
    )
}
