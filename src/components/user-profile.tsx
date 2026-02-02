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

import { getAvatarColor } from '@/lib/avatar-utils';
import { cn } from '@/lib/utils';

export default function UserProfile() {
    const supabase = createClient()
    const router = useRouter()
    const [isModerator, setIsModerator] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [nickname, setNickname] = useState('')

    useEffect(() => {
        const checkUserStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                console.log("UserProfile fetch:", { user, data });
                setIsModerator(data?.role === 'moderator')
                setDisplayName(data?.nickname || data?.name || 'User')
                setNickname(data?.nickname || 'User')
            }
        }
        checkUserStatus()
    }, [supabase])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-0 hover:bg-transparent">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform hover:scale-105",
                        getAvatarColor(nickname)
                    )}>
                        {nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline-block max-w-[100px] truncate text-sm font-medium">
                        {displayName}
                    </span>
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