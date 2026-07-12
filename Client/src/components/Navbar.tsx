'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface Props {
  logoText: string;
}

export default function Navbar({ logoText }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Section tracker
      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
      let current = 'home';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[1000] border-b border-transparent transition-all duration-200 ${
        scrolled
          ? 'bg-glass-bg backdrop-blur-xl border-white/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Logo */}
        <a href="#home" className="font-heading font-extrabold text-xl text-white flex items-center gap-1 group">
          <span className="text-cyan-400 group-hover:text-pink-500 transition-colors duration-200">&lt;</span>
          <span>{logoText}</span>
          <span className="text-cyan-400 group-hover:text-pink-500 transition-colors duration-200">/&gt;</span>
        </a>

        {/* Desktop Nav links */}
        <nav className="hidden md:block">
          <ul className="flex gap-8">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link}`}
                  className={`relative text-sm font-semibold capitalize tracking-wider transition-colors duration-200 hover:text-white ${
                    activeSection === link ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {link}
                  {activeSection === link && (
                    <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500" />
                  )}
                </a>
              </li>
            ))}
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
        className={`fixed top-[60px] left-0 w-full h-[calc(100vh-60px)] bg-[#07090e]/95 backdrop-blur-xl border-t border-white/5 p-8 flex flex-col items-center justify-center gap-8 transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav>
          <ul className="flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link}`}
                  onClick={() => setIsOpen(false)}
                  className={`text-xl font-bold font-heading capitalize tracking-wider transition-colors duration-200 hover:text-cyan-400 ${
                    activeSection === link ? 'text-cyan-400' : 'text-gray-300'
                  }`}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
