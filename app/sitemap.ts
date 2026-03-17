import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://plug-map.com',
      lastModified: new Date(),
    },
    {
      url: 'https://plug-map.com/results',
      lastModified: new Date(),
    },
    {
      url: 'https://plug-map.com/submit',
      lastModified: new Date(),
    },
  ]
}