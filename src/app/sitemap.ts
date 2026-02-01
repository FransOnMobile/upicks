import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://upicks.vercel.app';
  
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

    return [...routes, ...professorRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    return routes;
  }
}
