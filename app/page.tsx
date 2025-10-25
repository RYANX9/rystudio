'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export default function Portfolio() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
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
        <div className={`transition-all duration-1000 ease-out ${revealClass} w-full`}>{children}</div>
      </section>
    );
  };

  const showcases = [
    {
      title: 'FINTECH DASHBOARD',
      category: 'Web Application',
      year: '2024',
      description: 'Real-time analytics interface with dark mode. 60fps animations, optimized data visualization.',
      tech: 'Next.js 14, Framer Motion, Tailwind',
      image: '/projects/fintech-dashboard.jpg',
    },
    {
      title: 'LUXURY BRAND',
      category: 'Landing Page',
      year: '2024',
      description: 'High-converting product launch page. Mobile-first design, sub-1.5s load time.',
      tech: 'Next.js, Vercel Edge, Custom animations',
      image: '/projects/luxury-ecommerce.jpg',
    },
    {
      title: 'FOUNDER PORTFOLIO',
      category: 'Personal Brand',
      year: '2024',
      description: 'Minimalist storytelling with smooth parallax effects. Built to convert opportunities.',
      tech: 'Next.js, GSAP, Vercel deployment',
      image: '/projects/founder-portfolio.jpg',
    },
    {
      title: 'SAAS MARKETING SITE',
      category: 'Product Site',
      year: '2023',
      description: 'Conversion-optimized landing page with interactive demos. Clear CTAs throughout.',
      tech: 'Next.js 13, TypeScript, shadcn/ui',
      image: '/projects/saas-site.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % showcases.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <main className="min-h-screen bg-black text-white font-mono antialiased overflow-x-hidden">
      {/* Ambient cursor glow */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-20 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-8 flex justify-between items-center backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold tracking-wider">
          <div
            className="transition-all duration-700 ease-out hover:scale-110"
            style={{ transform: `rotate(${scrollPosition * 0.05}deg)` }}
          >
            <Image src="/noun.svg" alt="Ry Studio" width={40} height={40} className="opacity-90" />
          </div>
          <span className="hidden sm:inline opacity-90">RY STUDIO</span>
        </div>
        <nav className="flex items-center gap-6">
          <a
            href="#work"
            className="hidden sm:inline text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-300"
          >
            Work
          </a>
          <a
            href="#contact"
            className="text-xs sm:text-sm uppercase tracking-widest border border-white/30 px-3 py-1 sm:px-4 sm:py-2 hover:border-white hover:bg-white/5 transition-all duration-300"
          >
            Let's Talk
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)`,
              transform: `translate(${scrollPosition * 0.1}px, ${scrollPosition * 0.15}px)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        </div>

        <div className="z-20 text-center px-4 sm:px-8">
          <h1 className="text-5xl sm:text-8xl md:text-9xl font-extrabold tracking-tight sm:tracking-tighter leading-tight sm:leading-none mb-6 animate-fade-in">
            PREMIUM
            <br />
            WEB DESIGN
          </h1>
          <p className="mt-6 text-sm sm:text-lg font-light text-white/70 max-w-md sm:max-w-2xl mx-auto tracking-wide leading-relaxed">
            Exclusive landing pages, portfolios & custom websites.
            <br />
            <span className="text-white/90">Limited availability. Premium quality only.</span>
          </p>
          <a
            href="#work"
            className="mt-8 sm:mt-12 inline-block text-sm sm:text-base tracking-widest border-b border-white/30 pb-1 hover:border-white transition-all duration-500 group"
          >
            View Selected Work
            <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Spacer */}
      <div className="h-20 bg-gradient-to-b from-black via-neutral-950 to-neutral-900" />

      {/* What I Do Section */}
      <AnimatedSection className="bg-neutral-900 text-white p-8 sm:p-16">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-white/50 block mb-4 sm:mb-6">
            What I Do
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 sm:mb-8">
            Three Services.
            <br />
            One Standard: Excellence.
          </h2>
          <p className="text-base sm:text-xl text-white/60 max-w-3xl mb-12 sm:mb-16 leading-relaxed">
            Every project is treated with the same attention to detail—whether it's a single landing page or a
            full custom site. You get premium design, clean code, and fast delivery.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                title: 'Landing Pages',
                desc: 'High-converting pages built for speed and clarity. Optimized for mobile, desktop, and everything between.',
              },
              {
                title: 'Portfolios',
                desc: 'Personal brands that make you unforgettable. Your story, your style, your competitive edge.',
              },
              {
                title: 'Custom Websites',
                desc: 'Fully bespoke digital experiences. From concept to launch, designed exactly how you envision it.',
              },
            ].map((service, i) => (
              <div key={i} className="group">
                <div className="text-4xl sm:text-5xl font-bold text-white/10 mb-3 group-hover:text-white/20 transition-colors duration-500">
                  0{i + 1}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 pb-2 border-b border-white/10 group-hover:border-white/30 transition-all duration-500">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Spacer */}
      <div className="h-20 bg-gradient-to-b from-neutral-900 via-black to-neutral-950" />

      {/* Showcase Section - Unique Carousel */}
      <AnimatedSection id="work" className="bg-black text-white p-8 sm:p-16">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-white/50 block mb-4 sm:mb-6">
            Selected Work
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-12 sm:mb-16">
            Recent Projects.
          </h2>

          {/* Full-width carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-[1400ms] ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {showcases.map((project, index) => (
                  <div key={index} className="min-w-full px-2 sm:px-4">
                    <div className="border border-white/10 overflow-hidden group hover:border-white/30 transition-all duration-700">
                      {/* Project Image/Mockup */}
                      <div
                        className="h-64 sm:h-96 bg-cover bg-center relative overflow-hidden"
                        style={{ backgroundImage: `url(${project.image})` }}
                      >
                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-700" />
                        <div className="absolute top-4 right-4 text-xs tracking-widest text-white/60 uppercase bg-black/50 px-3 py-1 backdrop-blur-sm">
                          {project.year}
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="p-8 sm:p-12 bg-neutral-950 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-xs tracking-widest text-white/40 uppercase">
                          <span>{project.category}</span>
                          <span>•</span>
                          <span>{project.tech}</span>
                        </div>
                        <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight group-hover:text-white/90 transition-colors duration-500">
                          {project.title}
                        </h3>
                        <p className="text-sm sm:text-lg text-white/60 leading-relaxed max-w-2xl">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-3 mt-8 sm:mt-12">
              {showcases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-[2px] transition-all duration-500 ease-out ${
                    currentSlide === index
                      ? 'w-12 bg-white'
                      : 'w-6 bg-white/30 hover:bg-white/50 hover:w-8'
                  }`}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Spacer */}
      <div className="h-20 bg-gradient-to-b from-black via-neutral-950 to-neutral-900" />

      {/* Why Me Section */}
      <AnimatedSection className="bg-neutral-900 text-white p-8 sm:p-16">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-white/50 block mb-4 sm:mb-6">
            The Difference
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 sm:mb-8">
            Why Work With Me?
          </h2>

          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 mt-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white/90">Limited Availability</h3>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                I take on 3-4 projects per month maximum. This ensures every client gets my full attention and best
                work—not rushed templates or copy-paste solutions.
              </p>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white/90">Fast Turnaround</h3>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                Most projects are completed in 2-4 weeks. You get responsive design, clean code, and a site that
                actually performs—without the agency timeline or bloat.
              </p>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white/90">No Compromise on Quality</h3>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                Every pixel, every interaction, every line of code is intentional. You're not getting a "good enough"
                website—you're getting something you'll be proud to show off.
              </p>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white/90">Direct Communication</h3>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                You work with me directly. No project managers, no middlemen. I respond within 24 hours and keep you
                updated every step of the way.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Spacer */}
      <div className="h-20 bg-gradient-to-b from-neutral-900 via-black to-neutral-950" />

      {/* Contact Section */}
      <AnimatedSection className="bg-black text-white p-8 sm:p-16" id="contact">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-tight mb-6 sm:mb-8">
            LET'S BUILD
            <br />
            SOMETHING RARE.
          </h2>
          <p className="text-sm sm:text-lg font-light text-white/60 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
            I respond to every inquiry within 24 hours. If I'm available and we're a good fit, we can start within a
            week.
          </p>

          <a
            href="mailto:inquire@rystudio.com"
            className="inline-block text-sm sm:text-base uppercase tracking-widest bg-white text-black px-8 sm:px-12 py-3 sm:py-4 hover:bg-white/90 transition-all duration-300 font-semibold group"
          >
            Start a Conversation
            <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>

          <div className="mt-10 sm:mt-12 pt-8 border-t border-white/10">
            <p className="text-xs sm:text-sm text-white/40 mb-2">Investment Range</p>
            <p className="text-base sm:text-xl text-white/80 font-light">$2,500 - $8,000</p>
            <p className="text-xs sm:text-sm text-white/40 mt-4">Timeline: 2-4 weeks</p>
          </div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-black text-white/50 p-6 sm:p-8 text-xs sm:text-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Designed with intention.</p>
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-center gap-3 sm:gap-0">
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              X / Twitter
            </a>
            <p className="text-xs">Next.js • Vercel • Tailwind</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
