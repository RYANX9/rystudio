"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, ExternalLink, Github, Menu, X } from 'lucide-react';

export default function RYDevPortfolio() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      const sections = ['hero', 'work', 'process', 'pricing', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const projects = [
    {
      title: "Lumina AI",
      client: "AI Research Platform",
      description: "A sophisticated portfolio showcasing cutting-edge machine learning research with interactive data visualizations and publication archives. Built with performance and accessibility in mind, featuring seamless transitions and an intuitive user experience that highlights complex research in an approachable way.",
      tech: ["Next.js 14", "Tailwind", "Framer Motion", "Three.js"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      link: "#",
      status: "Live"
    },
    {
      title: "Atelier Noir",
      client: "Architecture Studio",
      description: "Minimalist landing page for a Paris-based architecture firm, featuring fullscreen project galleries and seamless navigation. The design emphasizes the studio's modernist approach through clean lines, thoughtful spacing, and a refined aesthetic that lets their architectural work take center stage.",
      tech: ["Next.js 14", "Tailwind", "GSAP", "Sanity CMS"],
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      link: "#",
      status: "Live"
    },
    {
      title: "Maya Chen",
      client: "Product Designer",
      description: "Personal portfolio with case studies, fluid animations, and a custom cursor experience that reflects the designer's attention to detail. Every interaction was crafted to showcase her design philosophy and process, creating an immersive experience that tells the story of her creative journey and expertise.",
      tech: ["Next.js 14", "Tailwind", "Framer Motion"],
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
      link: "#",
      status: "Coming Soon"
    },
    {
      title: "Velocity",
      client: "SaaS Startup",
      description: "High-converting landing page for a productivity tool, optimized for speed and SEO with integrated waitlist functionality. The design focuses on clear messaging and strong calls-to-action to maximize conversions while maintaining a clean, modern aesthetic that appeals to the target audience of busy professionals.",
      tech: ["Next.js 14", "Tailwind", "Analytics"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      link: "#",
      status: "Live"
    }
  ];

  const process = [
    {
      number: "01",
      title: "Discovery",
      description: "We start by understanding your vision, audience, and goals through a detailed consultation. This phase involves deep research into your brand, competitive landscape, and target users to ensure every design decision is strategically informed and aligned with your business objectives."
    },
    {
      number: "02",
      title: "Design",
      description: "I craft a custom design that reflects your brand identity with pixel-perfect attention to detail. From wireframes to high-fidelity mockups, every element is thoughtfully considered to create a cohesive visual language that resonates with your audience and sets you apart from competitors."
    },
    {
      number: "03",
      title: "Development",
      description: "Your site comes to life with clean code, smooth animations, and optimal performance. I build responsive, accessible websites using modern frameworks and best practices, ensuring your site loads fast, works flawlessly across devices, and provides an exceptional user experience."
    },
    {
      number: "04",
      title: "Launch",
      description: "I deploy your site on Vercel with SEO optimization and provide ongoing support. From domain setup to analytics integration, I handle all technical aspects to ensure a smooth launch. Post-launch support ensures your site continues to perform at its best as your business grows."
    }
  ];

  const pricing = [
    {
      name: "Essential",
      price: "€1,200",
      description: "Perfect for individuals",
      features: [
        "5-page portfolio website",
        "Responsive design across all devices",
        "Basic animations and transitions",
        "Contact form integration",
        "SEO fundamentals included",
        "2 rounds of revisions",
        "2-week delivery timeline",
        "Deployment on Vercel"
      ]
    },
    {
      name: "Premium",
      price: "€2,400",
      description: "For professionals",
      features: [
        "Custom design system tailored to your brand",
        "Advanced animations and micro-interactions",
        "CMS integration for easy content updates",
        "Comprehensive SEO optimization",
        "Performance optimization and testing",
        "Unlimited revisions during project",
        "3-week delivery timeline",
        "1 month of post-launch support"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "€4,500",
      description: "For companies",
      features: [
        "Multi-page website with complex architecture",
        "Custom interactions and scroll effects",
        "Blog with full CMS capabilities",
        "Analytics dashboard integration",
        "A/B testing setup for optimization",
        "Priority support and rapid response",
        "4-week delivery timeline",
        "3 months of dedicated support"
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-sans antialiased relative overflow-hidden">
      {/* Animated Logo Elements - Floating across screen */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Right - Moving down and left */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5"
          style={{
            width: '120px',
            height: '120px',
            top: `${100 + scrollY * 0.15}px`,
            right: `${50 - scrollY * 0.08}px`,
            transform: `rotate(${scrollY * 0.05}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
        
        {/* Left Side - Moving down */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5"
          style={{
            width: '100px',
            height: '100px',
            top: `${400 + scrollY * 0.2}px`,
            left: `${20 + scrollY * 0.05}px`,
            transform: `rotate(${-scrollY * 0.03}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
        
        {/* Middle - Moving down and right */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5 hidden md:block"
          style={{
            width: '250px',
            height: '250px',
            top: `${800 + scrollY * 0.25}px`,
            right: `${-50 + scrollY * 0.1}px`,
            transform: `rotate(${scrollY * 0.04}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
        
        {/* Bottom Left - Moving up and right */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5"
          style={{
            width: '140px',
            height: '140px',
            top: `${1400 - scrollY * 0.1}px`,
            left: `${30 + scrollY * 0.12}px`,
            transform: `rotate(${scrollY * 0.06}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
        
        {/* Right Middle - Moving down */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5 hidden md:block"
          style={{
            width: '220px',
            height: '220px',
            top: `${1800 + scrollY * 0.18}px`,
            right: `${100 - scrollY * 0.07}px`,
            transform: `rotate(${-scrollY * 0.04}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
        
        {/* Bottom Center - Moving left */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5"
          style={{
            width: '160px',
            height: '160px',
            top: `${2400 + scrollY * 0.22}px`,
            left: `${20 - scrollY * 0.09}px`,
            transform: `rotate(${scrollY * 0.05}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
        
        {/* Far Right - Moving down and left */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5 hidden md:block"
          style={{
            width: '160px',
            height: '160px',
            top: `${2800 + scrollY * 0.16}px`,
            right: `${50 - scrollY * 0.11}px`,
            transform: `rotate(${-scrollY * 0.05}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
        
        {/* Lower Left - Moving right */}
        <img 
          src="/noun.svg" 
          alt="" 
          className="absolute opacity-[0.03] md:opacity-5"
          style={{
            width: '180px',
            height: '180px',
            top: `${3200 + scrollY * 0.19}px`,
            left: `${-20 + scrollY * 0.13}px`,
            transform: `rotate(${scrollY * 0.04}deg)`,
            transition: 'all 0.1s ease-out'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/noun.svg" alt="RY Studio" className="w-7 h-7 md:w-8 md:h-8" />
            <div className="text-xl md:text-2xl font-light tracking-tight">RY Studio</div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
            <a href="#work" className="text-gray-600 hover:text-gray-900 transition-colors">Work</a>
            <a href="#process" className="text-gray-600 hover:text-gray-900 transition-colors">Process</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#contact" className="px-5 lg:px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-sm">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#work" 
                className="block text-lg text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Work
              </a>
              <a 
                href="#process" 
                className="block text-lg text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Process
              </a>
              <a 
                href="#pricing" 
                className="block text-lg text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#contact" 
                className="block text-center px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-sm mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
          <div className="mb-6 md:mb-8 text-xs md:text-sm text-gray-500 tracking-widest uppercase flex items-center gap-2">
            <img src="/noun.svg" alt="" className="w-3 h-3 md:w-4 md:h-4 opacity-50" />
            Available for Projects
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-light leading-tight mb-6 md:mb-8 tracking-tight" style={{
            transform: `translateY(${scrollY * 0.1}px)`,
            opacity: 1 - scrollY * 0.001
          }}>
            I craft premium<br />
            portfolios & landing<br />
            pages that convert
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl mb-8 md:mb-12 leading-relaxed">
            Specializing in Next.js websites for individuals and companies who value quality, performance, and elegant design. Every project is built with attention to detail and optimized for results.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
            <a href="#work" className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gray-900 text-white hover:bg-gray-800 transition-all group rounded-sm text-center">
              View Work
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#contact" className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 border border-gray-300 hover:border-gray-900 transition-colors rounded-sm text-center">
              Let's Talk
            </a>
          </div>
        </section>

        {/* Work Section */}
        <section id="work" className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16">
            <div className="text-xs md:text-sm text-gray-500 tracking-widest uppercase mb-3 md:mb-4 flex items-center gap-2">
              <img src="/noun.svg" alt="" className="w-3 h-3 md:w-4 md:h-4 opacity-50" />
              Selected Work
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-3 md:mb-4">Recent Projects</h2>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl leading-relaxed">
              A showcase of websites I've designed and developed for clients across different industries. Each project represents a unique challenge solved with thoughtful design and technical excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
            {projects.map((project, index) => (
              <div 
                key={index} 
                className="group cursor-pointer"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.8s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div className="relative overflow-hidden mb-4 md:mb-6 bg-gray-200 rounded-sm" style={{ paddingBottom: '66.67%' }}>
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 md:top-4 right-3 md:right-4 px-2 md:px-3 py-1 bg-white text-xs tracking-wider rounded-sm">
                    {project.status}
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-light mb-1">{project.title}</h3>
                      <div className="text-sm text-gray-500">{project.client}</div>
                    </div>
                    {project.status === "Live" && (
                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="px-2 md:px-3 py-1 bg-gray-100 text-xs tracking-wider rounded-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-white bg-opacity-90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 md:mb-16">
              <div className="text-xs md:text-sm text-gray-500 tracking-widest uppercase mb-3 md:mb-4 flex items-center gap-2">
                <img src="/noun.svg" alt="" className="w-3 h-3 md:w-4 md:h-4 opacity-50" />
                How I Work
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-3 md:mb-4">My Process</h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl leading-relaxed">
                A proven four-step methodology that ensures every project is delivered on time, on budget, and exceeds expectations. From initial concept to final launch, you'll be involved every step of the way.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
              {process.map((step, index) => (
                <div key={index} className="group">
                  <div className="text-5xl md:text-6xl font-light text-gray-200 group-hover:text-gray-900 transition-colors mb-4 md:mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl md:text-2xl font-light mb-3 md:mb-4">{step.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16">
            <div className="text-xs md:text-sm text-gray-500 tracking-widest uppercase mb-3 md:mb-4 flex items-center gap-2">
              <img src="/noun.svg" alt="" className="w-3 h-3 md:w-4 md:h-4 opacity-50" />
              Investment
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4 md:mb-6">Transparent Pricing</h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl leading-relaxed">
              Choose the package that fits your needs. All projects include hosting setup, deployment on Vercel, and a satisfaction guarantee. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {pricing.map((tier, index) => (
              <div 
                key={index} 
                className={`p-6 md:p-8 lg:p-10 border transition-all rounded-sm ${
                  tier.highlighted 
                    ? 'border-gray-900 bg-gray-900 text-white md:scale-105 shadow-xl' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                <div className="mb-6 md:mb-8">
                  <div className={`text-xs md:text-sm tracking-widest uppercase mb-2 ${tier.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                    {tier.name}
                  </div>
                  <div className="text-4xl md:text-5xl font-light mb-2">{tier.price}</div>
                  <div className={`text-sm ${tier.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                    {tier.description}
                  </div>
                </div>
                
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-1 ${tier.highlighted ? 'text-white' : 'text-gray-400'}`}>—</span>
                      <span className={`text-sm md:text-base ${tier.highlighted ? 'text-gray-100' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="#contact" 
                  className={`block text-center py-3 md:py-4 transition-all rounded-sm text-sm md:text-base ${
                    tier.highlighted 
                      ? 'bg-white text-gray-900 hover:bg-gray-100' 
                      : 'border border-gray-900 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-white bg-opacity-90 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-xs md:text-sm text-gray-500 tracking-widest uppercase mb-3 md:mb-4 flex items-center justify-center gap-2">
              <img src="/noun.svg" alt="" className="w-3 h-3 md:w-4 md:h-4 opacity-50" />
              Get In Touch
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light tracking-tight mb-6 md:mb-8 leading-tight">
              Let's Build Something<br />Exceptional Together
            </h2>
            <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Ready to elevate your online presence? Send me an email and let's discuss your project. I typically respond within 24 hours and offer a free consultation to understand your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6 mb-8 md:mb-12">
              <a 
                href="mailto:ryan@rydev.fr" 
                className="inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gray-900 text-white hover:bg-gray-800 transition-colors text-base md:text-lg group rounded-sm"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                ryan@rydev.fr
              </a>
              <a 
                href="https://x.com/ry_devv" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 border border-gray-300 hover:border-gray-900 transition-colors text-base md:text-lg rounded-sm"
              >
                <svg 
                  className="w-4 h-4 md:w-5 md:h-5" 
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                </svg>
                @ry_devv
              </a>
            </div>
            
            <div className="text-xs md:text-sm text-gray-500">
              Working with clients worldwide • Available for new projects
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-12 px-4 sm:px-6 lg:px-12 border-t border-gray-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/noun.svg" alt="RY Studio" className="w-5 h-5 md:w-6 md:h-6" />
              <div className="text-xl md:text-2xl font-light tracking-tight">RY Studio</div>
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              © 2025 RY Studio. All rights reserved.
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <a href="https://github.com" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Github className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="https://x.com/ry_devv" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg 
                  className="w-4 h-4 md:w-5 md:h-5" 
                  viewBox="0 0 16 16" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
