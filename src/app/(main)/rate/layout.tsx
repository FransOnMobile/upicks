import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rate Professors | UPicks',
    description: 'Search and rate professors across the UP system. Find the best mentors for your academic journey.',
};

export default function RateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
