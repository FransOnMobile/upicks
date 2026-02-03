import Link from 'next/link'
import { createClient } from "@/utils/supabase/server"
import { Button } from './ui/button'
import UserProfile from './user-profile'
import { NotificationBell } from './notifications/notification-bell'


export default async function Navbar() {
  const supabase = createClient()

  const { data: { user } } = await (await supabase).auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 min-h-16 py-2 flex flex-wrap justify-between items-center gap-y-2">
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/"
            prefetch
            className="text-2xl font-bold text-primary font-playfair hover:opacity-80 transition-opacity border-r pr-6"
          >
            UPicks
          </Link>
          <div className="flex flex-wrap gap-x-3 gap-y-1 md:gap-6">
            <Link
              href="/rate"
              className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Rate Professor
            </Link>
            <Link
              href="/campuses"
              className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Rate Campus
            </Link>
            <Link
              href="/community"
              className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Community
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserProfile />
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
              >
                <Button variant="ghost" className="text-foreground/80 hover:text-primary">
                  Sign In
                </Button>
              </Link>
              <Link
                href="/sign-up"
              >
                <Button className="font-semibold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
