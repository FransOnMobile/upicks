import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'University Campuses | UPicks',
    description: 'Explore UP campuses across the Philippines. Find detailed information and ratings for each campus.',
};

export default function CampusesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
