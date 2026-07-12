import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Code } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { fetchProject } from '@/lib/api'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const project = await fetchProject(id).catch(() => null)
  if (!project) return {}
  return {
    title: `${project.title} | Samir Anik`,
    description: project.desc,
    openGraph: { title: project.title, description: project.desc },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await fetchProject(id).catch(() => null)
  if (!project) notFound()

  return (
    <div className="min-h-screen bg-[#07090e]">
      {/* Back navigation */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" /> back to projects
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-6 pb-24">
        {/* Hero image */}
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 bg-[#0f121d] border border-white/5">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Code className="w-16 h-16 text-gray-600" />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-[#07090e]/80 backdrop-blur border border-purple-500/30 text-purple-400 font-mono text-xs px-3 py-1.5 rounded-full">
            {project.tag || project.category.toUpperCase()}
          </div>
        </div>

        {/* Title & links */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white">
              {project.title}
            </h1>
            <p className="text-sm text-gray-500 font-mono mt-1 capitalize">{project.category}</p>
          </div>
          <div className="flex gap-4 shrink-0">
            {project.github && project.github !== '#' && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-gray-300 hover:text-white hover:border-white/10 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Source Code
              </a>
            )}
            {project.live && project.live !== '#' && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-10">
          <h2 className="font-heading font-bold text-lg text-white mb-3">About This Project</h2>
          <p className="text-gray-400 leading-relaxed">{project.desc}</p>
        </div>

        {/* Tech tags */}
        {project.tags.length > 0 && (
          <div className="mb-10">
            <h2 className="font-heading font-bold text-lg text-white mb-3">Technologies Used</h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-xs bg-white/5 border border-white/5 text-gray-300 px-3 py-1.5 rounded-lg"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Architecture Diagram */}
        {project.diagram_url && (
          <div>
            <h2 className="font-heading font-bold text-lg text-white mb-3">System Architecture</h2>
            <div className="bg-[#0f121d] border border-white/5 rounded-xl p-4 md:p-6">
              <Image
                src={project.diagram_url}
                alt={`${project.title} system architecture`}
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
