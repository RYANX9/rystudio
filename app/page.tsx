'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function RyStudio() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeAccent, setActiveAccent] = useState('#00F0FF');
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const projects = [
    { id: 1, title: 'E-Commerce Platform', tech: 'Next.js 15 · Stripe', color: '#00F0FF' },
    { id: 2, title: 'SaaS Dashboard', tech: 'React · Tailwind', color: '#CCFF00' },
    { id: 3, title: 'Portfolio CMS', tech: 'Next.js · Vercel', color: '#FF006E' },
    { id: 4, title: 'API Gateway', tech: 'Node.js · Edge', color: '#8B00FF' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 sm:p-8 flex justify-between items-center z-50 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-sm rotate-45" />
          <span className="font-mono text-xs tracking-widest opacity-60">RY_STUDIO</span>
        </div>
        <div className="text-right text-xs sm:text-sm">
          <span className="opacity-40 tracking-widest">Available for Work</span>
          <div className="font-mono" style={{ color: activeAccent }}>●_ONLINE</div>
        </div>
      </header>

      {/* Projects Grid */}
      <section className="relative pt-28 pb-32 max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative group cursor-pointer bg-[#151515] p-6 rounded-xl overflow-hidden"
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
            style={{
              transform: hoveredProject === project.id ? 'scale(1.03) translateY(-5px)' : 'scale(1)',
              transition: 'all 0.4s ease',
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ backgroundColor: project.color }}
            />
            <h3 className="text-2xl font-bold mb-2" style={{ color: project.color }}>
              {project.title}
            </h3>
            <p className="text-xs opacity-60 tracking-widest">{project.tech}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#404040]/30 py-12 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs sm:text-sm">
          <span className="font-mono opacity-40">© 2025 Ry Studio — Built with Next.js 15</span>
          <div className="flex gap-8">
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">GitHub</a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">LinkedIn</a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Custom Cursor */}
      <div
        className="fixed w-4 h-4 rounded-full border-2 pointer-events-none z-50 mix-blend-difference"
        style={{
          left: cursorPos.x - 8,
          top: cursorPos.y - 8,
          borderColor: activeAccent,
          transition: 'border-color 0.3s ease',
        }}
      />
    </div>
  );
}
