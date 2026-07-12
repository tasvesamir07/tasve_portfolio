import React from 'react';
import { 
  fetchProfile, 
  fetchProjects, 
  fetchSkills, 
  fetchExperience 
} from '@/lib/api';
import Navbar from '@/components/Navbar';
import Typewriter from '@/components/Typewriter';
import ProjectsGrid from '@/components/ProjectsGrid';
import ContactForm from '@/components/ContactForm';
import Card3DTilt from '@/components/Card3DTilt';
import { 
  ArrowRight, 
  Mail, 
  MapPin, 
  Terminal, 
  Cpu, 
  TrendingUp, 
  Smartphone, 
  Award, 
  Layers, 
  Briefcase 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch dynamic portfolio data
  const [profile, projects, skills, experiences] = await Promise.all([
    fetchProfile().catch(() => null),
    fetchProjects().catch(() => []),
    fetchSkills().catch(() => []),
    fetchExperience().catch(() => []),
  ]);

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">No profile data available.</div>;
  }

  // Create clean logo name
  const logoText = profile.name.replace(/\s+/g, '');

  return (
    <>
      {/* Sticky Navigation */}
      <Navbar logoText={logoText} />

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 px-6 md:px-12 overflow-hidden">
        {/* Neon Glow spots */}
        <div className="absolute top-[15%] left-[10%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[10%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography Details */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <div className="font-mono text-sm md:text-base text-cyan-400 tracking-wider flex items-center justify-center lg:justify-start gap-2">
              <span className="text-cyan-400 font-bold">~</span> {profile.intro}
            </div>
            
            <h1 className="font-heading font-extrabold text-5xl md:text-7xl tracking-tight text-white leading-[1.05]">
              {profile.name}
            </h1>
            
            {/* Dynamic Typewriter Role */}
            <Typewriter primaryRole={profile.title} />

            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {profile.description}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                View Work <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-3 px-6 py-3 bg-transparent border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/5 text-white font-semibold rounded-lg backdrop-blur-md transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Let's Talk
              </a>
            </div>
          </div>

          {/* Right Column: Code block visual */}
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
                  <pre>{`{
  `}<span className="text-pink-500">"name"</span>: <span className="text-cyan-400">"${profile.name}"</span>,
  <span className="text-pink-500">"role"</span>: <span className="text-cyan-400">"${profile.title}"</span>,
  <span className="text-pink-500">"skills"</span>: [
{skills[0]?.items.slice(0, 3).map(s => `    "${s.name}"`).join(',\n')}
  ],
  <span className="text-pink-500">"passion"</span>: <span className="text-cyan-400">"Sleek UI Animations"</span>,
  <span className="text-pink-500">"location"</span>: <span className="text-cyan-400">"${profile.location}"</span>
{`}`}</pre>
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

      {/* --- ABOUT ME SECTION --- */}
      <section id="about" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-12">
            <span className="font-mono text-sm text-cyan-400 tracking-wider">01. Background</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
              About Me <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Bio Text */}
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

            {/* Core Values Cards */}
            <div className="flex flex-col gap-6">
              <Card3DTilt>
                <div className="info-card-glow" />
                <div className="bg-glass-bg border border-white/5 rounded-xl p-6 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5 transition-colors duration-200 flex gap-4">
                  <div className="text-cyan-400 p-2 bg-cyan-400/5 border border-cyan-400/10 rounded-lg h-fit">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white mb-2">Clean Coding</h3>
                    <p className="text-sm text-gray-400">Writing modular, maintainable code focusing on optimization and design patterns.</p>
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
                    <h3 className="font-heading font-bold text-lg text-white mb-2">High Performance</h3>
                    <p className="text-sm text-gray-400">Optimizing loading assets achieving close to 100 on PageSpeed audits.</p>
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
                    <p className="text-sm text-gray-400">Building fully responsive layouts matching pixel designs precisely.</p>
                  </div>
                </div>
              </Card3DTilt>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECHNICAL SKILLS SECTION --- */}
      <section id="skills" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-12">
            <span className="font-mono text-sm text-cyan-400 tracking-wider">02. Stack</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
              Technical Expertise <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div key={item.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-sm text-gray-400 font-semibold">
                        <span>{item.name}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" 
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-12">
            <span className="font-mono text-sm text-cyan-400 tracking-wider">03. Portfolios</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
              Featured Projects <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
            </h2>
          </div>

          {/* Interactive filterable projects component */}
          <ProjectsGrid projects={projects} />
        </div>
      </section>

      {/* --- TIMELINE/EXPERIENCE SECTION --- */}
      <section id="experience" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2 mb-16">
            <span className="font-mono text-sm text-cyan-400 tracking-wider">04. Journey</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
              My Experience <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
            </h2>
          </div>

          <div className="relative pl-10 border-l border-white/10 flex flex-col gap-12">
            {experiences.map((exp) => (
              <div key={exp.company + exp.date} className="relative group">
                {/* Connecting Dot */}
                <div className="absolute -left-[49px] top-1.5 w-[18px] h-[18px] rounded-full bg-[#07090e] border-[3px] border-cyan-400 shadow-md shadow-cyan-400/50 group-hover:border-pink-500 group-hover:shadow-pink-500/50 transition-all duration-200" />
                
                <span className="font-mono text-xs text-cyan-400 tracking-wider block mb-2">{exp.date}</span>
                <div className="bg-glass-bg border border-white/5 rounded-xl p-6 group-hover:border-white/10 group-hover:shadow-lg group-hover:shadow-purple-500/5 transition-colors duration-200">
                  <h3 className="font-heading font-bold text-xl text-white flex flex-wrap gap-2 items-center">
                    {exp.title}
                  </h3>
                  <h4 className="font-heading font-semibold text-purple-400 text-sm mt-1">{exp.company}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed mt-4">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 mb-12">
            <span className="font-mono text-sm text-cyan-400 tracking-wider">05. Network</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white flex items-center gap-4">
              Get In Touch <span className="h-[1px] flex-grow max-w-[200px] bg-gradient-to-r from-white/10 to-transparent" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left side details */}
            <div className="flex flex-col gap-6">
              <h3 className="font-heading font-bold text-2xl text-white">Let's build something amazing together!</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                I am currently open to exciting new opportunities, collaborations, and contract work. Whether you have a project idea, a position to fill, or just want to say hi, feel free to drop me a message!
              </p>

              <div className="flex flex-col gap-4 mt-4 text-sm md:text-base">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-cyan-400/5 border border-cyan-400/10 rounded-lg flex items-center justify-center text-cyan-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-gray-500">Email</span>
                    <a href={`mailto:${profile.email}`} className="text-gray-300 hover:text-cyan-400 font-semibold transition-colors duration-200">
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
              </div>
            </div>

            {/* Right side contact form */}
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
            Engineered with <span className="text-cyan-400">♥</span> using Next.js, Framer Motion, and Supabase.
          </p>
        </div>
      </footer>
    </>
  );
}
