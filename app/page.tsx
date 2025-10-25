'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Zap, Lock } from 'lucide-react';

export default () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = useCallback(() => {
    setScrollPosition(window.pageYOffset);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const AnimatedSection: React.FC<{
    children: React.ReactNode;
    index: number;
    className?: string;
    id?: string;
  }> = ({ children, index, className = '', id }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);

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

    const revealClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12';

    return (
      <section
        ref={ref as React.MutableRefObject<HTMLElement>}
        id={id}
        className={`min-h-screen relative overflow-hidden flex flex-col justify-center ${className}`}
      >
        <div className={`transition-all duration-1000 ease-out ${revealClass} w-full`}>
          {children}
        </div>
      </section>
    );
  };

  // Showcase data
  const showcases = [
    {
      title: 'FINTECH DASHBOARD',
      category: 'Web Application',
      year: '2024',
      color: 'from-blue-500/20 to-cyan-500/20',
      metrics: ['Real-time data', 'Dark mode', '60fps animations']
    },
    {
      title: 'LUXURY E-COMMERCE',
      category: 'Landing Page',
      year: '2024',
      color: 'from-amber-500/20 to-orange-500/20',
      metrics: ['Custom checkout', 'Mobile-first', 'Sub-2s load']
    },
    {
      title: 'FOUNDER PORTFOLIO',
      category: 'Personal Brand',
      year: '2024',
      color: 'from-purple-500/20 to-pink-500/20',
      metrics: ['Minimal design', 'Smooth scroll', 'Story-driven']
    },
    {
      title: 'SAAS PRODUCT SITE',
      category: 'Marketing Site',
      year: '2023',
      color: 'from-green-500/20 to-emerald-500/20',
      metrics: ['A/B tested', '40% conversion', 'SEO optimized']
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white font-mono antialiased overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-8 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold tracking-wider">
          <div
            className="transition-transform duration-1000"
            style={{ transform: `rotate(${scrollPosition * 0.1}deg)` }}
          >
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <span className="hidden sm:inline">RY STUDIO</span>
        </div>
        <nav>
          <a
            href="#contact"
            className="text-xs sm:text-sm uppercase tracking-widest border border-white px-3 py-1 sm:px-4 sm:py-2 hover:bg-white hover:text-black transition-colors duration-300"
          >
            Let's Talk
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center relative bg-black overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-black z-0" />
        
        {/* Animated grid background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollPosition * 0.5}px)`
          }} />
        </div>

        <div className="z-20 text-center px-4 sm:px-8">
          <div className="inline-flex items-center space-x-2 mb-6 text-xs sm:text-sm uppercase tracking-widest text-neutral-400 border border-neutral-800 px-3 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Limited Availability</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-tight sm:leading-none mb-6">
            PREMIUM
            <br />
            WEB DESIGN
          </h1>
          
          <p className="mt-4 sm:mt-6 text-base sm:text-lg font-light text-neutral-400 max-w-md sm:max-w-2xl mx-auto leading-relaxed">
            Exclusive landing pages, portfolios, and custom websites for founders who refuse to blend in. I take 3 clients per month.
          </p>
          
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#work"
              className="text-sm sm:text-base tracking-wider border border-white px-6 py-3 hover:bg-white hover:text-black transition-all duration-300"
            >
              View Selected Work
            </a>
            <a
              href="#contact"
              className="text-sm sm:text-base tracking-wider text-neutral-400 hover:text-white transition-colors duration-300"
            >
              Check Availability →
            </a>
          </div>
        </div>
      </section>

      {/* What I Do */}
      <AnimatedSection index={1} className="bg-neutral-950 text-white p-8 sm:p-16 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-600 block mb-4 sm:mb-6">
            What You Get
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-12 sm:mb-16">
            Three Services.
            <br />
            One Standard: Exceptional.
          </h2>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="border-t border-neutral-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold">01</h3>
                <Zap className="w-6 h-6 text-neutral-600" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-3">Landing Pages</h4>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                High-converting pages designed to capture attention in 3 seconds. Built for speed, optimized for results.
              </p>
            </div>
            
            <div className="border-t border-neutral-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold">02</h3>
                <Sparkles className="w-6 h-6 text-neutral-600" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-3">Portfolios</h4>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                Personal brands that position you as the obvious choice. Your story, told with precision and style.
              </p>
            </div>
            
            <div className="border-t border-neutral-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold">03</h3>
                <Lock className="w-6 h-6 text-neutral-600" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-3">Custom Websites</h4>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                Fully bespoke digital experiences. From concept to launch, tailored to your exact vision and goals.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Showcase Section - Timeline Style */}
      <AnimatedSection index={2} id="work" className="bg-black text-white p-8 sm:p-16">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-600 block mb-4 sm:mb-6">
            Selected Work
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
            Recent Projects
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg mb-12 sm:mb-16 max-w-2xl">
            A glimpse into the work I've delivered. Each project designed, built, and launched within 2-4 weeks.
          </p>
          
          {/* Timeline showcase */}
          <div className="space-y-0">
            {showcases.map((project, index) => (
              <div
                key={index}
                className="border-t border-neutral-900 py-8 sm:py-12 group hover:border-neutral-700 transition-colors duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs tracking-widest text-neutral-600 uppercase">{project.year}</span>
                      <span className="text-xs tracking-widest text-neutral-600 uppercase">— {project.category}</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight group-hover:text-neutral-300 transition-colors duration-300">
                      {project.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap lg:flex-nowrap gap-3 lg:gap-4">
                    {project.metrics.map((metric, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 border border-neutral-800 rounded-full text-neutral-400 whitespace-nowrap"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Visual element */}
                <div className={`mt-6 h-32 sm:h-48 bg-gradient-to-br ${project.color} rounded opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-neutral-500 text-sm sm:text-base italic">
              Full case studies available upon inquiry. NDA-protected work not shown.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Why Limited */}
      <AnimatedSection index={3} className="bg-neutral-950 text-white p-8 sm:p-16 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            Why I Only Take 3 Clients Per Month
          </h2>
          <div className="space-y-6 text-neutral-400 text-base sm:text-lg leading-relaxed">
            <p>
              Because quality takes time. Each project gets my full attention—no templates, no shortcuts, no compromises.
            </p>
            <p>
              You're not hiring a factory. You're hiring a designer who obsesses over every pixel, every interaction, every detail that makes your site unforgettable.
            </p>
            <p className="text-white font-semibold">
              This isn't for everyone. It's for founders who know their brand deserves better.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <section
        id="contact"
        className="min-h-screen flex items-center justify-center bg-black text-white p-8 sm:p-16 border-t border-neutral-900"
      >
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 mb-8 text-xs sm:text-sm uppercase tracking-widest text-neutral-500 border border-neutral-800 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Currently Accepting New Projects</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6 sm:mb-8">
            LET'S BUILD
            <br />
            SOMETHING RARE.
          </h2>
          
          <p className="text-base sm:text-xl font-light text-neutral-400 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
            I respond to every inquiry within 24 hours. If we're a fit, we start immediately.
          </p>
          
          <a
            href="mailto:inquire@rystudio.com"
            className="inline-block text-sm sm:text-lg uppercase tracking-widest bg-white text-black px-8 sm:px-12 py-4 sm:py-5 hover:bg-neutral-200 transition-colors duration-300 font-semibold"
          >
            Start a Conversation
          </a>
          
          <p className="mt-8 text-xs sm:text-sm text-neutral-600">
            Typical project investment: $3,000 - $12,000 | Timeline: 2-4 weeks
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-neutral-600 p-6 sm:p-8 text-xs sm:text-sm border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Crafted with obsession.</p>
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-center space-y-2 sm:space-y-0">
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              X/Twitter
            </a>
            <span className="text-neutral-700">•</span>
            <p>Next.js + Vercel</p>
          </div>
        </div>
      </footer>
    </main>
  );
};
