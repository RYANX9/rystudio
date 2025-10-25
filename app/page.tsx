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

  const AnimatedSection: React.FC<{ children: React.ReactNode; index: number; className?: string; id?: string }> = ({
    children,
    index,
    className = '',
    id,
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setTimeout(() => setIsVisible(true), index * 100);
        },
        { rootMargin: '-100px', threshold: 0.15 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => ref.current && observer.unobserve(ref.current);
    }, [index]);

    return (
      <section
        ref={ref as React.MutableRefObject<HTMLElement>}
        id={id}
        className={`min-h-screen relative overflow-hidden flex flex-col justify-center ${className}`}
      >
        <div
          className={`transition-all duration-[1400ms] ease-out ${
            isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-16 blur-sm'
          } w-full`}
        >
          {children}
        </div>
      </section>
    );
  };

  const FadeInText: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
    children,
    delay = 0,
    className = '',
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setTimeout(() => setIsVisible(true), delay);
        },
        { threshold: 0.2 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => ref.current && observer.unobserve(ref.current);
    }, [delay]);

    return (
      <div
        ref={ref}
        className={`transition-all duration-[1600ms] ease-out ${
          isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-sm'
        } ${className}`}
      >
        {children}
      </div>
    );
  };

  const showcases = [
    {
      title: 'FINTECH DASHBOARD',
      category: 'Web Application',
      year: '2024',
      description: 'Real-time analytics, dark mode, 60fps transitions.',
      image: '/projects/fintech-dashboard.jpg',
    },
    {
      title: 'LUXURY E-COMMERCE',
      category: 'Landing Page',
      year: '2024',
      description: 'High-converting landing pages, mobile-first, sub-2s load.',
      image: '/projects/luxury-ecommerce.jpg',
    },
    {
      title: 'FOUNDER PORTFOLIO',
      category: 'Personal Brand',
      year: '2024',
      description: 'Minimalistic storytelling with smooth parallax scroll.',
      image: '/projects/founder-portfolio.jpg',
    },
    {
      title: 'SAAS PRODUCT SITE',
      category: 'Marketing Site',
      year: '2023',
      description: 'A/B optimized landing page, 40% conversion increase.',
      image: '/projects/saas-site.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % showcases.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <main className="min-h-screen bg-black text-white font-mono antialiased overflow-x-hidden">
      {/* Ambient cursor glow */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.08), transparent 40%)`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-8 flex justify-between items-center backdrop-blur-sm bg-black/50">
        <div className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold tracking-wider">
          <div className="transition-all duration-700 ease-out" style={{ transform: `rotate(${scrollPosition * 0.05}deg)` }}>
            <Image src="/noun.svg" alt="Ry Studio Logo" width={40} height={40} className="opacity-90" />
          </div>
          <span className="hidden sm:inline opacity-90">RY STUDIO</span>
        </div>
        <nav>
          <a
            href="#contact"
            className="text-xs sm:text-sm uppercase tracking-widest border border-white/30 px-3 py-1 sm:px-4 sm:py-2 hover:border-white hover:bg-white/10 transition-all duration-500"
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
            opacity: Math.max(0.4, 1 - scrollPosition / 1200),
            transform: `scale(1.08) translateY(${scrollPosition * 0.35}px)`,
            transition: 'transform 0.2s ease-out, opacity 0.3s ease-out',
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
        </div>

        <div className="z-20 text-center px-4 sm:px-8">
          <FadeInText delay={200}>
            <h1 className="text-5xl sm:text-8xl md:text-9xl font-extrabold tracking-tight sm:tracking-tighter leading-tight sm:leading-none">
              PREMIUM
              <br />
              WEB DESIGN
            </h1>
          </FadeInText>

          <FadeInText delay={600} className="mt-4 sm:mt-6">
            <p className="text-sm sm:text-xl font-light text-white/80 max-w-md sm:max-w-3xl mx-auto tracking-widest uppercase">
              Exclusive landing pages, portfolios, and custom websites. Limited slots available.
            </p>
          </FadeInText>

          <FadeInText delay={1000}>
            <a
              href="#work"
              className="mt-6 sm:mt-12 inline-block text-sm sm:text-lg tracking-widest border-b border-white/40 pb-1 hover:border-white transition-all duration-700 opacity-80 hover:opacity-100"
            >
              View Selected Work
            </a>
          </FadeInText>
        </div>
      </section>

      {/* Section Spacers */}
      <div className="h-32 bg-gradient-to-b from-black via-neutral-900 to-neutral-800" />

      {/* Services Section */}
      <AnimatedSection index={1} className="bg-neutral-900 text-white p-8 sm:p-16">
        <div className="max-w-6xl mx-auto">
          <FadeInText delay={0}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-white/60 block mb-4 sm:mb-6">
              What You Get
            </span>
          </FadeInText>

          <FadeInText delay={200}>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 sm:mb-12">
              Three Services.
              <br />
              One Standard.
            </h2>
          </FadeInText>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            {['Landing Pages', 'Portfolios', 'Custom Websites'].map((service, i) => (
              <FadeInText key={i} delay={400 + i * 200}>
                <div className="group">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20 group-hover:border-white transition-all duration-700">
                    {`0${i + 1}. ${service}`}
                  </h3>
                  <p className="text-sm sm:text-lg text-white/70 leading-relaxed">
                    {service === 'Landing Pages'
                      ? 'High-converting pages designed to capture attention instantly. Built for speed, optimized for results.'
                      : service === 'Portfolios'
                      ? 'Personal brands that position you as the obvious choice. Your story, told with precision and style.'
                      : 'Fully bespoke digital experiences. From concept to launch, tailored to your exact vision.'}
                  </p>
                </div>
              </FadeInText>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Gradient Spacer */}
      <div className="h-32 bg-gradient-to-b from-neutral-900 via-black to-neutral-800" />

      {/* Showcase Section */}
      <AnimatedSection index={2} id="work" className="bg-black text-white p-8 sm:p-16">
        <div className="max-w-7xl mx-auto">
          <FadeInText delay={0}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-white/60 block mb-4 sm:mb-6">
              Selected Work
            </span>
          </FadeInText>

          <FadeInText delay={200}>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 sm:mb-12">
              Recent Projects.
            </h2>
          </FadeInText>

          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-[1200ms] ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {showcases.map((project, index) => (
                <div key={index} className="min-w-full px-4">
                  <div className="border border-white/20 p-8 sm:p-12 md:p-16 min-h-[400px] sm:min-h-[500px] flex flex-col justify-between backdrop-blur-sm bg-black/70 hover:border-white/50 transition-all duration-700">
                    <div>
                      <div className="flex items-center gap-4 mb-4 text-xs tracking-widest text-white/50 uppercase opacity-60">
                        <span>{project.year}</span>
                        <span>—</span>
                        <span>{project.category}</span>
                      </div>
                      <h3 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-base sm:text-xl text-white/70 max-w-2xl leading-relaxed opacity-80">{project.description}</p>
                    </div>
                    <div
                      className="mt-8 sm:mt-12 h-48 sm:h-64 bg-cover bg-center border border-white/20 backdrop-blur-sm transition-all duration-700 hover:border-white/50"
                      style={{ backgroundImage: `url(${project.image})` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-3 mt-8 sm:mt-12">
              {showcases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-[2px] transition-all duration-700 ease-out ${
                    currentSlide === index ? 'w-12 bg-white opacity-100' : 'w-8 bg-white/50 opacity-40 hover:opacity-70 hover:w-10'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <section id="contact" className="min-h-[70vh] flex items-center justify-center bg-neutral-900 text-white p-8 sm:p-16">
        <div className="text-center max-w-4xl mx-auto">
          <FadeInText delay={0}>
            <h2 className="text-3xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-tight mb-4 sm:mb-8">
              LET'S BUILD
              <br />
              SOMETHING RARE.
            </h2>
          </FadeInText>

          <FadeInText delay={300}>
            <p className="text-sm sm:text-xl font-light text-white/70 mb-6 sm:mb-10 leading-relaxed">
              I respond to every inquiry within 24 hours. Limited slots available each month.
            </p>
          </FadeInText>

          <FadeInText delay={600}>
            <a
              href="mailto:inquire@rystudio.com"
              className="inline-block text-sm sm:text-lg uppercase tracking-widest bg-white/10 text-white px-6 sm:px-8 py-2 sm:py-4 hover:bg-white/20 transition-all duration-700"
            >
              Start a Conversation
            </a>
          </FadeInText>

          <FadeInText delay={900}>
            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-white/50 opacity-70">
              Investment: $3,000 - $12,000 | Timeline: 2-4 weeks
            </p>
          </FadeInText>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white/70 p-4 sm:p-8 text-xs sm:text-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 opacity-70">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Crafted with obsession.</p>
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-center">
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-500 mb-1 sm:mb-0"
            >
              X/Twitter
            </a>
            <p className="text-xs sm:text-sm">Built with Next.js and Vercel</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
