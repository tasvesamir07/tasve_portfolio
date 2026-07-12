import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://tasve-portfolio.vercel.app', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://tasve-portfolio.vercel.app/#about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://tasve-portfolio.vercel.app/#skills', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://tasve-portfolio.vercel.app/#projects', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://tasve-portfolio.vercel.app/#experience', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://tasve-portfolio.vercel.app/#contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
