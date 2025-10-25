'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export default () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleScroll = useCallback(() => {
    setScrollPosition(window.pageYOffset);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

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
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), index * 100);
          }
        },
        { rootMargin: '-100px', threshold: 0.15 }
      );

      if (ref.current) observer.observe(ref.current);
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }, [index]);

    return (
      <section
        ref={ref as React.MutableRefObject<HTMLElement>}
        id={id}
        className={`min-h-screen relative overflow-hidden flex flex-col justify-center ${className}`}
      >
        <div
          className={`transition-all duration-[1400ms] ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          } w-full`}
        >
          {children}
        </div>
      </section>
    );
  };

  const FadeInText: React.FC<{
    children: React.ReactNode;
    delay?: number;
    className?: string;
  }> = ({ children, delay = 0, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
          }
        },
        { threshold: 0.2 }
      );

      if (ref.current) observer.observe(ref.current);
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }, [delay]);

    return (
      <div
        ref={ref}
        className={`transition-all duration-[1600ms] ease-out ${
          isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'
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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Interpolated black-white transition helper
  const getSmoothBackground = (scroll: number) => {
    const sections = [0, 900, 1800, 2700];
    const colors = ['#000000', '#f5f5f5', '#000000', '#f5f5f5'];
    let bg = colors[0];
    for (let i = 0; i < sections.length - 1; i++) {
      if (scroll >= sections[i] && scroll < sections[i + 1]) {
        const t = (scroll - sections[i]) / (sections[i + 1] - sections[i]);
        const c0 = parseInt(colors[i].slice(1), 16);
        const c1 = parseInt(colors[i + 1].slice(1), 16);
        const r = Math.round(((c1 >> 16) & 0xff) * t + ((c0 >> 16) & 0xff) * (1 - t));
        const g = Math.round(((c1 >> 8) & 0xff) * t + ((c0 >> 8) & 0xff) * (1 - t));
        const b = Math.round((c1 & 0xff) * t + (c0 & 0xff) * (1 - t));
        bg = `rgb(${r},${g},${b})`;
        break;
      }
    }
    return bg;
  };

  return (
    <main
      className="min-h-screen font-mono antialiased overflow-x-hidden transition-colors duration-700"
      style={{ backgroundColor: getSmoothBackground(scrollPosition) }}
    >
      {/* Ambient cursor glow */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-8 flex justify-between items-center transition-colors duration-700">
        <div className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold tracking-wider">
          <div
            className="transition-all duration-700 ease-out"
            style={{ transform: `rotate(${scrollPosition * 0.05}deg)` }}
          >
            <Image
              src="/noun.svg"
              alt="Ry Studio Logo"
              width={40}
              height={40}
              className={`invert-0 dark:invert opacity-90 transition-colors duration-700`}
            />
          </div>
          <span className="hidden sm:inline opacity-90">RY STUDIO</span>
        </div>
        <nav>
          <a
            href="#contact"
            className="text-xs sm:text-sm uppercase tracking-widest border border-white/30 px-3 py-1 sm:px-4 sm:py-2 hover:border-white hover:bg-white/5 transition-all duration-500 backdrop-blur-sm"
          >
            Let's Talk
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-neutral-900/60 to-black z-10" />

        {/* Parallax background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url('/placeholder-background.jpg')`,
            transform: `scale(1.05) translateY(${scrollPosition * 0.4}px)`,
            opacity: Math.max(0.4, 1 - scrollPosition / 1200),
          }}
        >
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px]" />
        </div>

        {/* Grain overlay */}
        <div className="absolute inset-0 z-10 opacity-[0.015] mix-blend-overlay pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            }}
          />
        </div>

        <div className="z-20 text-center px-4 sm:px-8">
          <FadeInText delay={200}>
            <h1 className="text-4xl sm:text-7xl md:text-9xl font-extrabold tracking-tight sm:tracking-tighter leading-tight sm:leading-none">
              PREMIUM
              <br />
              WEB DESIGN
            </h1>
          </FadeInText>

          <FadeInText delay={600} className="mt-4 sm:mt-6">
            <p className="text-sm sm:text-xl font-light text-neutral-300 max-w-md sm:max-w-3xl mx-auto tracking-widest uppercase opacity-80">
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

      {/* Sections and showcase remain unchanged except black-white transitions now use smooth background */}
      {/* What I Do */}
      <AnimatedSection index={1} className="bg-transparent text-black p-8 sm:p-16">
        <div className="max-w-6xl mx-auto">
          <FadeInText delay={0}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500 block mb-4 sm:mb-6">
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
            {['Landing Pages', 'Portfolios', 'Custom Websites'].map((service, idx) => (
              <FadeInText key={service} delay={400 + idx * 200}>
                <div className="group">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-black/20 group-hover:border-black transition-all duration-700">
                    0{idx + 1}. {service}
                  </h3>
                  <p className="text-sm sm:text-lg text-neutral-700 leading-relaxed">
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

      {/* Showcase Section */}
      <AnimatedSection index={2} id="work" className="bg-transparent text-white p-8 sm:p-16">
        <div className="max-w-7xl mx-auto">
          <FadeInText delay={0}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-500 block mb-4 sm:mb-6">
              Selected Work
            </span>
          </FadeInText>

          <FadeInText delay={200}>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 sm:mb-12">
              Recent Projects.
            </h2>
          </FadeInText>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-[1200ms] ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {showcases.map((project, index) => (
                <div key={index} className="min-w-full px-4">
                  <div className="border border-neutral-800/50 p-8 sm:p-12 md:p-16 min-h-[400px] sm:min-h-[500px] flex flex-col justify-between backdrop-blur-sm bg-neutral-950/30 hover:border-neutral-700/70 transition-all duration-700">
                    <div>
                      <div className="flex items-center gap-4 mb-4 text-xs tracking-widest text-neutral-600 uppercase opacity-60">
                        <span>{project.year}</span>
                        <span>—</span>
                        <span>{project.category}</span>
                      </div>
                      <h3 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-base sm:text-xl text-neutral-400 max-w-2xl leading-relaxed opacity-80">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-8 sm:mt-12 h-48 sm:h-64 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/30 backdrop-blur-sm transition-all duration-700 hover:border-neutral-700/50" />
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
                    currentSlide === index
                      ? 'w-12 bg-white opacity-100'
                      : 'w-8 bg-neutral-700 opacity-40 hover:opacity-70 hover:w-10'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <FadeInText delay={400}>
            <div className="mt-12 sm:mt-16 text-center">
              <p className="text-neutral-500 text-sm sm:text-base opacity-60">
                Full case studies available upon request. Some work under NDA.
              </p>
            </div>
          </FadeInText>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <section
        id="contact"
        className="min-h-[70vh] flex items-center justify-center p-8 sm:p-16"
        style={{ backgroundColor: '#f5f5f5', color: '#000000' }}
      >
        <div className="text-center max-w-4xl mx-auto">
          <FadeInText delay={0}>
            <h2 className="text-3xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-tight mb-4 sm:mb-8">
              LET'S BUILD
              <br />
              SOMETHING RARE.
            </h2>
          </FadeInText>

          <FadeInText delay={300}>
            <p className="text-sm sm:text-xl font-light text-neutral-700 mb-6 sm:mb-10 leading-relaxed">
              I respond to every inquiry within 24 hours. Limited slots available each month.
            </p>
          </FadeInText>

          <FadeInText delay={600}>
            <a
              href="mailto:inquire@rystudio.com"
              className="inline-block text-sm sm:text-lg uppercase tracking-widest bg-black text-white px-6 sm:px-8 py-2 sm:py-4 hover:bg-neutral-800 transition-all duration-700"
            >
              Start a Conversation
            </a>
          </FadeInText>

          <FadeInText delay={900}>
            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-neutral-600 opacity-70">
              Investment: $3,000 - $12,000 | Timeline: 2-4 weeks
            </p>
          </FadeInText>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-4 sm:p-8 text-xs sm:text-sm border-t border-neutral-200 opacity-70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} Ry Studio. Crafted with obsession.</p>
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-center">
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors duration-500 mb-1 sm:mb-0"
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
                            
