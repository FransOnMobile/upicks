import fs from 'fs';
import path from 'path';

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
let url = '';
let key = '';

for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

async function run() {
    console.log("Fetching professor ratings...");
    const res = await fetch(`${url}/rest/v1/ratings?select=id,courses(code,name),rating_tag_associations(rating_tags(name)),users(nickname),user_id,rating_replies(count)&limit=5`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    
    const data = await res.json();
    console.log("Ratings Data:", data);
    
    console.log("Fetching campus ratings...");
    const res2 = await fetch(`${url}/rest/v1/campus_ratings?select=id,campus_rating_tag_associations(campus_tags(name)),users(nickname),user_id,campus_rating_replies(count)&limit=5`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const data2 = await res2.json();
    console.log("Campus Data:", data2);
}

run();
