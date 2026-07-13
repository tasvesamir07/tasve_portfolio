'use client'

import React, { useState } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  
  // Animation state: 'idle' | 'folding' | 'plane' | 'flying' | 'done'
  const [animState, setAnimState] = useState<'idle' | 'folding' | 'plane' | 'flying' | 'done'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Start animation and loading state
    setStatus('loading')
    setAnimState('folding')

    // 1. Wait for paper to slide down and envelope to fold (1.2s total)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setAnimState('plane')

    // 2. Wait for envelope to morph into paper plane (0.8s)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setAnimState('flying')

    try {
      const apiCall = fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      // Ensure the flying animation is visible for at least 1.2 seconds
      const [res] = await Promise.all([
        apiCall,
        new Promise((resolve) => setTimeout(resolve, 1200))
      ])

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to send message')
      }

      setAnimState('done')
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
      
      // Reset back to idle after 6 seconds
      setTimeout(() => {
        setStatus('idle')
        setAnimState('idle')
      }, 6000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
      setAnimState('idle')
      setTimeout(() => setStatus('idle'), 6000)
    }
  }

  return (
    <div className="relative w-full overflow-visible min-h-[400px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {animState === 'idle' && (
          <motion.form
            key="contact-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col gap-6"
            autoComplete="off"
          >
            <div className="relative w-full group">
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder=" "
                aria-label="Your name"
                className="w-full py-2 bg-transparent border-b-2 border-white/10 outline-none text-white text-base transition-colors duration-200 focus:border-b-transparent peer"
              />
              <label className="absolute left-0 top-2 text-base text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-400">
                Name
              </label>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200 -translate-x-1/2 group-focus-within:w-full" />
            </div>

            <div className="relative w-full group">
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                aria-label="Your email address"
                className="w-full py-2 bg-transparent border-b-2 border-white/10 outline-none text-white text-base transition-colors duration-200 focus:border-b-transparent peer"
              />
              <label className="absolute left-0 top-2 text-base text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-400">
                Email
              </label>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200 -translate-x-1/2 group-focus-within:w-full" />
            </div>

            <div className="relative w-full group">
              <input
                type="text"
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                placeholder=" "
                aria-label="Message subject"
                className="w-full py-2 bg-transparent border-b-2 border-white/10 outline-none text-white text-base transition-colors duration-200 focus:border-b-transparent peer"
              />
              <label className="absolute left-0 top-2 text-base text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-400">
                Subject
              </label>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200 -translate-x-1/2 group-focus-within:w-full" />
            </div>

            <div className="relative w-full group">
              <textarea
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder=" "
                aria-label="Your message"
                className="w-full py-2 bg-transparent border-b-2 border-white/10 outline-none text-white text-base transition-colors duration-200 focus:border-b-transparent resize-none peer"
              />
              <label className="absolute left-0 top-2 text-base text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-400">
                Message
              </label>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200 -translate-x-1/2 group-focus-within:w-full" />
            </div>

            {status === 'error' && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/20 transform hover:-translate-y-1 transition-all duration-200 cursor-pointer disabled:opacity-50"
              aria-label={status === 'loading' ? 'Sending message' : 'Send message'}
            >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </motion.form>
        )}

        {/* Origami Letter Folding Animation */}
        {animState === 'folding' && (
          <motion.div
            key="folding-animation"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-full min-h-[350px]"
            style={{ perspective: 1000 }}
          >
            <div className="relative w-64 h-44 flex items-center justify-center">
              {/* The Written Message Sheet */}
              <motion.div
                initial={{ y: -60, scale: 0.9, opacity: 0.5 }}
                animate={{ y: 24, scale: 0.85, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeInOut' }}
                className="absolute z-0 w-52 h-44 bg-white/95 rounded-lg shadow-2xl p-4 flex flex-col gap-2.5 border border-white/20 select-none overflow-hidden"
              >
                <div className="h-3 bg-purple-500/25 rounded w-1/3" />
                <div className="h-2 bg-gray-400/20 rounded w-full" />
                <div className="h-2 bg-gray-400/20 rounded w-5/6" />
                <div className="h-2 bg-gray-400/20 rounded w-full" />
                <div className="h-2 bg-gray-400/20 rounded w-4/5" />
              </motion.div>

              {/* Envelope Back Body */}
              <div className="absolute z-10 bottom-0 w-64 h-36 bg-[#0f121d] border border-cyan-500/30 rounded-b-xl shadow-lg flex items-end justify-center overflow-hidden">
                {/* Envelope Interior Lining */}
                <div className="w-full h-full bg-gradient-to-t from-purple-950/20 to-transparent absolute inset-0" />
              </div>

              {/* Envelope Front Overlay Flaps (creates depth) */}
              <div 
                className="absolute z-20 bottom-0 w-64 h-36 bg-transparent border-cyan-500/20 border-t-0 border-x-[128px] border-b-[180px] border-b-[#0b0d16] rounded-b-xl"
                style={{
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: 'transparent',
                }}
              />

              {/* Envelope Top Folding Flap */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={{ rotateX: 180 }}
                transition={{ delay: 0.8, duration: 0.4, ease: 'easeInOut' }}
                className="absolute z-30 top-8 w-64 h-20 bg-gradient-to-b from-[#131726] to-[#0f121d] border border-cyan-500/30"
                style={{
                  originY: 'top',
                  clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                  backfaceVisibility: 'hidden',
                }}
              />
            </div>
            <p className="text-xs text-gray-500 font-mono mt-6 animate-pulse">
              Folding your message...
            </p>
          </motion.div>
        )}

        {/* Morphing into Paper Plane */}
        {animState === 'plane' && (
          <motion.div
            key="plane-animation"
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: [0.5, 1.2, 1], rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center min-h-[350px]"
          >
            <div className="relative">
              {/* Origami Paper Plane SVG */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#plane-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              >
                <defs>
                  <linearGradient id="plane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-6 animate-pulse">
              Crafting paper plane...
            </p>
          </motion.div>
        )}

        {/* Paper Plane Flying Animation */}
        {animState === 'flying' && (
          <motion.div
            key="flying-animation"
            initial={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[350px] overflow-visible relative"
          >
            <motion.div
              animate={{
                x: [0, -40, 800],
                y: [0, 20, -800],
                rotate: [0, -15, -45],
                scale: [1, 1.15, 0.15],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.4,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="relative overflow-visible"
            >
              {/* Paper Plane */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#plane-grad-fly)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]"
              >
                <defs>
                  <linearGradient id="plane-grad-fly" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>

              {/* Glowing Particle Trail */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.8, scale: 1.2 }}
                  animate={{
                    opacity: 0,
                    scale: 0.1,
                    x: -24 - i * 14,
                    y: 24 + i * 14,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.08,
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_10px_#06b6d4]"
                />
              ))}
            </motion.div>
            <p className="text-xs text-gray-500 font-mono mt-6">
              Sending your message...
            </p>
          </motion.div>
        )}

        {/* Success Confirmation */}
        {animState === 'done' && status === 'success' && (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-[350px] text-center p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-xl shadow-inner shadow-cyan-500/5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle className="w-8 h-8" />
            </motion.div>
            <h3 className="font-heading font-bold text-2xl text-white mb-2">Message Sent!</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Your paper plane has landed safely! I will read your message and get back to you as
              soon as possible.
            </p>
            <button
              onClick={() => {
                setStatus('idle')
                setAnimState('idle')
              }}
              className="mt-6 flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:text-white transition-colors cursor-pointer group"
            >
              Send Another Message
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
