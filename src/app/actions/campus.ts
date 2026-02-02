'use server';

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";

export async function submitCampusRating(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get IP for rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const ipHash = createHash('sha256').update(ip + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).digest('hex');

    const campusId = formData.campusId;

    // 1. Rate Limiting Check
    // If authenticated, check user_id. If anon, check IP hash.
    if (user) {
        const { data: existing } = await supabase
            .from('campus_ratings')
            .select('created_at')
            .eq('campus_id', campusId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existing) {
             const lastRated = new Date(existing.created_at).getTime();
             const msSince = Date.now() - lastRated;
             if (msSince < 24 * 60 * 60 * 1000) { // 24 hours
                 return { error: "You have already rated this campus recently." };
             }
        }
    } else {
        // Anon check via IP Hash
        const { data: existing } = await supabase
            .from('campus_ratings')
            .select('created_at')
            .eq('campus_id', campusId)
            .eq('ip_hash', ipHash)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existing) {
             const lastRated = new Date(existing.created_at).getTime();
             const msSince = Date.now() - lastRated;
             if (msSince < 12 * 60 * 60 * 1000) { // 12 hours for anon
                 return { error: "This network has already submitted a rating recently." };
             }
        }
    }

    // 2. Validate Data (Basic)
    if (formData.overallRating < 1 || formData.overallRating > 5) return { error: "Invalid rating" };
    if (formData.facilitiesRating < 1 || formData.facilitiesRating > 5) return { error: "Invalid facilities rating" };
    
    // 3. Insert Rating
    const { data: rating, error } = await supabase
        .from('campus_ratings')
        .insert({
             campus_id: campusId,
             user_id: user ? user.id : null,
             overall_rating: formData.overallRating,
             facilities_rating: formData.facilitiesRating,
             safety_rating: formData.safetyRating,
             location_rating: formData.locationRating,
             student_life_rating: formData.studentLifeRating,
             review_text: formData.reviewText,
             is_anonymous: user ? formData.isAnonymous : true,
             ip_hash: ipHash
        })
        .select()
        .single();

    if (error) {
        console.error("Insert Error:", error);
        return { error: "Failed to save rating." };
    }

    // 4. Insert Tags
    if (formData.selectedTags && formData.selectedTags.length > 0) {
        const tagInserts = formData.selectedTags.map((tagId: string) => ({
            rating_id: rating.id,
            tag_id: tagId
        }));
        await supabase.from('campus_rating_tag_associations').insert(tagInserts);
    }

    revalidatePath(`/rate/campus/${campusId}`);
    return { success: true };
}
