import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/10 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Explore Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/rate" className="text-muted-foreground hover:text-[#7b1113] transition-colors">Find Professors</Link></li>
              <li><Link href="/campuses" className="text-muted-foreground hover:text-[#7b1113] transition-colors">Rate Campuses</Link></li>
              <li><Link href="/community" className="text-muted-foreground hover:text-[#7b1113] transition-colors">Community</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-[#7b1113] transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-[#7b1113] transition-colors">About UPicks</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-[#7b1113] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-[#7b1113] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-[#7b1113] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Campuses Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">UP System</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>UP Diliman</li>
              <li>UP Los Baños</li>
              <li>UP Manila</li>
              <li>UP Visayas</li>
              <li>UP Mindanao</li>
              <li>+ 3 more</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <GraduationCap className="w-5 h-5 text-[#7b1113]" />
            <span className="font-playfair font-bold text-lg text-foreground">UPicks</span>
            <span className="text-muted-foreground ml-4">
              © {currentYear} UPicks. Built with ❤️ for the UP Community.
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            Not affiliated with the University of the Philippines.
          </div>
        </div>
      </div>
    </footer>
  );
}
