import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { fetchBlogPosts, fetchProfile } from '@/lib/api'
import { Clock, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ScrollToTop from '@/components/ScrollToTop'
import { blurDataURL } from '@/lib/images'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await fetchProfile()
    return {
      title: `Blog & Articles | ${profile.name}`,
      description: 'Thoughts, tutorials, and insights on software engineering and web development.',
      openGraph: {
        title: `Blog & Articles | ${profile.name}`,
        description: 'Thoughts, tutorials, and insights on software engineering and web development.',
      },
    }
  } catch {
    return {
      title: 'Blog & Articles | Samir Anik',
      description: 'Thoughts, tutorials, and insights on software engineering and web development.',
    }
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, Number(pageParam) || 1)
  const perPage = 6
  const [allPosts, profile] = await Promise.all([
    fetchBlogPosts().catch(() => []),
    fetchProfile().catch(() => null),
  ])
  const logoText = profile ? profile.name.replace(/\s+/g, '') : 'MDTASVEALSAMIR'

  const totalPages = Math.max(1, Math.ceil(allPosts.length / perPage))
  const start = (currentPage - 1) * perPage
  const posts = allPosts.slice(start, start + perPage)

  if (posts.length === 0) {
    return (
      <>
        <Navbar logoText={logoText} />
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          No articles yet.
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar logoText={logoText} />
      <main className="min-h-screen pt-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-12">
            <span className="font-mono text-sm text-cyan-400 tracking-wider">09. Articles</span>
            <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
              Blog & Articles{' '}
              <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Thoughts, tutorials, and insights on software engineering and web development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-glass-bg border border-white/5 rounded-xl overflow-hidden hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200"
                aria-label={`Read article: ${post.title}`}
              >
                {post.cover_image && (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 rounded-full">
                      {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {post.read_time && (
                      <span className="font-mono text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.read_time}
                      </span>
                    )}
                  </div>
                  <h2 className="font-heading font-bold text-lg text-white group-hover:text-cyan-400 transition-colors duration-200">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-4 text-cyan-400 text-xs font-semibold group-hover:gap-3 transition-all duration-200">
                    Read More <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 mt-12" aria-label="Pagination">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="px-4 py-2 text-sm text-gray-400 border border-white/5 rounded-lg hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
                  aria-label="Previous page"
                >
                  ← Prev
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog?page=${p}`}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    p === currentPage
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500'
                      : 'text-gray-400 border border-white/5 hover:text-cyan-400 hover:border-cyan-400/30'
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="px-4 py-2 text-sm text-gray-400 border border-white/5 rounded-lg hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
                  aria-label="Next page"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
      <ScrollToTop />
    </>
  )
}
