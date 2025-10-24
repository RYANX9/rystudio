"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Mail, ExternalLink, Github, Sparkles, Zap, Code2 } from 'lucide-react';

export default function RYDevPortfolioV2() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const logoRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const projects = [
    {
      title: "Lumina AI",
      client: "AI Research Platform",
      description: "A sophisticated portfolio showcasing cutting-edge machine learning research with interactive data visualizations, publication archives, and real-time collaboration tools. The platform features custom dashboards for researchers to track their work and share findings with the global AI community.",
      tech: ["Next.js 14", "Tailwind", "Framer Motion", "Three.js", "TensorFlow.js"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      link: "#",
      status: "Live",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Atelier Noir",
      client: "Architecture Studio",
      description: "Minimalist landing page for a Paris-based architecture firm, featuring fullscreen project galleries, seamless navigation, and an immersive visual experience. The site showcases their portfolio of modern buildings through high-resolution imagery and thoughtful interactions that reflect their design philosophy.",
      tech: ["Next.js 14", "Tailwind", "GSAP", "Sanity CMS", "Sharp"],
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      link: "#",
      status: "Live",
      color: "from-gray-700 to-gray-900"
    },
    {
      title: "Maya Chen",
      client: "Product Designer",
      description: "Personal portfolio with detailed case studies, fluid animations, and a custom cursor experience that reflects the designer's attention to detail. Every interaction was crafted to showcase her design philosophy, process, and the stories behind her most impactful projects. Features an integrated blog and newsletter system.",
      tech: ["Next.js 14", "Tailwind", "Framer Motion", "MDX", "Resend"],
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
      link: "#",
      status: "Coming Soon",
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "Velocity",
      client: "SaaS Startup",
      description: "High-converting landing page for a productivity tool, optimized for speed and SEO with integrated waitlist functionality. The design focuses on clear messaging, strong calls-to-action, and social proof to maximize conversions. Built with performance in mind, achieving perfect Lighthouse scores across all metrics.",
      tech: ["Next.js 14", "Tailwind", "Analytics", "Vercel AI", "Stripe"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      link: "#",
      status: "Live",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Nova Finance",
      client: "Fintech Startup",
      description: "Comprehensive web platform for a modern banking solution, featuring account management, transaction tracking, and financial insights. Built with security-first architecture and real-time updates. The interface prioritizes clarity and trust while maintaining a contemporary aesthetic that appeals to tech-savvy users.",
      tech: ["Next.js 14", "Tailwind", "Chart.js", "Plaid API", "Prisma"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      link: "#",
      status: "Live",
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "Essence Wellness",
      client: "Health & Wellness",
      description: "E-commerce platform for a premium wellness brand, featuring product showcases, educational content, and seamless checkout experience. The design balances sophistication with approachability, using calming colors and smooth animations to create a relaxing shopping experience that reflects the brand's holistic philosophy.",
      tech: ["Next.js 14", "Tailwind", "Shopify", "Contentful", "Klaviyo"],
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
      link: "#",
      status: "Live",
      color: "from-green-400 to-teal-500"
    }
  ];

  const process = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Discovery",
      description: "We start by understanding your vision, audience, and goals through a detailed consultation. This phase involves deep research into your brand, competitive landscape, and target users to ensure every design decision is strategically informed and aligned with your business objectives. I'll ask the right questions to uncover what makes your project unique.",
      duration: "3-5 days"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Design",
      description: "I craft a custom design that reflects your brand identity with pixel-perfect attention to detail. From wireframes to high-fidelity mockups, every element is thoughtfully considered to create a cohesive visual language that resonates with your audience and sets you apart from competitors. You'll receive interactive prototypes for feedback.",
      duration: "1-2 weeks"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Development",
      description: "Your site comes to life with clean code, smooth animations, and optimal performance. I build responsive, accessible websites using modern frameworks and best practices, ensuring your site loads fast, works flawlessly across devices, and provides an exceptional user experience. Regular updates keep you informed throughout the build.",
      duration: "2-3 weeks"
    },
    {
      icon: <ArrowRight className="w-6 h-6" />,
      title: "Launch",
      description: "I deploy your site on Vercel with SEO optimization and provide ongoing support. From domain setup to analytics integration, I handle all technical aspects to ensure a smooth launch. Post-launch support ensures your site continues to perform at its best as your business grows. You'll receive training on managing your content.",
      duration: "2-3 days"
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$1,500",
      euroPrice: "€1,400",
      description: "For individuals getting started",
      features: [
        "5-page responsive website",
        "Mobile-first design approach",
        "Basic animations and transitions",
        "Contact form with email notifications",
        "SEO fundamentals and meta tags",
        "Google Analytics integration",
        "2 rounds of revisions included",
        "2-week delivery timeline",
        "Deployment on Vercel hosting",
        "1 week of post-launch support"
      ]
    },
    {
      name: "Professional",
      price: "$3,000",
      euroPrice: "€2,800",
      description: "For established professionals",
      features: [
        "Custom design system tailored to brand",
        "Advanced animations and micro-interactions",
        "CMS integration for easy content updates",
        "Comprehensive SEO optimization",
        "Performance optimization under 2s load time",
        "Newsletter integration (Mailchimp/ConvertKit)",
        "Blog with markdown support",
        "Unlimited revisions during project",
        "3-week delivery timeline",
        "1 month of dedicated post-launch support",
        "Video tutorial for content management"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "$5,500",
      euroPrice: "€5,200",
      description: "For growing companies",
      features: [
        "Multi-page website with complex architecture",
        "Custom interactions and scroll effects",
        "Full CMS with multi-user capabilities",
        "E-commerce integration (optional)",
        "Advanced analytics dashboard setup",
        "A/B testing infrastructure",
        "Multi-language support (optional)",
        "API integrations (CRM, payments, etc.)",
        "Priority support with 24h response time",
        "4-week delivery timeline",
        "3 months of dedicated support",
        "Monthly performance reports"
      ]
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans antialiased relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #333 1px, transparent 1px),
            linear-gradient(to bottom, #333 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
        }}></div>
      </div>

      {/* Magnetic Logo Cursor Effect */}
      {isHovering && (
        <div 
          className="fixed pointer-events-none z-50 transition-all duration-300"
          style={{
            left: mousePosition.x - 20,
            top: mousePosition.y - 20,
          }}
        >
          <img src="/noun.svg" alt="" className="w-12 h-12 opacity-30 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black bg-opacity-50 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center justify-between"> {/* Reduced py-4 to py-3 */}
          <div className="flex items-center gap-2 group">
            <div className="relative">
              <img src="/noun.svg" alt="RY Dev" className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity"></div>
            </div>
            <div className="text-xl font-bold tracking-tighter">RY<span className="text-blue-500">.</span>DEV</div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-medium">
            <a href="#work" className="text-gray-400 hover:text-white transition-colors">Work</a>
            <a href="#process" className="text-gray-400 hover:text-white transition-colors">Process</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto min-h-screen flex flex-col justify-center overflow-hidden"> {/* Reduced pt-32 pb-24 to pt-28 pb-20 */}
        {/* Rotating Logo Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <img 
            src="/noun.svg" 
            alt="" 
            className="w-72 h-72 lg:w-[500px] lg:h-[500px] opacity-5"
            style={{
              transform: `rotate(${scrollY * 0.1}deg) scale(${1 + scrollY * 0.0005})`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        </div>

        <div className="relative z-10">
        
          <h1 className="text-5xl lg:text-7xl font-bold leading-snug mb-4 tracking-tighter"> {/* Reduced mb-6 to mb-4 */}
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Building Digital<br />
              Experiences That
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Stand Out
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mb-8 leading-relaxed"> {/* Reduced mb-10 to mb-8 */}
            I design and develop premium portfolios and landing pages using <span className="text-white font-semibold">Next.js</span> and modern web technologies. Every project is crafted to convert visitors into customers while delivering an unforgettable user experience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a 
              href="#work" 
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-medium"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              Explore My Work
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#contact" 
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-700 hover:border-white transition-colors font-medium"
            >
              Let's Connect
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl"> {/* Reduced mt-16 to mt-12 */}
            <div>
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">24h</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="relative py-20 px-6 lg:px-12 max-w-7xl mx-auto"> {/* Reduced py-24 to py-20 */}
        <div className="mb-12"> {/* Reduced mb-16 to mb-12 */}
          <div className="flex items-center gap-2 mb-2"> {/* Reduced mb-3 to mb-2 */}
            <img src="/noun.svg" alt="" className="w-5 h-5 opacity-50" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Portfolio</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-3"> {/* Reduced mb-4 to mb-3 */}
            <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Featured Work
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
            A curated selection of projects that showcase my approach to web design and development. Each website tells a unique story and solves specific business challenges through thoughtful design and technical excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="group relative cursor-pointer"
              style={{
                opacity: 0,
                animation: `fadeInUp 0.8s ease-out ${index * 0.15}s forwards`
              }}
            >
              <div className="relative overflow-hidden bg-gray-900 aspect-[4/3] mb-4">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-sm border border-gray-700 text-xs font-medium">
                  {project.status}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <ExternalLink className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div className="space-y-2"> {/* Reduced space-y-3 to space-y-2 */}
                <div>
                  <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{project.client}</div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-xs font-medium text-gray-400">
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
      <section id="process" className="relative py-20 px-6 lg:px-12 bg-gradient-to-b from-black via-gray-900 to-black"> {/* Reduced py-24 to py-20 */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-12"> {/* Reduced mb-16 to mb-12 */}
            <div className="flex items-center gap-2 mb-2"> {/* Reduced mb-3 to mb-2 */}
              <img src="/noun.svg" alt="" className="w-5 h-5 opacity-50" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Methodology</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-3"> {/* Reduced mb-4 to mb-3 */}
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                How I Work
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
              A streamlined four-phase process designed to deliver exceptional results on time and on budget. From initial concept to final launch, you'll have full visibility and control over your project's progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Reduced gap-6 to gap-4 */}
            {process.map((step, index) => (
              <div 
                key={index}
                className="group relative p-5 bg-gray-900 border border-gray-800 hover:border-blue-500 transition-all duration-500" // Reduced p-6 to p-5
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                <div className="text-blue-500 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"> {/* Reduced mb-4 to mb-3 */}
                  {step.icon}
                </div>
                
                <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{step.duration}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3> {/* Reduced mb-3 to mb-2 */}
                <p className="text-gray-400 leading-relaxed text-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 px-6 lg:px-12 max-w-7xl mx-auto"> {/* Reduced py-24 to py-20 */}
        <div className="mb-12"> {/* Reduced mb-16 to mb-12 */}
          <div className="flex items-center gap-2 mb-2"> {/* Reduced mb-3 to mb-2 */}
            <img src="/noun.svg" alt="" className="w-5 h-5 opacity-50" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Investment</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-3"> {/* Reduced mb-4 to mb-3 */}
            <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
            Choose the package that aligns with your goals and budget. All projects include hosting setup, deployment on Vercel, and post-launch support. No hidden fees or surprise charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.map((tier, index) => (
            <div 
              key={index}
              className={`relative p-6 border transition-all duration-500 ${ // Reduced p-8 to p-6
                tier.highlighted 
                  ? 'bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500 scale-105 shadow-2xl shadow-blue-500/20' 
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
              style={{
                opacity: 0,
                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`
              }}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-4"> {/* Reduced mb-6 to mb-4 */}
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tier.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-xs text-gray-500">/ {tier.euroPrice}</span>
                </div>
                <div className="text-sm text-gray-400">{tier.description}</div>
              </div>

              <ul className="space-y-2 mb-6"> {/* Reduced space-y-3 to space-y-2 and mb-8 to mb-6 */}
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-400 text-xs">{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contact"
                className={`block text-center py-3 font-medium transition-all ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                    : 'border-2 border-gray-700 hover:border-white'
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 px-6 lg:px-12 bg-gradient-to-b from-black via-gray-900 to-black"> {/* Reduced py-24 to py-20 */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Pulsing Logo Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <img 
              src="/noun.svg" 
              alt="" 
              className="w-72 h-72 opacity-5 animate-pulse"
              style={{ animationDuration: '3s' }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2"> {/* Reduced mb-3 to mb-2 */}
              <img src="/noun.svg" alt="" className="w-5 h-5 opacity-50" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Let's Connect</span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-4"> {/* Reduced mb-6 to mb-4 */}
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Ready to Start<br />Your Project?
              </span>
            </h2>
            
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"> {/* Reduced mb-10 to mb-8 */}
              Let's discuss your vision and create something exceptional together. I typically respond within 24 hours and offer a free consultation to understand your needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"> {/* Reduced mb-10 to mb-8 */}
              <a 
                href="mailto:ryan@rydev.fr"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 text-base font-medium"
              >
                <Mail className="w-5 h-5" />
                ryan@rydev.fr
              </a>
              <a 
                href="https://x.com/ry_devv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-700 hover:border-white transition-colors text-base font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                </svg>
                @ry_devv
              </a>
            </div>

            <div className="text-xs text-gray-500">
              Working with clients worldwide • Available for new projects
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-6 px-6 lg:px-12 border-t border-gray-900"> {/* Reduced py-8 to py-6 */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/noun.svg" alt="RY Dev" className="w-6 h-6" />
            <div className="text-xl font-bold tracking-tighter">RY<span className="text-blue-500">.</span>DEV</div>
          </div>
          <div className="text-xs text-gray-500">
            © 2025 RY Dev. Crafted with precision in Paris.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/RYANX9" className="text-gray-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://x.com/ry_devv" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
