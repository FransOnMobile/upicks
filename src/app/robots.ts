import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/', '/auth/'],
    },
    sitemap: 'https://upicks.cc/sitemap.xml',
  }
}
