import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Samir Anik | Creative Software Engineer & Full-Stack Developer',
    short_name: 'Samir Anik',
    description: 'Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07090e',
    theme_color: '#06b6d4',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}