import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#7b1113',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://upicks.cc'),
  title: {
    default: "UPicks - Rate Your UP Professors",
    template: "%s | UPicks"
  },
  description: "The anonymous, student-driven professor rating platform for the UP community. Find the best mentors and share your campus experiences.",
  keywords: ["UPicks", "upicks", "u picks", "UPicks.cc", "rate", "profs", "ratemyprof", "rate up professors", "UP", "University of the Philippines", "professor rating", "rate up profs", "rate up prof", "rating university of the philippines professors", "up prof reviews", "campus review", "student community", "UP Diliman", "UP Los Baños", "UP Manila", "Rate My Professor UP"],
  authors: [{ name: "UPicks Team" }],
  creator: "UPicks Team",
  publisher: "UPicks",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "UPicks - Rate Your UP Professors",
    description: "The anonymous, student-driven professor rating platform for the UP community.",
    type: "website",
    locale: "en_PH",
    siteName: "UPicks",
    url: "https://upicks.cc",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UPicks - Rate Your UP Professors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UPicks - Rate Your UP Professors",
    description: "The anonymous, student-driven professor rating platform for the UP community.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "UPicks",
              alternateName: ["upicks", "UPicks.cc", "u picks"],
              url: "https://upicks.cc/",
            }),
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3086021868950910"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
