'use client'

import React, { useState, useEffect } from 'react'
import { X, ImageOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from './AnimatedSection'

interface GalleryItem {
  id: number
  title: string
  image: string
  description: string
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
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
        {items.map((item) => (
          <div key={item.id}
            className="bg-glass-bg border border-white/5 rounded-xl overflow-hidden hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200 group"
          >
            <div className="relative h-48 overflow-hidden bg-[#0f121d] flex items-center justify-center">
              {item.image ? (
                <button
                  onClick={() => setSelectedImage(item.image)}
                  className="w-full h-full block cursor-zoom-in bg-transparent border-0 p-0 outline-none"
                  title="View full image"
                >
                  <img src={item.image} alt={item.title || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                </button>
              ) : (
                <ImageOff className="w-12 h-12 text-gray-600" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-sm text-white">{item.title || 'Untitled'}</h3>
              {item.description && (
                <p className="text-xs text-gray-400 mt-1">{item.description}</p>
              )}
            </div>
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
