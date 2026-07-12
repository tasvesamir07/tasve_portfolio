'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, Loader } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to send message')
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="off">
      <div className="relative w-full group">
        <input
          type="text"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder=" "
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
          className="w-full py-2 bg-transparent border-b-2 border-white/10 outline-none text-white text-base transition-colors duration-200 focus:border-b-transparent resize-none peer"
        />
        <label className="absolute left-0 top-2 text-base text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-400">
          Message
        </label>
        <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200 -translate-x-1/2 group-focus-within:w-full" />
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5" /> Message sent successfully! I will get back to you soon.
        </div>
      ) : status === 'error' ? (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm animate-fade-in">
          {errorMsg}
        </div>
      ) : (
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/20 transform hover:-translate-y-1 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {status === 'loading' ? (
            <>
              Sending... <Loader className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <>
              Send Message <Send className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </form>
  );
}
