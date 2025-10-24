'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

const RyStudioLanding = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Simple scroll utility to control effects based on scroll position
  const handleScroll = useCallback(() => {
    setScrollPosition(window.pageYOffset);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Utility component for parallax/scroll-based visibility (simplified for single-file use)
  const AnimatedSection: React.FC<{ children: React.ReactNode; index: number; className?: string }> = ({
    children,
    index,
    className = '',
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { rootMargin: '0px', threshold: 0.1 }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }, []);

    // Staggered reveal effect based on isVisible state
    const revealClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12';

    return (
      <section ref={ref as React.MutableRefObject<HTMLElement>} className={`min-h-screen relative overflow-hidden flex flex-col justify-center ${className}`}>
        <div className={`transition-all duration-1000 ease-out ${revealClass} w-full`}>
          {children}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono antialiased overflow-x-hidden">
      {/* --- Global Header (Fixed) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center space-x-3 text-xl font-bold tracking-wider">
          {/* Logo Component with Rotation Effect */}
          <div
            className="transition-transform duration-1000"
            style={{
              transform: `rotate(${scrollPosition * 0.1}deg)`,
            }}
          >
            <Image
              src="/noun.svg"
              alt="Ry Studio Logo"
              width={50}
              height={50}
              // The black logo needs to be visible against the current mix-blend-difference header
              // For full reliability, the mix-blend-difference is on the header container.
              className="invert-0 dark:invert" // Ensure it appears white against dark backgrounds if mix-blend fails in some contexts
            />
          </div>
          <span className="hidden sm:inline">RY STUDIO</span>
        </div>
        <nav>
          <a
            href="#contact"
            className="text-sm uppercase tracking-widest border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors duration-300"
          >
            Inquire
          </a>
        </nav>
      </header>

      {/* --- 1. Hero Section (Cinematic Entrance) --- */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center relative bg-neutral-900 overflow-hidden"
      >
        {/* Cinematic Black Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />

        {/* Dynamic Background Element */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url('/placeholder-background.jpg')`, // Replace with a high-res abstract background image
            opacity: 1 - scrollPosition / 800,
            transform: `scale(1.1) translateY(${scrollPosition * 0.3}px)`, // Subtle Parallax
          }}
        >
          {/* Placeholder for visual flair */}
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
        </div>

        <div className="z-20 text-center px-4">
          <h1 className="text-7xl sm:text-9xl font-extrabold tracking-tighter mix-blend-difference leading-none">
            STRATEGIC
            <br />
            ARCHITECTURE
          </h1>
          <p className="mt-6 text-xl sm:text-2xl font-light text-neutral-300 max-w-3xl mx-auto tracking-widest uppercase">
            Next.js & Vercel Mastery for the world’s most demanding digital products.
          </p>
          <a
            href="#impact"
            className="mt-12 inline-block text-lg tracking-widest border-b-2 border-white pb-1 hover:text-neutral-400 transition-colors duration-300"
          >
            Explore Mastery
          </a>
        </div>
      </section>

      {/* --- 2. Mastery/Methodology (Replaces About/Philosophy) --- */}
      <AnimatedSection index={1} className="bg-white text-black p-16 sm:p-24">
        <div className="max-w-6xl mx-auto">
          <span className="text-sm uppercase tracking-widest text-neutral-500 block mb-6">
            The Ry Studio Method
          </span>
          <h2 className="text-5xl sm:text-7xl font-bold leading-tight mb-12">
            Engineering <br />
            Digital Exclusivity.
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Principle 1: Velocity */}
            <div>
              <h3 className="text-2xl font-semibold mb-3 border-b border-black pb-2">
                01. Impact-First Velocity
              </h3>
              <p className="text-lg text-neutral-700">
                We design and deploy under a single, unified architecture. Leveraging
                Next.js and Vercel, we bypass the conventional latency of development,
                delivering 10x performance gains on day one.
              </p>
            </div>
            {/* Principle 2: Precision */}
            <div>
              <h3 className="text-2xl font-semibold mb-3 border-b border-black pb-2">
                02. Pixel-Perfect Precision
              </h3>
              <p className="text-lg text-neutral-700">
                The visual layer is a non-negotiable extension of the business logic.
                Our design is functionally inseparable from the code, guaranteeing
                an uncompromising, jaw-dropped user experience.
              </p>
            </div>
            {/* Principle 3: Scale */}
            <div>
              <h3 className="text-2xl font-semibold mb-3 border-b border-black pb-2">
                03. Architecture for Scale
              </h3>
              <p className="text-lg text-neutral-700">
                From initial commit to millions of users, our solutions are inherently
                scalable, maintainable, and built on the future-proof pillars of the
                React ecosystem.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* --- 3. Impact & Exclusivity (Replaces Work Showcase) --- */}
      <AnimatedSection index={2} id="impact" className="bg-black text-white p-16 sm:p-24">
        <div className="max-w-6xl mx-auto">
          <span className="text-sm uppercase tracking-widest text-neutral-500 block mb-6">
            Proven Results, Undisclosed Clients
          </span>
          <h2 className="text-5xl sm:text-7xl font-bold leading-tight mb-12">
            The Value of Silence.
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Statement 1 */}
            <div>
              <p className="text-xl sm:text-3xl font-light mb-4 text-neutral-300">
                Our portfolio is intentionally unlisted. We are trusted by high-growth
                startups and Fortune 500 companies who operate under strict **Non-Disclosure
                Agreements**.
              </p>
            </div>
            {/* Statement 2 */}
            <div>
              <p className="text-xl sm:text-3xl font-light mb-4 text-neutral-300">
                The quality of our work is measured in **ROI and structural elegance**,
                not public case studies. Your digital architecture is too valuable to
                be a gallery piece.
              </p>
            </div>
          </div>
          <div className="mt-16 border-t border-neutral-700 pt-8">
            <p className="text-2xl uppercase tracking-widest">
              {'< Confirmed Impact: Next-Gen Commerce, Global Fintech, DeepTech Labs />'}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* --- 4. Call to Action (Exclusive Inquiry) --- */}
      <section id="contact" className="min-h-[50vh] flex items-center justify-center bg-white text-black p-16 sm:p-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-6xl sm:text-8xl font-bold tracking-tighter leading-none mb-8">
            BEGIN THE
            <br />
            CONVERSATION.
          </h2>
          <p className="text-xl sm:text-2xl font-light text-neutral-700 mb-10">
            Ry Studio engages with a limited number of projects per quarter.
            If you require world-class Next.js architecture and are ready to
            discuss the scope of your vision, connect directly.
          </p>
          <a
            href="mailto:inquire@rystudio.com"
            className="inline-block text-lg uppercase tracking-widest bg-black text-white px-8 py-4 hover:bg-neutral-800 transition-colors duration-300"
          >
            Inquire for Service Availability
          </a>
        </div>
      </section>

      {/* --- 5. Footer --- */}
      <footer className="bg-black text-neutral-500 p-8 text-sm border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Architectural Mastery.</p>
          <div className="flex space-x-6">
            <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
              X/Twitter
            </a>
            <p>Built with Next.js and Vercel</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default RyStudioLanding;