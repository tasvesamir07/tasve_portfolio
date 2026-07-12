'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Code } from 'lucide-react';
import Card3DTilt from './Card3DTilt';
import { Project } from '@/lib/api';

interface Props {
  projects: Project[];
}

export default function ProjectsGrid({ projects }: Props) {
  const [filter, setFilter] = useState('all');

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(projects.map((p) => p.category.toLowerCase())))];

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter((p) => p.category.toLowerCase() === filter);

  return (
    <div>
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full font-semibold font-heading text-sm border transition-all duration-200 cursor-pointer ${
              filter === cat
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500 shadow-md shadow-cyan-500/10'
                : 'bg-glass-bg border-white/5 text-gray-400 hover:text-white hover:border-white/10'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Projects Cards Layout Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Card3DTilt className="h-full">
                <div className="project-card-glow" />
                <div className="h-full bg-glass-bg border border-white/5 rounded-xl p-6 flex flex-col gap-5 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-colors duration-200">
                  
                  {/* Card Header Placeholder / Image */}
                  <div className="relative h-44 bg-[#0f121d]/80 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                    {p.image ? (
                      <Image src={p.image} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    ) : (
                      <Code className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500" />
                    )}
                    <div className="absolute top-3 right-3 bg-[#07090e] border border-purple-500/30 text-purple-400 font-mono text-[10px] px-2.5 py-1 rounded">
                      {p.tag || p.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="flex flex-col gap-3 flex-grow">
                    <h3 className="font-heading font-bold text-xl text-white">{p.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                    
                    {/* Tech Badges */}
                    <ul className="flex flex-wrap gap-2 mt-auto pt-2">
                      {p.tags.map((t) => (
                        <li key={t} className="font-mono text-[10px] bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Links footer */}
                  <div className="flex gap-4 border-t border-white/5 pt-4">
                    {p.github && p.github !== '#' && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-cyan-400 hover:-translate-y-0.5 transition-all duration-200"
                        aria-label="GitHub Repository"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {p.live && p.live !== '#' && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-cyan-400 hover:-translate-y-0.5 transition-all duration-200"
                        aria-label="Live Demo Link"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                </div>
              </Card3DTilt>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
