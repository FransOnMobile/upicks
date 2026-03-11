import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching professor ratings...");
    const { data: ratingsData, error } = await supabase
        .from('ratings')
        .select(`
            id,
            courses (code, name),
            rating_tag_associations (
                rating_tags (name)
            ),
            users!user_id (nickname),
            user_id,
            rating_replies(count)
        `)
        .limit(5);
        
    console.log("Ratings Data:", ratingsData ? ratingsData.length : null);
    console.log("Error:", error);
    
    console.log("Fetching campus ratings...");
    const { data: campusRatingsData, error: campusError } = await supabase
        .from('campus_ratings')
        .select(`
            id,
            campus_rating_tag_associations (
                campus_tags (name)
            ),
            users!user_id (nickname),
            user_id,
            campus_rating_replies(count)
        `)
        .limit(5);
        
    console.log("Campus Ratings Data:", campusRatingsData ? campusRatingsData.length : null);
    console.log("Campus Error:", campusError);
}

run();
