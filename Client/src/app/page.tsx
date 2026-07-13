import React, { Suspense } from 'react'
import Image from 'next/image'
import {
  fetchProfile,
  fetchProjects,
  fetchSkills,
  fetchExperience,
  fetchEducation,
  fetchCertifications,
  fetchGallery,
} from '@/lib/api'
import type { Education, Certification, GalleryItem } from '@/lib/api'
import Navbar from '@/components/Navbar'
import Typewriter from '@/components/Typewriter'
import ProjectsGrid from '@/components/ProjectsGrid'
import ContactForm from '@/components/ContactForm'
import Card3DTilt from '@/components/Card3DTilt'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  ArrowRight,
  Mail,
  MapPin,
  Cpu,
  TrendingUp,
  Smartphone,
  Award,
  Layers,
  Briefcase,
  Code,
  Palette,
  Wrench,
  Database,
} from 'lucide-react'
import AnimatedSection from '@/components/AnimatedSection'
import ScrollToTop from '@/components/ScrollToTop'
import SkillBar from '@/components/SkillBar'
import CertificationsGrid from '@/components/CertificationsGrid'
import GalleryGrid from '@/components/GalleryGrid'
import { SkeletonBlock, SkeletonLine, SkeletonCard } from '@/components/Skeleton'
import { blurDataURL } from '@/lib/images'

export const revalidate = 3600

function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
          <SkeletonBlock className="w-36 h-36 md:w-44 md:h-44 rounded-full mx-auto lg:mx-0" />
          <SkeletonLine className="w-48 h-4 mx-auto lg:mx-0" />
          <SkeletonLine className="w-96 h-12 mx-auto lg:mx-0" />
          <SkeletonLine className="w-72 h-6 mx-auto lg:mx-0" />
          <SkeletonLine className="w-full h-4 max-w-xl mx-auto lg:mx-0" />
          <div className="flex gap-4 mt-4 justify-center lg:justify-start">
            <SkeletonBlock className="w-32 h-12 rounded-lg" />
            <SkeletonBlock className="w-32 h-12 rounded-lg" />
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center">
          <SkeletonBlock className="w-full max-w-md h-80 rounded-xl" />
        </div>
      </div>
    </section>
  )
}

function SkillsSkeleton() {
  return (
    <section id="skills" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <SkeletonLine className="w-32 h-4 mb-4" />
        <SkeletonLine className="w-64 h-8 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectsSkeleton() {
  return (
    <section id="projects" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <SkeletonLine className="w-32 h-4 mb-4" />
        <SkeletonLine className="w-64 h-8 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSkeleton() {
  return (
    <section id="experience" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <SkeletonLine className="w-32 h-4 mb-4" />
        <SkeletonLine className="w-64 h-8 mb-16" />
        <div className="flex flex-col gap-12 pl-10">
          {[...Array(2)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CertificationsSkeleton() {
  return (
    <section id="certifications" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <SkeletonLine className="w-32 h-4 mb-4" />
        <SkeletonLine className="w-64 h-8 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonBlock key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function GallerySkeleton() {
  return (
    <section id="gallery" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <SkeletonLine className="w-32 h-4 mb-4" />
        <SkeletonLine className="w-64 h-8 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonBlock key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function EducationSkeleton() {
  return (
    <section id="education" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <SkeletonLine className="w-32 h-4 mb-4" />
        <SkeletonLine className="w-64 h-8 mb-16" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            {[...Array(2)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </section>
  )
}

async function HeroSection({
  profile,
}: {
  profile: NonNullable<Awaited<ReturnType<typeof fetchProfile>>>
}) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-24 px-6 md:px-12 overflow-hidden"
    >
      <div className="absolute top-[15%] left-[10%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
          {profile.avatar && (
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-cyan-400/30 p-1 bg-[#0f121d] shadow-2xl shadow-cyan-500/10 mb-4 mx-auto lg:mx-0 relative group overflow-hidden shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-108 duration-300"
                  sizes="176px"
                  priority
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                />
              </div>
              <div className="absolute inset-0 rounded-full border border-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          )}

          <div className="font-mono text-sm md:text-base text-cyan-400 tracking-wider flex items-center justify-center lg:justify-start gap-2">
            <span className="text-cyan-400 font-bold">~</span> {profile.intro}
          </div>

          <h1 className="font-heading font-extrabold text-5xl md:text-7xl tracking-tight text-white leading-[1.05]">
            {profile.name}
          </h1>

          <Typewriter roles={profile.rolesList && profile.rolesList.length > 0 ? profile.rolesList : [profile.title]} />

          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
            {profile.description}
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              aria-label="View featured projects"
            >
              View Work <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 px-6 py-3 bg-transparent border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/5 text-white font-semibold rounded-lg backdrop-blur-md transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              aria-label="Get in touch"
            >
              Let&apos;s Talk
            </a>
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-transparent border border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400 font-semibold rounded-lg backdrop-blur-md transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                aria-label="Download resume"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Resume
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <Card3DTilt className="w-full max-w-md h-80">
            <div className="info-card-glow" />
            <div className="h-full bg-glass-bg border border-white/5 rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-[#0f121d]/90 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs text-gray-500 ml-auto">developer.json</span>
              </div>
              <div className="p-6 font-mono text-xs md:text-sm text-gray-300 leading-relaxed overflow-auto flex-grow bg-slate-950/20">
                <pre className="text-xs md:text-sm whitespace-pre">
                  {`{`}
                  {'\n'} <span className="text-pink-500">{'"name"'}</span>:{' '}
                  <span className="text-cyan-400">
                    {'"'}
                    {profile.name}
                    {'"'}
                  </span>
                  ,{'\n'} <span className="text-pink-500">{'"role"'}</span>:{' '}
                  <span className="text-cyan-400">
                    {'"'}
                    {profile.title}
                    {'"'}
                  </span>
                  ,{'\n'} <span className="text-pink-500">{'"skills"'}</span>: [
                  {profile.techList.slice(0, 4).map((tech, idx, arr) => (
                    <React.Fragment key={tech}>
                      {'\n'}   <span className="text-cyan-400">{'"'}{tech}{'"'}</span>
                      {idx < arr.length - 1 ? ',' : ''}
                    </React.Fragment>
                  ))}
                  {'\n'}  ],{'\n'} <span className="text-pink-500">{'"passion"'}</span>:{' '}
                  <span className="text-cyan-400">
                    {'"'}
                    {profile.passion || 'Sleek UI Animations'}
                    {'"'}
                  </span>
                  ,{'\n'} <span className="text-pink-500">{'"location"'}</span>:{' '}
                  <span className="text-cyan-400">
                    {'"'}
                    {profile.location}
                    {'"'}
                  </span>
                  {'\n'}
                  {`}`}
                </pre>
              </div>
            </div>
          </Card3DTilt>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10">
        <span className="w-6 h-10 border-2 border-gray-500 rounded-full block relative">
          <span className="w-1 h-2 bg-cyan-400 rounded-full absolute top-2 left-1/2 -translate-x-1/2 animate-scroll-mouse" />
        </span>
      </div>
    </section>
  )
}

async function AboutSection({
  profile,
}: {
  profile: NonNullable<Awaited<ReturnType<typeof fetchProfile>>>
}) {
  return (
    <section id="about" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-mono text-sm text-cyan-400 tracking-wider">01. Background</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
            About Me{' '}
            <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
        </div>

        <AnimatedSection
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
        >
          <div className="flex flex-col gap-6 text-gray-400 text-base leading-relaxed">
            {profile.bioParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}

            <p className="text-gray-300">
              Here are a few technologies I have been working with recently:
            </p>
            <ul className="grid grid-cols-2 gap-3 font-mono text-xs text-cyan-400">
              {profile.techList.map((tech) => (
                <li key={tech} className="flex items-center gap-2">
                  <span className="text-cyan-400 text-[10px]">▶</span> {tech}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <Card3DTilt>
              <div className="info-card-glow" />
              <div className="bg-glass-bg border border-white/5 rounded-xl p-6 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-colors duration-200 flex gap-4">
                <div className="text-cyan-400 p-2 bg-cyan-400/5 border border-cyan-400/10 rounded-lg h-fit">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white mb-2">Clean Coding</h3>
                  <p className="text-sm text-gray-400">
                    Writing modular, maintainable code focusing on optimization and design patterns.
                  </p>
                </div>
              </div>
            </Card3DTilt>

            <Card3DTilt>
              <div className="info-card-glow" />
              <div className="bg-glass-bg border border-white/5 rounded-xl p-6 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-colors duration-200 flex gap-4">
                <div className="text-cyan-400 p-2 bg-cyan-400/5 border border-cyan-400/10 rounded-lg h-fit">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white mb-2">
                    High Performance
                  </h3>
                  <p className="text-sm text-gray-400">
                    Optimizing loading assets achieving close to 100 on PageSpeed audits.
                  </p>
                </div>
              </div>
            </Card3DTilt>

            <Card3DTilt>
              <div className="info-card-glow" />
              <div className="bg-glass-bg border border-white/5 rounded-xl p-6 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-colors duration-200 flex gap-4">
                <div className="text-cyan-400 p-2 bg-cyan-400/5 border border-cyan-400/10 rounded-lg h-fit">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white mb-2">Pixel Perfect</h3>
                  <p className="text-sm text-gray-400">
                    Building fully responsive layouts matching pixel designs precisely.
                  </p>
                </div>
              </div>
            </Card3DTilt>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

function skillCategoryIcon(cat: string) {
  const l = cat.toLowerCase()
  if (l.includes('language')) return 'Code'
  if (l.includes('framework') || l.includes('library')) return 'Database'
  if (l.includes('tool')) return 'Wrench'
  if (l.includes('design') || l.includes('documentation')) return 'Palette'
  return 'Layers'
}

async function SkillsSection() {
  const skills = await fetchSkills().catch(() => [])
  return (
    <section id="skills" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-mono text-sm text-cyan-400 tracking-wider">02. Stack</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
            Technical Expertise{' '}
            <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
        </div>

        <AnimatedSection
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {skills.map((cat) => (
            <div
              key={cat.category}
              className="bg-glass-bg border border-white/5 rounded-xl p-6 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/5">
                <Layers className="w-6 h-6 text-purple-400" />
                <h3 className="font-heading font-bold text-lg text-white">{cat.category}</h3>
              </div>
              <div className="flex flex-col gap-5">
                {cat.items.map((item) => (
                  <SkillBar key={item.name} name={item.name} value={item.value} icon={item.icon} />
                ))}
              </div>
            </div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}

async function ProjectsSection() {
  const projects = await fetchProjects().catch(() => [])
  return (
    <section id="projects" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-mono text-sm text-cyan-400 tracking-wider">03. Portfolios</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
            Featured Projects{' '}
            <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
        </div>

        <AnimatedSection
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <ProjectsGrid projects={projects} />
        </AnimatedSection>
      </div>
    </section>
  )
}

async function ExperienceSection() {
  const experiences = await fetchExperience().catch(() => [])
  return (
    <section id="experience" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 mb-16">
          <span className="font-mono text-sm text-cyan-400 tracking-wider">04. Journey</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
            My Experience{' '}
            <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
        </div>

        <AnimatedSection
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative pl-10 border-l border-white/10 flex flex-col gap-12"
        >
          {experiences.map((exp) => (
            <div key={exp.company + exp.date} className="relative group">
              <div className="absolute -left-[49px] top-1.5 w-[18px] h-[18px] rounded-full bg-[#07090e] border-[3px] border-cyan-400 shadow-md shadow-cyan-400/50 group-hover:border-pink-500 group-hover:shadow-pink-500/50 transition-all duration-200" />

              <span className="font-mono text-xs text-cyan-400 tracking-wider block mb-2">
                {exp.date}
              </span>
              <div className="bg-glass-bg border border-white/5 rounded-xl p-6 group-hover:border-white/10 group-hover:shadow-lg group-hover:shadow-purple-500/5 transition-colors duration-200">
                <h3 className="font-heading font-bold text-xl text-white flex flex-wrap gap-2 items-center">
                  {exp.title}
                </h3>
                <h4 className="font-heading font-semibold text-purple-400 text-sm mt-1">
                  {exp.company}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed mt-4">{exp.desc}</p>
              </div>
            </div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}

async function EducationSection() {
  const education = await fetchEducation().catch(() => [] as Education[])
  if (education.length === 0) return null

  // Group awards by category (title)
  const awards = education.filter((e) => e.type === 'award')
  const groupedAwards: { [title: string]: typeof awards } = {}
  awards.forEach((item) => {
    if (!groupedAwards[item.title]) {
      groupedAwards[item.title] = []
    }
    groupedAwards[item.title].push(item)
  })

  return (
    <section id="education" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 mb-16">
          <span className="font-mono text-sm text-cyan-400 tracking-wider">05. Academy</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
            Education & Credentials{' '}
            <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
        </div>

        <AnimatedSection
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-cyan-400" /> Education History
            </h3>

            <div className="flex flex-col gap-6">
              {education
                .filter((e) => e.type === 'education')
                .map((e) => (
                  <div
                    key={e.id}
                    className="bg-glass-bg border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-heading font-bold text-lg text-white">{e.title}</h4>
                        <p className="text-cyan-400 text-sm mt-0.5">{e.subtitle}</p>
                      </div>
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-2.5 py-0.5 rounded-full shrink-0">
                        {e.date}
                      </span>
                    </div>
                    {e.details && (
                      <ul className="list-disc list-inside mt-3 text-gray-400 text-xs flex flex-col gap-1.5">
                        {e.details.split('\n').map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-purple-400" /> Honors & Awards
              </h3>
              <div className="bg-glass-bg border border-white/5 rounded-xl p-5 flex flex-col gap-6">
                {Object.entries(groupedAwards).map(([title, items]) => (
                  <div key={title} className="flex gap-3 items-start">
                    <span className="text-cyan-400 text-sm mt-0.5">🏆</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1.5">{title}</h4>
                      <div className="flex flex-col gap-2 pl-3 border-l border-white/5">
                        {items.map((item) => (
                          <div key={item.id} className="text-xs">
                            <p className="text-gray-300 leading-relaxed">
                              {item.subtitle}
                              {item.date && (
                                <span className="text-cyan-400 font-mono text-[9px] ml-2 bg-cyan-400/5 border border-cyan-400/10 px-1.5 py-0.5 rounded-md">
                                  {item.date}
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-pink-500" /> Activities & Leadership
              </h3>
              <div className="bg-glass-bg border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                {education
                  .filter((e) => e.type === 'activity')
                  .map((e) => (
                    <div key={e.id}>
                      {e.date && <h4 className="text-xs font-mono text-cyan-400">{e.date}</h4>}
                      <p className="text-sm font-bold text-white mt-0.5">{e.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

async function CertificationsSection() {
  const certifications = await fetchCertifications().catch(() => [] as Certification[])
  if (certifications.length === 0) return null
  return (
    <section id="certifications" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-mono text-sm text-cyan-400 tracking-wider">06. Credentials</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
            Certifications & Awards{' '}
            <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
        </div>
        <CertificationsGrid certifications={certifications} />
      </div>
    </section>
  )
}

async function GallerySection() {
  const items = await fetchGallery().catch(() => [] as GalleryItem[])
  if (items.length === 0) return null
  return (
    <section id="gallery" className="py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-mono text-sm text-cyan-400 tracking-wider">07. Gallery</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
            Photo Gallery{' '}
            <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
          </h2>
        </div>
        <GalleryGrid items={items} />
      </div>
    </section>
  )
}

export default async function Home() {
  const profile = await fetchProfile().catch(() => null)

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        No profile data available.
      </div>
    )
  }

  const logoText = profile.name.replace(/\s+/g, '')

  return (
    <>
      <Navbar logoText={logoText} />
      <div id="main-content" />

      <Suspense fallback={<HeroSkeleton />}>
        <ErrorBoundary>
          <HeroSection profile={profile} />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={null}>
        <ErrorBoundary>
          <AboutSection profile={profile} />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<SkillsSkeleton />}>
        <ErrorBoundary>
          <SkillsSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<ProjectsSkeleton />}>
        <ErrorBoundary>
          <ProjectsSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<ExperienceSkeleton />}>
        <ErrorBoundary>
          <ExperienceSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<EducationSkeleton />}>
        <ErrorBoundary>
          <EducationSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<CertificationsSkeleton />}>
        <ErrorBoundary>
          <CertificationsSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<GallerySkeleton />}>
        <ErrorBoundary>
          <GallerySection />
        </ErrorBoundary>
      </Suspense>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-12">
            <span className="font-mono text-sm text-cyan-400 tracking-wider">08. Network</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
              Get In Touch{' '}
              <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6">
              <h3 className="font-heading font-bold text-2xl text-white">
                {' '}
                Let&apos;s build something amazing together!
              </h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                I am currently open to exciting new opportunities, collaborations, and contract
                work. Whether you have a project idea, a position to fill, or just want to say hi,
                feel free to drop me a message!
              </p>

              <div className="flex flex-col gap-4 mt-4 text-sm md:text-base">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-cyan-400/5 border border-cyan-400/10 rounded-lg flex items-center justify-center text-cyan-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-gray-500">Email</span>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-gray-300 hover:text-cyan-400 font-semibold transition-colors duration-200"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-cyan-400/5 border border-cyan-400/10 rounded-lg flex items-center justify-center text-cyan-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-gray-500">Location</span>
                    <span className="text-gray-300 font-semibold">{profile.location}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-2">
                  <span className="block font-mono text-[10px] text-gray-500 mb-3">Find Me On</span>
                  <div className="flex items-center gap-3">
                    {profile.github && profile.github !== '#' && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 bg-cyan-400/5 border border-cyan-400/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200"
                        aria-label="GitHub"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {profile.linkedin && profile.linkedin !== '#' && (
                      <a
                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 bg-cyan-400/5 border border-cyan-400/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                    {profile.twitter && profile.twitter !== '#' && (
                      <a
                        href={profile.twitter.startsWith('http') ? profile.twitter : `https://${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 bg-cyan-400/5 border border-cyan-400/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200"
                        aria-label="Twitter / X"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {profile.codepen && profile.codepen !== '#' && (
                      <a
                        href={profile.codepen.startsWith('http') ? profile.codepen : `https://${profile.codepen}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 bg-cyan-400/5 border border-cyan-400/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200"
                        aria-label="CodePen"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M3.5 8.91l7.5 5.18v4.47L1.5 13.23 3.5 8.91zm0 6.18l3.5 2.42v-3.07L3.5 15.09zm.53-7.05L12 3.32l7.97 4.72-3.87 2.56L12 7.43 8.84 10.6 4.03 8.04zM12 13.02l3.57-2.44L12 8.12 8.43 10.58 12 13.02zm-2 4.54l-3.5-2.42v3.07L10 17.56zM20.5 8.91l-2 4.32 2 4.32v-8.64zm0 6.18l-3.5 2.42v-3.07l3.5 2.42zM12 23.47l-9.5-5.63v-4.69l2 4.32v-1.81l7.5 5.18 7.5-5.18v1.81l2-4.32v4.69L12 23.47zM22.5 8.91v4.69l-2-4.32v1.81L12 10.42V5.73l7.97 4.72 2.53-1.54z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-glass-bg border border-white/5 rounded-xl p-8 shadow-xl">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 border-t border-white/5 bg-[#05060a]/50 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <p className="text-gray-400 text-sm">&copy; 2026 {profile.name}. All Rights Reserved.</p>
          <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
            Engineered with <span className="text-cyan-400">♥</span> using Next.js, Framer Motion,
            and Supabase.
          </p>
        </div>
      </footer>
      <ScrollToTop />
    </>
  )
}

