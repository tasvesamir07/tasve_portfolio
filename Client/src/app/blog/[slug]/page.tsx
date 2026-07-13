import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { fetchBlogPost, fetchBlogPosts, fetchProfile } from '@/lib/api'
import { Clock, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ScrollToTop from '@/components/ScrollToTop'
import BlogContent from '@/components/BlogContent'
import ErrorBoundary from '@/components/ErrorBoundary'
import { blurDataURL } from '@/lib/images'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await fetchBlogPosts().catch(() => [])
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await fetchBlogPost(slug)
    if (!post) return {}
    return {
      title: `${post.title} | Samir Anik`,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        type: 'article',
        publishedTime: post.created_at,
        images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.title,
        images: post.cover_image ? [post.cover_image] : undefined,
      },
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, profile] = await Promise.all([
    fetchBlogPost(slug),
    fetchProfile().catch(() => null),
  ])
  const logoText = profile ? profile.name.replace(/\s+/g, '') : 'Blog'

  if (!post) {
    return (
      <>
        <Navbar logoText={logoText} />
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Article not found.
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar logoText={logoText} />
      <main className="min-h-screen pt-32 px-6 md:px-12">
        <article className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-200 mb-8"
            aria-label="Back to articles"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Articles
          </Link>

          {post.cover_image && (
            <div className="aspect-video relative rounded-xl overflow-hidden mb-8">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-xs text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-2.5 py-1 rounded-full">
              {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {post.read_time && (
              <span className="font-mono text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.read_time}
              </span>
            )}
          </div>

          <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white leading-tight mb-6">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-purple-400 bg-purple-400/5 border border-purple-400/10 px-2.5 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <ErrorBoundary>
            <BlogContent content={post.content} />
          </ErrorBoundary>
        </article>
      </main>
      <ScrollToTop />
    </>
  )
}
