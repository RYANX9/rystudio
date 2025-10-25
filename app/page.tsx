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
        <div className={`transition-all duration-1000 ease-out ${revealClass} w-full`}>
          {children}
        </div>
      </section>
    );
  };

  const showcases = [
    {
      title: 'FINTECH DASHBOARD',
      category: 'Web Application',
      year: '2024',
      description: 'Real-time analytics dashboard with dark mode. Smooth 60fps transitions.',
      image: '/projects/fintech-dashboard.jpg',
    },
    {
      title: 'LUXURY E-COMMERCE',
      category: 'Landing Page',
      year: '2024',
      description: 'High-converting product landing page. Mobile-first, sub-2s load time.',
      image: '/projects/luxury-ecommerce.jpg',
    },
    {
      title: 'FOUNDER PORTFOLIO',
      category: 'Personal Brand',
      year: '2024',
      description: 'Minimalistic personal brand site with smooth parallax storytelling.',
      image: '/projects/founder-portfolio.jpg',
    },
    {
      title: 'SAAS PRODUCT SITE',
      category: 'Marketing Site',
      year: '2023',
      description: 'Marketing site with A/B optimized sections. 35% conversion increase.',
      image: '/projects/saas-site.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % showcases.length), 5000);
    return () => clearInterval(interval);
  }, [showcases.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % showcases.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + showcases.length) % showcases.length);

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
      <header className="fixed top-0 left-0 right-0 z-40 p-6 sm:p-8 flex justify-between items-center backdrop-blur-md bg-black/30">
        <div className="flex items-center space-x-3 text-xl sm:text-2xl font-bold tracking-wider">
          <div className="transition-all duration-700 ease-out" style={{ transform: `rotate(${scrollPosition * 0.05}deg)` }}>
            <Image src="/noun.svg" alt="Ry Studio Logo" width={44} height={44} className="opacity-90" />
          </div>
          <span className="hidden sm:inline opacity-90">RY STUDIO</span>
        </div>
        <nav>
          <a
            href="#contact"
            className="text-xs sm:text-sm uppercase tracking-widest border border-white/30 px-4 py-2 sm:px-5 sm:py-2 hover:border-white hover:bg-white/10 transition-all duration-500"
          >
            Let's Talk
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Parallax background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transform-gpu"
          style={{
            backgroundImage: `url('/hero-background.jpg')`,
            opacity: Math.max(0.3, 1 - scrollPosition / 1200),
            transform: `scale(1.08) translateY(${scrollPosition * 0.35}px)`,
            transition: 'transform 0.2s ease-out, opacity 0.3s ease-out',
          }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        </div>

        <div className="z-20 text-center px-6 sm:px-8">
          <h1 className="text-6xl sm:text-8xl md:text-[11rem] font-extrabold tracking-tighter leading-[0.9] mb-6 sm:mb-8">
            PREMIUM
            <br />
            WEB DESIGN
          </h1>
          <p className="mt-6 sm:mt-8 text-base sm:text-2xl font-light text-white/80 max-w-xl sm:max-w-4xl mx-auto tracking-wide">
            Exclusive landing pages, portfolios, and custom websites.
            <br className="hidden sm:block" />
            Limited availability.
          </p>
          <a
            href="#work"
            className="mt-10 sm:mt-14 inline-block text-base sm:text-xl tracking-widest border-b-2 border-white/40 pb-1 hover:border-white transition-all duration-700 opacity-80 hover:opacity-100"
          >
            View Selected Work
          </a>
        </div>
      </section>

      {/* Services Section */}
      <AnimatedSection className="bg-neutral-950 text-white p-10 sm:p-20">
        <div className="max-w-6xl mx-auto">
          <span className="text-sm sm:text-base uppercase tracking-widest text-white/50 block mb-6 sm:mb-8">What I Do</span>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-tight mb-10 sm:mb-16">
            Three Services.
            <br />
            One Standard.
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-14">
            {[
              {
                title: 'Landing Pages',
                desc: 'High-converting pages designed to capture attention instantly. Built for speed, optimized for conversions.',
              },
              {
                title: 'Portfolios',
                desc: 'Personal brands that position you as the obvious choice. Your story, told with precision and style.',
              },
              {
                title: 'Custom Websites',
                desc: 'Fully bespoke digital experiences. From concept to launch, tailored to your exact vision.',
              },
            ].map((service, i) => (
              <div key={i} className="group">
                <h3 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4 pb-2 border-b border-white/20 group-hover:border-white transition-all duration-700">
                  {`0${i + 1}. ${service.title}`}
                </h3>
                <p className="text-base sm:text-xl text-white/70 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Showcase Section */}
      <AnimatedSection id="work" className="bg-black text-white p-10 sm:p-20">
        <div className="max-w-7xl mx-auto">
          <span className="text-sm sm:text-base uppercase tracking-widest text-white/50 block mb-6 sm:mb-8">Selected Work</span>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-tight mb-10 sm:mb-16">Recent Projects.</h2>

          <div className="relative">
            {/* Slide Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-[1200ms] ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {showcases.map((project, index) => (
                  <div key={index} className="min-w-full px-2 sm:px-4">
                    <div className="border border-white/20 p-8 sm:p-12 md:p-16 min-h-[500px] sm:min-h-[600px] flex flex-col justify-between backdrop-blur-sm bg-neutral-950/80 hover:border-white/40 transition-all duration-700">
                      <div>
                        <div className="flex items-center gap-4 mb-4 text-xs sm:text-sm tracking-widest text-white/40 uppercase">
                          <span>{project.year}</span>
                          <span>—</span>
                          <span>{project.category}</span>
                        </div>
                        <h3 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 sm:mb-8 leading-[0.95]">
                          {project.title}
                        </h3>
                        <p className="text-lg sm:text-2xl text-white/70 max-w-2xl leading-relaxed">{project.description}</p>
                      </div>
                      <div
                        className="mt-8 sm:mt-12 h-56 sm:h-80 bg-neutral-900 bg-cover bg-center border border-white/10 transition-all duration-700 hover:border-white/30"
                        style={{
                          backgroundImage: `url(${project.image})`,
                          backgroundBlendMode: 'luminosity',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-8 w-12 h-12 sm:w-16 sm:h-16 border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-500 flex items-center justify-center text-xl sm:text-2xl"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-8 w-12 h-12 sm:w-16 sm:h-16 border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-500 flex items-center justify-center text-xl sm:text-2xl"
              aria-label="Next slide"
            >
              →
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-3 mt-10 sm:mt-14">
              {showcases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-[2px] transition-all duration-700 ease-out ${
                    currentSlide === index ? 'w-14 bg-white' : 'w-8 bg-white/40 hover:bg-white/60 hover:w-10'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <AnimatedSection className="bg-neutral-950 text-white p-10 sm:p-20" id="contact">
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-6 sm:mb-10">
            LET'S BUILD
            <br />
            SOMETHING RARE.
          </h2>
          <p className="text-base sm:text-2xl font-light text-white/70 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
            I take on a limited number of projects each month. If you're serious about standing out, let's talk.
          </p>
          <a
            href="mailto:inquire@rystudio.com"
            className="inline-block text-base sm:text-xl uppercase tracking-widest bg-white text-black px-8 sm:px-10 py-3 sm:py-4 hover:bg-white/90 transition-all duration-700 font-semibold"
          >
            Start a Conversation
          </a>
          <p className="mt-8 sm:mt-10 text-sm sm:text-base text-white/50">
            Investment: $3,000 - $12,000 · Timeline: 2-4 weeks
          </p>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-black text-white/60 p-6 sm:p-10 text-xs sm:text-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Crafted with obsession.</p>
          <div className="flex flex-col sm:flex-row sm:space-x-8 items-center gap-2 sm:gap-0">
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-500"
            >
              X/Twitter
            </a>
            <p className="text-xs sm:text-sm">Built with Next.js · Deployed on Vercel</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
