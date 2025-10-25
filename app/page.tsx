'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleScroll = useCallback(() => setScrollPosition(window.pageYOffset), []);
  const handleMouseMove = useCallback((e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY }), []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({
    children,
    className = '',
    id,
  }) => {
    const ref = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsVisible(true);
        },
        { rootMargin: '0px', threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }, []);

    return (
      <section
        ref={ref as React.MutableRefObject<HTMLElement>}
        id={id}
        className={`min-h-screen relative flex flex-col justify-center ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} transition-all duration-700`}
      >
        {children}
      </section>
    );
  };

  const showcases = [
    {
      title: 'FINTECH DASHBOARD',
      category: 'Web Application',
      year: '2024',
      description: 'Real-time analytics dashboard with dark mode.',
      image: '/projects/fintech-dashboard.jpg',
    },
    {
      title: 'LUXURY E-COMMERCE',
      category: 'Landing Page',
      year: '2024',
      description: 'High-converting landing page optimized for mobile-first experience.',
      image: '/projects/luxury-ecommerce.jpg',
    },
    {
      title: 'FOUNDER PORTFOLIO',
      category: 'Personal Brand',
      year: '2024',
      description: 'Minimalistic personal brand site with storytelling animations.',
      image: '/projects/founder-portfolio.jpg',
    },
    {
      title: 'SAAS PRODUCT SITE',
      category: 'Marketing Site',
      year: '2023',
      description: 'Marketing site with clear CTA hierarchy and smooth UX.',
      image: '/projects/saas-site.jpg',
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white font-mono antialiased overflow-x-hidden relative">
      {/* Cursor glow */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-10"
        style={{
          background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.05), transparent 40%)`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-6 sm:p-8 flex justify-between items-center backdrop-blur-sm bg-black/30">
        <div className="flex items-center space-x-3 text-xl sm:text-2xl font-bold tracking-wider">
          <div className="transition-transform" style={{ transform: `rotate(${scrollPosition * 0.05}deg)` }}>
            <Image
              src="/noun.svg"
              alt="Ry Studio Logo"
              width={44}
              height={44}
              className="opacity-100 invert"
            />
          </div>
          <span className="hidden sm:inline opacity-100">RY STUDIO</span>
        </div>
        <nav>
          <a
            href="#contact"
            className="text-xs sm:text-sm uppercase tracking-widest border border-white/30 px-4 py-2 sm:px-5 sm:py-2 hover:border-white hover:bg-white/10 transition-all duration-300"
          >
            Let's Talk
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/hero-background.jpg')`,
            transform: `translateY(${scrollPosition * 0.25}px) scale(1.05)`,
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="z-20 text-center px-6 sm:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl sm:text-8xl md:text-[9rem] font-extrabold tracking-tight leading-tight mb-6 sm:mb-8"
          >
            PREMIUM
            <br />
            WEB DESIGN
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mt-4 sm:mt-6 text-base sm:text-2xl font-light text-white/80 max-w-xl sm:max-w-4xl mx-auto tracking-wide"
          >
            Exclusive landing pages, portfolios, and custom websites.
          </motion.p>
          <motion.a
            href="#work"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-8 sm:mt-10 inline-block text-base sm:text-xl tracking-widest border-b-2 border-white/40 pb-1 hover:border-white transition-all duration-500"
          >
            View Selected Work
          </motion.a>
        </div>
      </section>

      {/* Services Section */}
      <AnimatedSection className="bg-neutral-950 text-white p-10 sm:p-20">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-sm sm:text-base uppercase tracking-widest text-white/50 block mb-6">What I Do</span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-6xl md:text-8xl font-bold leading-tight mb-10"
          >
            Three Services. One Standard.
          </motion.h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-14">
            {[
              { title: 'Landing Pages', desc: 'High-converting pages optimized for clarity and speed.' },
              { title: 'Portfolios', desc: 'Personal brands that stand out and tell your story cleanly.' },
              { title: 'Custom Websites', desc: 'Tailored experiences built for your vision.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
              >
                <h3 className="text-2xl sm:text-3xl font-semibold mb-3 border-b border-white/20">{`0${i + 1}. ${s.title}`}</h3>
                <p className="text-base sm:text-lg text-white/70 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Showcase Grid */}
      <AnimatedSection id="work" className="bg-black text-white p-10 sm:p-20">
        <div className="max-w-7xl mx-auto">
          <span className="text-sm sm:text-base uppercase tracking-widest text-white/50 block mb-6">Selected Work</span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-6xl md:text-8xl font-bold leading-tight mb-10"
          >
            Recent Projects
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {showcases.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-neutral-950/80 transition-transform duration-500 hover:scale-105"
              >
                <div
                  className="h-64 sm:h-72 md:h-80 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${p.image})` }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center text-center px-4">
                  <p className="text-white/70 mb-2">{p.category} · {p.year}</p>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-1">{p.title}</h3>
                  <p className="text-white/60 text-sm sm:text-base">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <AnimatedSection className="bg-neutral-950 text-white p-10 sm:p-20" id="contact">
        <div className="text-center max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tight leading-tight mb-6 sm:mb-10"
          >
            LET'S BUILD
            <br />
            SOMETHING RARE.
          </motion.h2>
          <p className="text-base sm:text-2xl text-white/70 mb-8 leading-relaxed max-w-3xl mx-auto">
            I take on a limited number of projects each month. If you're serious about standing out, let's talk.
          </p>
          <a
            href="mailto:inquire@rystudio.com"
            className="inline-block text-base sm:text-xl uppercase tracking-widest bg-white text-black px-8 py-3 sm:px-10 sm:py-4 font-semibold hover:bg-white/90 transition duration-500"
          >
            Start a Conversation
          </a>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-black text-white/60 p-6 sm:p-10 text-xs sm:text-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Crafted with obsession.</p>
          <div className="flex flex-col sm:flex-row sm:space-x-8 items-center gap-2 sm:gap-0">
            <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300">
              X/Twitter
            </a>
            <p className="text-xs sm:text-sm">Built with Next.js · Deployed on Vercel</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
