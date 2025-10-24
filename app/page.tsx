'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

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
            Inquire
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
            STRATEGIC
            <br />
            ARCHITECTURE
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-xl font-light text-neutral-300 max-w-md sm:max-w-3xl mx-auto tracking-widest uppercase">
            Next.js & Vercel Mastery for the world’s most demanding digital products.
          </p>
          <a
            href="#impact"
            className="mt-6 sm:mt-12 inline-block text-sm sm:text-lg tracking-widest border-b-2 border-white pb-1 hover:text-neutral-400 transition-colors duration-300"
          >
            Explore Mastery
          </a>
        </div>
      </section>

      {/* Methodology */}
      <AnimatedSection index={1} className="bg-white text-black p-8 sm:p-16">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500 block mb-4 sm:mb-6">
            The Ry Studio Method
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 sm:mb-12">
            Engineering <br />
            Digital Exclusivity.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 border-b border-black pb-1 sm:pb-2">
                01. Impact-First Velocity
              </h3>
              <p className="text-sm sm:text-lg text-neutral-700">
                We design and deploy under a single, unified architecture. Leveraging Next.js
                and Vercel, we bypass conventional latency and deliver 10x performance gains
                on day one.
              </p>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 border-b border-black pb-1 sm:pb-2">
                02. Pixel-Perfect Precision
              </h3>
              <p className="text-sm sm:text-lg text-neutral-700">
                The visual layer is a non-negotiable extension of business logic. Our design
                is inseparable from the code, ensuring an uncompromising user experience.
              </p>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 border-b border-black pb-1 sm:pb-2">
                03. Architecture for Scale
              </h3>
              <p className="text-sm sm:text-lg text-neutral-700">
                From first commit to millions of users, our solutions are inherently scalable,
                maintainable, and built on future-proof pillars of React.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Impact Section */}
      <AnimatedSection index={2} id="impact" className="bg-black text-white p-8 sm:p-16">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500 block mb-4 sm:mb-6">
            Proven Results, Undisclosed Clients
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 sm:mb-12">
            The Value of Silence.
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            <div>
              <p className="text-sm sm:text-xl font-light mb-4 text-neutral-300">
                Our portfolio is intentionally unlisted. Trusted by high-growth startups
                and Fortune 500 companies under strict non-disclosure agreements.
              </p>
            </div>
            <div>
              <p className="text-sm sm:text-xl font-light mb-4 text-neutral-300">
                Quality is measured in ROI and structural elegance, not case studies.
                Your architecture is too valuable to be a gallery piece.
              </p>
            </div>
          </div>
          <div className="mt-8 sm:mt-16 border-t border-neutral-700 pt-4 sm:pt-8">
            <p className="text-sm sm:text-2xl uppercase tracking-widest">
              {'< Confirmed Impact: Next-Gen Commerce, Global Fintech, DeepTech Labs />'}
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
            BEGIN THE
            <br />
            CONVERSATION.
          </h2>
          <p className="text-sm sm:text-xl font-light text-neutral-700 mb-6 sm:mb-10">
            Ry Studio engages with a limited number of projects per quarter. If you require
            world-class Next.js architecture, connect directly.
          </p>
          <a
            href="mailto:inquire@rystudio.com"
            className="inline-block text-sm sm:text-lg uppercase tracking-widest bg-black text-white px-6 sm:px-8 py-2 sm:py-4 hover:bg-neutral-800 transition-colors duration-300"
          >
            Inquire for Service Availability
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-neutral-500 p-4 sm:p-8 text-xs sm:text-sm border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Architectural Mastery.</p>
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
