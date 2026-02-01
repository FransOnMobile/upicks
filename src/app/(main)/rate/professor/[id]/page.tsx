import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import ProfessorDetailsClient from "./client-page";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: professor } = await supabase
        .from("professors")
        .select("name, departments:department_id(name)")
        .eq("id", id)
        .single();

    if (!professor) {
        return {
            title: "Professor Not Found | UPicks",
        };
    }

    // @ts-ignore - Supabase types join handling
    const deptName = professor.departments?.name || "Unknown Department";
    const title = `Rate Prof. ${professor.name} (${deptName}) | UPicks`;

    return {
        title,
        description: `Read anonymous student reviews for Professor ${professor.name} in ${deptName}. See ratings for teaching quality, difficulty, and more on UPicks.`,
        openGraph: {
            title,
            description: `Student reviews and ratings for Prof. ${professor.name}`,
        },
    };
}

export default async function ProfessorDetailsPage({ params }: Props) {
    const { id } = await params;
    return <ProfessorDetailsClient professorId={id} />;
}
