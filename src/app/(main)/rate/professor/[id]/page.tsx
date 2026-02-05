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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Parallel Data Fetching
    const [profResult, ratingsResult, tagsResult, userVotesResult, userRatingsResult] = await Promise.all([
        supabase.from('professors').select('*, departments:department_id (name)').eq('id', id).single(),
        supabase.from('ratings')
            .select(`
                *,
                courses (code, name),
                rating_tag_associations (
                    rating_tags (name)
                ),
                users (nickname),
                user_id,
                rating_replies(count)
            `)
            .eq('professor_id', id)
            .order('created_at', { ascending: false }),
        supabase.from('rating_tags').select('*'),
        user ? supabase.from('rating_votes').select('rating_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from('ratings').select('course_id').eq('professor_id', id).eq('user_id', user.id) : Promise.resolve({ data: [] })
    ]);

    if (!profResult.data) {
        // Handle 404 or Error gracefully
        return <div className="min-h-screen flex items-center justify-center">Professor not found</div>;
    }

    const profData = profResult.data;
    const ratingsData = ratingsResult.data || [];
    const tagsData = tagsResult.data || [];
    const userVotes = userVotesResult.data ? userVotesResult.data.map((v: any) => v.rating_id) : [];
    const ratedCourseIds = userRatingsResult.data ? userRatingsResult.data.map((r: any) => r.course_id) : [];

    // --- Data Processing (Moved from Client to Server) ---
    const formattedReviews = ratingsData.map((r: any) => ({
        id: r.id,
        rating: r.overall_rating,
        reviewText: r.review_text || '',
        course: r.courses?.code || 'Unknown',
        tags: r.rating_tag_associations?.map((t: any) => t.rating_tags?.name).filter(Boolean) || [],
        helpful_count: r.helpful_count || 0,
        created_at: r.created_at,
        is_anonymous: r.is_anonymous,
        teaching_quality: r.teaching_quality,
        fairness: r.fairness,
        clarity: r.clarity,
        difficulty: r.difficulty,
        grade: r.grade_received,
        attendance: r.mandatory_attendance ? 'Mandatory' : 'Optional',
        would_take_again: r.would_take_again,
        nickname: r.users?.nickname || null,
        user_id: r.user_id,
        displayName: r.is_anonymous ? 'Anonymous Student' : (r.users?.nickname || 'Verified Student'),
        reply_count: r.rating_replies?.[0]?.count || 0,
        textbook_used: r.textbook_used
    }));

    // Calculate Aggregates
    const totalReviews = formattedReviews.length;
    const avgRating = totalReviews > 0
        ? formattedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
        : 0;
    const avgDifficulty = totalReviews > 0
        ? formattedReviews.reduce((sum: number, r: any) => sum + (r.difficulty || 0), 0) / totalReviews
        : 0;
    const avgTeaching = totalReviews > 0
        ? formattedReviews.reduce((sum: number, r: any) => sum + (r.teaching_quality || 0), 0) / totalReviews
        : 0;
    const avgFairness = totalReviews > 0
        ? formattedReviews.reduce((sum: number, r: any) => sum + (r.fairness || 0), 0) / totalReviews
        : 0;
    const avgClarity = totalReviews > 0
        ? formattedReviews.reduce((sum: number, r: any) => sum + (r.clarity || 0), 0) / totalReviews
        : 0;

    const wouldTakeAgainCount = formattedReviews.filter((r: any) => r.would_take_again).length;
    const wouldTakeAgainPercentage = totalReviews > 0
        ? Math.round((wouldTakeAgainCount / totalReviews) * 100)
        : 0;

    // Top Tags
    const tagCounts: Record<string, number> = {};
    formattedReviews.forEach((r: any) => {
        r.tags.forEach((t: string) => tagCounts[t] = (tagCounts[t] || 0) + 1);
    });
    const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

    // Subject Stats
    const subjectStatsMap: Record<string, { total: number, count: number }> = {};
    formattedReviews.forEach((r: any) => {
        const code = r.course || 'Unknown';
        if (!subjectStatsMap[code]) {
            subjectStatsMap[code] = { total: 0, count: 0 };
        }
        subjectStatsMap[code].total += r.rating;
        subjectStatsMap[code].count += 1;
    });
    const subjectStats = Object.entries(subjectStatsMap).map(([code, data]) => ({
        code,
        rating: data.total / data.count,
        count: data.count
    })).sort((a, b) => b.count - a.count);

    // Construct enriched professor object
    // @ts-ignore
    const enrichedProfessor = {
        ...profData,
        department: profData.departments?.name || 'Unknown', // Flatten department name for easier access
        departments: profData.departments,
        overallRating: avgRating,
        reviewCount: totalReviews,
        wouldTakeAgainPercentage,
        difficulty: avgDifficulty,
        teachingQuality: avgTeaching,
        fairness: avgFairness,
        clarity: avgClarity,
        topTags,
        subjectStats
    };

    return (
        <ProfessorDetailsClient
            professorId={id}
            initialData={{
                professor: enrichedProfessor,
                reviews: formattedReviews,
                userVotes,
                ratedCourseIds,
                availableTags: tagsData
            }}
        />
    );
}
