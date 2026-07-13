export default function JsonLd({
  name,
  title,
  description,
  url,
  image,
}: {
  name: string
  title: string
  description: string
  url?: string
  image?: string
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: title,
    description,
    url: url || undefined,
    image: image || undefined,
    knowsAbout: [
      'Software Engineering',
      'Full-Stack Development',
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
