import { Metadata } from 'next';
import CampusDetailsClient from './client-page';

interface Props {
    params: Promise<{ id: string }>;
}

const CAMPUS_NAMES: Record<string, string> = {
    "diliman": "UP Diliman",
    "los-banos": "UP Los Baños",
    "manila": "UP Manila",
    "visayas": "UP Visayas",
    "baguio": "UP Baguio",
    "cebu": "UP Cebu",
    "mindanao": "UP Mindanao",
    "ou": "UP Open University",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const name = CAMPUS_NAMES[id] || "Campus";

    return {
        title: `Rate ${name} | UPicks`,
        description: `Read reviews and ratings for ${name}. View stats on facilities, safety, student life, and more on UPicks.`,
    };
}

export default async function CampusDetailsPage({ params }: Props) {
    const { id } = await params;
    return <CampusDetailsClient campusId={id} />;
}
