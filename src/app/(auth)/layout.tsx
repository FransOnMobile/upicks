import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <div className="absolute top-4 left-4 z-50">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 hover:bg-transparent hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Return to Home
                    </Button>
                </Link>
            </div>
            {children}
        </div>
    );
}
