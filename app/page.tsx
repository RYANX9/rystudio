'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function RyStudio() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeAccent, setActiveAccent] = useState('#00F0FF');
  
  useEffect(() => {
    const handleMouseMove = (e) => {
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
    { id: 1, title: 'E-Commerce Platform', code: 'const checkout = () => {...}', tech: 'Next.js 15 · Stripe', color: '#00F0FF' },
    { id: 2, title: 'SaaS Dashboard', code: 'useEffect(() => {...}', tech: 'React · Tailwind', color: '#CCFF00' },
    { id: 3, title: 'Portfolio CMS', code: 'export default async', tech: 'Next.js · Vercel', color: '#FF006E' },
    { id: 4, title: 'API Gateway', code: 'fetch("/api/...")', tech: 'Node.js · Edge', color: '#8B00FF' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] overflow-x-hidden font-sans">
      
      {/* BREAKING THE RULES: Projects First - No Traditional Hero */}
      <section className="relative min-h-screen pt-20 pb-32">
        
        {/* Floating Header - Not Fixed, Flows With Content */}
        <div className="absolute top-8 left-0 right-0 px-8 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FAFAFA] rounded-sm rotate-45" />
              <div className="font-mono text-xs tracking-widest opacity-60">RY_STUDIO</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-40 mb-1">Available for Work</div>
              <div className="text-xs font-mono" style={{ color: activeAccent }}>●_ONLINE</div>
            </div>
          </div>
        </div>

        {/* Projects Grid - Immediate Impact */}
        <div className="max-w-7xl mx-auto px-8 mt-24">
          <div className="grid grid-cols-7 gap-6">
            
            {/* Project 1 - Large Span */}
            <div 
              className="col-span-4 aspect-[4/3] group cursor-pointer relative"
              onMouseEnter={() => { setHoveredProject(1); setActiveAccent('#00F0FF'); }}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                transform: hoveredProject === 1 ? 'scale(1.02) translateY(-8px)' : 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="w-full h-full bg-[#151515] relative overflow-hidden"
                   style={{ transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#00F0FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Code Background */}
                <div className="absolute inset-0 p-6 font-mono text-[8px] text-[#404040] leading-relaxed opacity-30">
                  {`const checkout = () => {\n  const [cart, setCart] = useState([]);\n  return <PaymentForm />;\n}`}
                </div>
                
                <div className="absolute bottom-6 left-6 z-10">
                  <h3 className="text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    E-Commerce <span style={{ color: '#00F0FF' }}>Platform</span>
                  </h3>
                  <p className="text-xs tracking-[0.2em] uppercase opacity-60">Next.js 15 · Stripe · Vercel</p>
                </div>
              </div>
            </div>

            {/* About Section - Embedded in Grid */}
            <div className="col-span-3 aspect-[3/4] bg-[#FAFAFA] text-[#0A0A0A] p-8 flex flex-col justify-between"
                 style={{ 
                   transform: `translateY(${scrollY * 0.1}px)`,
                   transition: 'transform 0.1s linear'
                 }}>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-40 mb-4">Portfolio Designer</div>
                <h2 className="text-5xl font-black mb-6 leading-[0.9]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Building<br/>Digital<br/>
                  <span style={{ transform: 'rotate(-3deg)', display: 'inline-block' }}>Experiences</span>
                </h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed">
                <p className="opacity-80">Specialized in crafting high-performance portfolios with Next.js, where code meets creativity.</p>
                <div className="pt-4 border-t border-[#0A0A0A]/20">
                  <div className="font-mono text-xs opacity-60">stack_tools:</div>
                  <div className="text-[10px] mt-2 space-y-1">
                    <div>Next.js 15 · React · TypeScript</div>
                    <div>Tailwind CSS · Framer Motion</div>
                    <div>Vercel · Git · Figma</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div 
              className="col-span-3 aspect-square group cursor-pointer relative"
              onMouseEnter={() => { setHoveredProject(2); setActiveAccent('#CCFF00'); }}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                transform: hoveredProject === 2 ? 'scale(1.02) translateY(-8px) rotate(-1deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="w-full h-full bg-[#151515] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent to-[#CCFF00]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 p-6 font-mono text-[8px] text-[#404040] leading-relaxed opacity-30">
                  {`useEffect(() => {\n  fetchData();\n}, [deps]);`}
                </div>
                <div className="absolute bottom-6 left-6 z-10">
                  <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    SaaS <span style={{ color: '#CCFF00' }}>Dashboard</span>
                  </h3>
                  <p className="text-xs tracking-[0.2em] uppercase opacity-60">React · Tailwind</p>
                </div>
              </div>
            </div>

            {/* Contact CTA - Disguised as Project */}
            <div className="col-span-4 aspect-[2/1] bg-[#00F0FF] text-[#0A0A0A] p-8 flex items-center justify-between group cursor-pointer hover:bg-[#CCFF00] transition-colors duration-500">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 mb-2">Available Now</div>
                <h3 className="text-5xl font-black leading-[0.9] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Let's Build<br/>Together
                </h3>
                <div className="font-mono text-xs">contact@rystudio.dev</div>
              </div>
              <div className="text-7xl group-hover:rotate-45 transition-transform duration-500">→</div>
            </div>

            {/* Project 3 */}
            <div 
              className="col-span-3 aspect-[3/2] group cursor-pointer relative"
              onMouseEnter={() => { setHoveredProject(3); setActiveAccent('#FF006E'); }}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                transform: hoveredProject === 3 ? 'scale(1.02) translateY(-8px)' : 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="w-full h-full bg-[#151515] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#FF006E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 p-6 font-mono text-[8px] text-[#404040] leading-relaxed opacity-30">
                  {`export default async\nfunction Page() {...}`}
                </div>
                <div className="absolute bottom-6 left-6 z-10">
                  <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Portfolio <span style={{ color: '#FF006E' }}>CMS</span>
                  </h3>
                  <p className="text-xs tracking-[0.2em] uppercase opacity-60">Next.js · Vercel</p>
                </div>
              </div>
            </div>

            {/* Metrics Panel - Live Stats */}
            <div className="col-span-4 aspect-[4/2] bg-[#0A0A0A] border border-[#404040] p-8">
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-40 mb-6">System_Metrics</div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-4xl font-black font-mono" style={{ color: activeAccent }}>98</div>
                  <div className="text-xs opacity-60 mt-1">Lighthouse Score</div>
                </div>
                <div>
                  <div className="text-4xl font-black font-mono" style={{ color: activeAccent }}>0.8s</div>
                  <div className="text-xs opacity-60 mt-1">Build Time</div>
                </div>
                <div>
                  <div className="text-4xl font-black font-mono" style={{ color: activeAccent }}>60</div>
                  <div className="text-xs opacity-60 mt-1">FPS</div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-[#404040]/30">
                <div className="font-mono text-[10px] opacity-40">
                  git commit -m "feat: new portfolio system"
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-[#404040]/30 py-12 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-mono text-[10px] opacity-40">
            © 2025 Ry Studio — Built with Next.js 15
          </div>
          <div className="flex gap-8 text-xs">
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">GitHub</a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">LinkedIn</a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Custom Cursor Effect */}
      <div 
        className="fixed w-4 h-4 border-2 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          borderColor: activeAccent,
          left: cursorPos.x - 8,
          top: cursorPos.y - 8,
          transition: 'border-color 0.3s ease'
        }}
      />
      
    </div>
  );
}
