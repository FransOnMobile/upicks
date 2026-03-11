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
    const res = await fetch(`${url}/rest/v1/ratings?select=id,users!user_id(nickname),user_id&limit=2`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    
    const data = await res.json();
    console.log("Ratings Data:", data);
}

run();
