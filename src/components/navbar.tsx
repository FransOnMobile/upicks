import Link from 'next/link'
import { createClient } from "@/utils/supabase/server"
import { Button } from './ui/button'
import UserProfile from './user-profile'
import { NotificationBell } from './notifications/notification-bell'
import { Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu'


export default async function Navbar() {
  const supabase = createClient()

  const { data: { user } } = await (await supabase).auth.getUser()

  const navLinks = [
    { href: "/rate", label: "Rate Professor" },
    { href: "/campuses", label: "Rate Campus" },
    { href: "/community", label: "Community" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 min-h-16 py-2 flex justify-between items-center gap-y-2">
        <div className="flex items-center gap-x-4 md:gap-x-6">
          <Link
            href="/"
            prefetch
            className="text-2xl font-bold text-primary font-playfair hover:opacity-80 transition-opacity border-r pr-4 md:pr-6"
          >
            UPicks
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {/* Mobile Dropdown Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="w-full cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {!user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/sign-in" className="w-full cursor-pointer">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sign-up" className="w-full cursor-pointer font-semibold text-primary">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserProfile />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-foreground/80 hover:text-primary">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="font-semibold">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
