'use client'
import { useEffect, useState } from 'react'
import { UserCircle, LayoutDashboard, Settings, Shield, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from './ui/dropdown-menu'
import { createClient } from "@/utils/supabase/client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserProfile() {
    const supabase = createClient()
    const router = useRouter()
    const [isModerator, setIsModerator] = useState(false)

    useEffect(() => {
        const checkModeratorStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                setIsModerator(data?.role === 'moderator')
            }
        }
        checkModeratorStatus()
    }, [supabase])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserCircle className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                {isModerator && (
                    <DropdownMenuItem asChild>
                        <Link href="/moderator" className="flex items-center gap-2 cursor-pointer text-destructive">
                            <Shield className="w-4 h-4" />
                            Mod Panel
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={async () => {
                        await supabase.auth.signOut()
                        router.refresh()
                    }}
                    className="flex items-center gap-2 cursor-pointer text-muted-foreground"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}