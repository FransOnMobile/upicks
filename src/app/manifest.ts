import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UPicks - Rate UP Professors',
    short_name: 'UPicks',
    description: 'Anonymous professor ratings and reviews for the UP community',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7b1113', // UP Maroon
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
