'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'

interface Props {
  logoText: string
}

export default function Navbar({ logoText }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Section tracker
      const sections = [
        'home',
        'about',
        'skills',
        'projects',
        'experience',
        'education',
        'certifications',
        'gallery',
        'contact',
      ]
      let current = 'home'

      // If we are at the bottom of the page, force 'contact' to be active
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50

      if (isAtBottom) {
        current = 'contact'
      } else {
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId)
          if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.top <= 150) {
              current = sectionId
            }
          }
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = ['home', 'about', 'skills', 'projects', 'experience', 'education']

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[1000] border-b border-transparent transition-all duration-200 ${
        scrolled ? 'bg-glass-bg backdrop-blur-xl border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Logo */}
        <a
          href="/"
          className="font-heading font-extrabold text-xl text-white flex items-center gap-1 group"
        >
          <span className="text-cyan-400 group-hover:text-pink-500 transition-colors duration-200">
            &lt;
          </span>
          <span>{logoText}</span>
          <span className="text-cyan-400 group-hover:text-pink-500 transition-colors duration-200">
            /&gt;
          </span>
        </a>

        {/* Desktop Nav links */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            <li>
              <button
                onClick={toggle}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </li>
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link}`}
                  className={`relative text-sm font-semibold capitalize tracking-wider transition-colors duration-200 hover:text-white ${
                    activeSection === link ? 'text-white' : 'text-gray-400'
                  }`}
                  aria-label={`Navigate to ${link} section`}
                >
                  {link}
                  {activeSection === link && (
                    <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500" />
                  )}
                </a>
              </li>
            ))}

            <li>
              <Link
                href="/blog"
                className={`relative text-sm font-semibold capitalize tracking-wider transition-colors duration-200 hover:text-white ${
                  activeSection === 'blog' ? 'text-white' : 'text-gray-400'
                }`}
                aria-label="Visit blog"
              >
                Blog
                {activeSection === 'blog' && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500" />
                )}
              </Link>
            </li>

            {/* "More" Dropdown Menu */}
            <li className="relative group/more">
              <button
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 capitalize tracking-wider cursor-pointer bg-transparent border-0 outline-none hover:text-white ${
                  activeSection === 'certifications' ||
                  activeSection === 'gallery' ||
                  activeSection === 'contact'
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
                aria-label="More sections"
              >
                More{' '}
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover/more:rotate-180" />
              </button>

              {/* Dropdown Box */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a0c14]/95 backdrop-blur-xl border border-white/5 rounded-xl p-2 shadow-2xl transition-all duration-200 opacity-0 translate-y-2 invisible group-hover/more:opacity-100 group-hover/more:translate-y-0 group-hover/more:visible z-50">
                <a
                  href="#certifications"
                  className={`block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-white/5 rounded-lg transition-colors duration-200 hover:text-white ${
                    activeSection === 'certifications'
                      ? 'text-cyan-400 bg-white/5'
                      : 'text-gray-400'
                  }`}
                  aria-label="Certifications section"
                >
                  Certifications & Awards
                </a>
                <a
                  href="#gallery"
                  className={`block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-white/5 rounded-lg transition-colors duration-200 hover:text-white ${
                    activeSection === 'gallery' ? 'text-cyan-400 bg-white/5' : 'text-gray-400'
                  }`}
                  aria-label="Gallery section"
                >
                  Gallery
                </a>
                <a
                  href="#contact"
                  className={`block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-white/5 rounded-lg transition-colors duration-200 hover:text-white ${
                    activeSection === 'contact' ? 'text-cyan-400 bg-white/5' : 'text-gray-400'
                  }`}
                  aria-label="Contact section"
                >
                  Contact
                </a>
              </div>
            </li>
          </ul>
        </nav>

        {/* Mobile Hamburger toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-cyan-400 transition-colors duration-200 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav menu drawer */}
      <div
        className={`fixed top-[60px] left-0 w-full h-[calc(100vh-60px)] bg-[#07090e]/95 backdrop-blur-xl border-t border-white/5 p-8 flex flex-col items-center justify-center gap-6 transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav>
          <ul className="flex flex-col items-center gap-6">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link}`}
                  onClick={() => setIsOpen(false)}
                  className={`text-xl font-bold font-heading capitalize tracking-wider transition-colors duration-200 hover:text-cyan-400 ${
                    activeSection === link ? 'text-cyan-400' : 'text-gray-300'
                  }`}
                  aria-label={`Navigate to ${link} section`}
                >
                  {link}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/blog"
                onClick={() => setIsOpen(false)}
                className="text-xl font-bold font-heading capitalize tracking-wider text-gray-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Blog
              </Link>
            </li>
            <li>
              <a
                href="#certifications"
                onClick={() => setIsOpen(false)}
                className={`text-xl font-bold font-heading capitalize tracking-wider transition-colors duration-200 hover:text-cyan-400 ${
                  activeSection === 'certifications' ? 'text-cyan-400' : 'text-gray-300'
                }`}
              >
                Certifications & Awards
              </a>
            </li>
            <li>
              <a
                href="#gallery"
                onClick={() => setIsOpen(false)}
                className={`text-xl font-bold font-heading capitalize tracking-wider transition-colors duration-200 hover:text-cyan-400 ${
                  activeSection === 'gallery' ? 'text-cyan-400' : 'text-gray-300'
                }`}
              >
                Gallery
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className={`text-xl font-bold font-heading capitalize tracking-wider transition-colors duration-200 hover:text-cyan-400 ${
                  activeSection === 'contact' ? 'text-cyan-400' : 'text-gray-300'
                }`}
              >
                contact
              </a>
            </li>
            <li>
              <button
                onClick={() => { toggle(); setIsOpen(false) }}
                className="flex items-center gap-2 text-xl font-bold font-heading tracking-wider text-gray-300 hover:text-cyan-400 transition-colors duration-200 cursor-pointer"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <><Sun className="w-5 h-5" /> Light Mode</> : <><Moon className="w-5 h-5" /> Dark Mode</>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
