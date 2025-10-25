'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function RyStudio() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeAccent, setActiveAccent] = useState('#00F0FF');
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const projects = [
    { id: 1, title: 'E-Commerce Platform', code: 'const checkout = () => {...}', tech: 'Next.js 15 · Stripe', color: '#00F0FF' },
    { id: 2, title: 'SaaS Dashboard', code: 'useEffect(() => {...}', tech: 'React · Tailwind', color: '#CCFF00' },
    { id: 3, title: 'Portfolio CMS', code: 'export default async', tech: 'Next.js · Vercel', color: '#FF006E' },
    { id: 4, title: 'API Gateway', code: 'fetch("/api/...")', tech: 'Node.js · Edge', color: '#8B00FF' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] overflow-x-hidden font-sans">
      {/* ...rest of your component remains unchanged */}
    </div>
  );
}
