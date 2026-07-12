'use client'

import React, { useState, useEffect } from 'react'
import { X, ScrollText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from './AnimatedSection'

interface Certification {
  id: number
  title: string
  issuer: string
  date: string
  credential_url: string
  image: string
}

export default function CertificationsGrid({
  certifications,
}: {
  certifications: Certification[]
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Close lightbox on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <AnimatedSection
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="bg-glass-bg border border-white/5 rounded-xl p-5 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200 flex flex-col gap-4 group"
          >
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#0a0c14]/80 border border-white/5 p-2 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors shrink-0">
              {cert.image ? (
                <button
                  onClick={() => setSelectedImage(cert.image)}
                  className="w-full h-full block cursor-zoom-in bg-transparent border-0 p-0 outline-none"
                  title="View full certificate"
                >
                  <img
                    src={cert.image}
                    alt={cert.title || 'Certification badge'}
                    className="w-full h-full object-contain transition-transform group-hover:scale-[1.02] duration-300"
                  />
                </button>
              ) : (
                <ScrollText className="w-10 h-10 text-gray-600" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-heading font-bold text-base text-white leading-snug">
                {cert.title || 'Untitled Certification'}
              </h3>
              <div className="flex justify-between items-center text-xs">
                {cert.issuer && <span className="text-cyan-400 font-semibold">{cert.issuer}</span>}
                {cert.date && <span className="text-gray-500 font-mono">{cert.date}</span>}
              </div>
            </div>
            {cert.credential_url && (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-cyan-400 font-semibold transition-colors flex items-center gap-1 mt-auto self-start border border-white/5 hover:border-cyan-400/20 bg-white/5 px-3 py-1.5 rounded-lg"
              >
                View Credential →
              </a>
            )}
          </div>
        ))}
      </AnimatedSection>

      {/* Full-screen Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[2000] flex items-center justify-center p-6 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors cursor-pointer border-0 outline-none"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking image content itself
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
