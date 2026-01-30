"use client"

import * as React from "react"
import { School, Check, ChevronsUpDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const campuses = [
    {
        value: "diliman",
        label: "UP Diliman",
    },
    {
        value: "mindanao",
        label: "UP Mindanao",
    },
]

export function CampusSwitcher() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentCampus = searchParams.get("campus") || ""
    const [value, setValue] = React.useState(currentCampus)

    // Update local state when URL params change
    React.useEffect(() => {
        setValue(currentCampus)
    }, [currentCampus])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[180px] justify-between border-border text-foreground hover:bg-muted/50"
                >
                    {value
                        ? campuses.find((campus) => campus.value === value)?.label
                        : "Select Campus..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0">
                <Command>
                    <CommandInput placeholder="Search campus..." />
                    <CommandList>
                        <CommandEmpty>No campus found.</CommandEmpty>
                        <CommandGroup>
                            {campuses.map((campus) => (
                                <CommandItem
                                    key={campus.value}
                                    value={campus.value}
                                    onSelect={(currentValue) => {
                                        const newValue = currentValue === value ? "" : currentValue
                                        setValue(newValue)
                                        setOpen(false)
                                        router.push(`/professors?campus=${newValue}`)
                                    }}
                                >
                                    <School className="mr-2 h-4 w-4" />
                                    {campus.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === campus.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
