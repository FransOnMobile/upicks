import Link from 'next/link'
import { createClient } from "@/utils/supabase/server"
import { Button } from './ui/button'
import UserProfile from './user-profile'


export default async function Navbar() {
  const supabase = createClient()

  const { data: { user } } = await (await supabase).auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            prefetch
            className="text-2xl font-bold text-primary font-playfair hover:opacity-80 transition-opacity"
          >
            UPicks
          </Link>
          <div className="hidden md:flex gap-6 border-l border-border pl-6">
            <Link
              href="/rate"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
            >
              Rate Professor
            </Link>
            <Link
              href="/campuses"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
            >
              Rate Campus
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
            >
              Community
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <UserProfile />
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
