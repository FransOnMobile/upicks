import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, School } from "lucide-react";

export default function Home() {
  const campuses = [
    {
      id: "diliman",
      name: "UP Diliman",
      location: "Quezon City",
      description: "The flagship campus offering a wide range of undergraduate and graduate programs.",
      color: "bg-[#7b1113]", // UP Maroon
    },
    {
      id: "mindanao",
      name: "UP Mindanao",
      location: "Davao",
      description: "Focusing on providing quality education in Mindanao.",
      color: "bg-[#7b1113]",
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-5xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-4">
          <Badge className="mb-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm py-1 px-4">
            Welcome to UPicks
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground font-playfair">
            Select Your <span className="text-primary italic">Campus</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find and rate professors across the University of the Philippines system. Choose your campus to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campuses.map((campus) => (
            <Link
              href={`/rate?campus=${campus.id}`}
              key={campus.id}
              className="group"
            >
              <div className="h-full bg-card border border-border rounded-xl p-6 shadow-custom hover:shadow-custom-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <School className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {campus.name}
                </h3>

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="w-3 h-3 mr-1" />
                  {campus.location}
                </div>

                <p className="text-sm text-foreground/60 mb-6 flex-1">
                  {campus.description}
                </p>

                <div className="w-full flex items-center justify-between text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  Enter Campus
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          Don't see your campus? <Link href="#" className="underline hover:text-primary">Request it here</Link>.
        </div>
      </div>
    </main>
  );
}

function Badge({ className, children, ...props }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
