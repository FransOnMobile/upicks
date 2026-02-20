import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://upicks.cc';
  
  // Static routes
  const routes = [
    '',
    '/rate',
    '/campuses',
    '/community',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    const supabase = await createClient();
    
    // Fetch professors
    const { data: professors } = await supabase
      .from('professors')
      .select('id, updated_at')
      .limit(1000); // Reasonable limit for now

    const professorRoutes = (professors || []).map((prof) => ({
      url: `${baseUrl}/rate/professor/${prof.id}`,
      lastModified: new Date(prof.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Fetch campuses
    const { data: campuses } = await supabase
      .from('campuses')
      .select('id');

    const campusRoutes = (campuses || []).map((campus) => ({
      url: `${baseUrl}/rate/campus/${campus.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...routes, ...professorRoutes, ...campusRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    return routes;
  }
}
