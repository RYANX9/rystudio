'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export default () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      description: 'Real-time data visualization with dark mode and 60fps animations',
    },
    {
      title: 'LUXURY E-COMMERCE',
      category: 'Landing Page',
      year: '2024',
      description: 'Custom checkout experience, mobile-first design, sub-2s load time',
    },
    {
      title: 'FOUNDER PORTFOLIO',
      category: 'Personal Brand',
      year: '2024',
      description: 'Minimal design with smooth scroll and story-driven narrative',
    },
    {
      title: 'SAAS PRODUCT SITE',
      category: 'Marketing Site',
      year: '2023',
      description: 'A/B tested landing page with 40% conversion rate, SEO optimized',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono antialiased overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-8 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold tracking-wider">
          <div
            className="transition-transform duration-1000"
            style={{ transform: `rotate(${scrollPosition * 0.1}deg)` }}
          >
            <Image
              src="/noun.svg"
              alt="Ry Studio Logo"
              width={40}
              height={40}
              className="invert-0 dark:invert"
            />
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
        className="min-h-screen flex items-center justify-center relative bg-neutral-900 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url('/placeholder-background.jpg')`,
            opacity: 1 - scrollPosition / 800,
            transform: `scale(1.1) translateY(${scrollPosition * 0.3}px)`,
          }}
        >
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
        </div>

        <div className="z-20 text-center px-4 sm:px-8">
          <h1 className="text-4xl sm:text-7xl md:text-9xl font-extrabold tracking-tight sm:tracking-tighter mix-blend-difference leading-tight sm:leading-none">
            PREMIUM
            <br />
            WEB DESIGN
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-xl font-light text-neutral-300 max-w-md sm:max-w-3xl mx-auto tracking-widest uppercase">
            Exclusive landing pages, portfolios, and custom websites. Limited slots available.
          </p>
          <a
            href="#work"
            className="mt-6 sm:mt-12 inline-block text-sm sm:text-lg tracking-widest border-b-2 border-white pb-1 hover:text-neutral-400 transition-colors duration-300"
          >
            View Selected Work
          </a>
        </div>
      </section>

      {/* What I Do */}
      <AnimatedSection index={1} className="bg-white text-black p-8 sm:p-16">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500 block mb-4 sm:mb-6">
            What You Get
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 sm:mb-12">
            Three Services.
            <br />
            One Standard.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 border-b border-black pb-1 sm:pb-2">
                01. Landing Pages
              </h3>
              <p className="text-sm sm:text-lg text-neutral-700">
                High-converting pages designed to capture attention instantly. Built for speed, optimized for results.
              </p>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 border-b border-black pb-1 sm:pb-2">
                02. Portfolios
              </h3>
              <p className="text-sm sm:text-lg text-neutral-700">
                Personal brands that position you as the obvious choice. Your story, told with precision and style.
              </p>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 border-b border-black pb-1 sm:pb-2">
                03. Custom Websites
              </h3>
              <p className="text-sm sm:text-lg text-neutral-700">
                Fully bespoke digital experiences. From concept to launch, tailored to your exact vision.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Showcase Section - Horizontal Slideshow */}
      <AnimatedSection index={2} id="work" className="bg-black text-white p-8 sm:p-16">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500 block mb-4 sm:mb-6">
            Selected Work
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 sm:mb-12">
            Recent Projects.
          </h2>

          {/* Horizontal Slideshow */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {showcases.map((project, index) => (
                <div key={index} className="min-w-full px-4">
                  <div className="border border-neutral-800 p-8 sm:p-12 md:p-16 min-h-[400px] sm:min-h-[500px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4 text-xs tracking-widest text-neutral-600 uppercase">
                        <span>{project.year}</span>
                        <span>—</span>
                        <span>{project.category}</span>
                      </div>
                      <h3 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                        {project.title}
                      </h3>
                      <p className="text-base sm:text-xl text-neutral-400 max-w-2xl">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-8 sm:mt-12 h-48 sm:h-64 bg-neutral-900 border border-neutral-800"></div>
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
                  className={`h-2 transition-all duration-300 ${
                    currentSlide === index ? 'w-12 bg-white' : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-neutral-500 text-sm sm:text-base">
              Full case studies available upon request. Some work under NDA.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <section
        id="contact"
        className="min-h-[50vh] flex items-center justify-center bg-white text-black p-8 sm:p-16"
      >
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-tight mb-4 sm:mb-8">
            LET'S BUILD
            <br />
            SOMETHING RARE.
          </h2>
          <p className="text-sm sm:text-xl font-light text-neutral-700 mb-6 sm:mb-10">
            I respond to every inquiry within 24 hours. Limited slots available each month.
          </p>
          <a
            href="mailto:inquire@rystudio.com"
            className="inline-block text-sm sm:text-lg uppercase tracking-widest bg-black text-white px-6 sm:px-8 py-2 sm:py-4 hover:bg-neutral-800 transition-colors duration-300"
          >
            Start a Conversation
          </a>
          <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-neutral-600">
            Investment: $3,000 - $12,000 | Timeline: 2-4 weeks
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-neutral-500 p-4 sm:p-8 text-xs sm:text-sm border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Crafted with obsession.</p>
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-center">
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300 mb-1 sm:mb-0"
            >
              X/Twitter
            </a>
            <p className="text-xs sm:text-sm">Built with Next.js and Vercel</p>
          </div>
        </div>
      </footer>
    </main>
  );
};
