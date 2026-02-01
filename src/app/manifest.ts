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
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
