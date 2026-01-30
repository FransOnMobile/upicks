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
          <Link href="/" prefetch className="text-2xl font-bold text-primary font-playfair">
            UPicks
          </Link>
          <div className="hidden md:flex gap-6 border-l border-border pl-6">
            <Link
              href="/rate"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Rate
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Community
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:block"
              >
                <Button variant="ghost" className="text-foreground/80 hover:text-primary">
                  Dashboard
                </Button>
              </Link>
              {user.user_metadata?.role === 'moderator' || (await (await supabase).from('users').select('role').eq('id', user.id).single()).data?.role === 'moderator' ? (
                <Link href="/moderator" className="hidden sm:block">
                  <Button variant="ghost" className="text-foreground/80 hover:text-destructive">
                    Mod Panel
                  </Button>
                </Link>
              ) : null}
              <UserProfile />
            </>
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
