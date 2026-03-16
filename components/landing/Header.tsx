"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navItems = [
    { label: "Features", href: "#features", id: "features" },
    { label: "Pricing", href: "#pricing", id: "pricing" },
    { label: "How It Works", href: "#how-it-works", id: "how-it-works" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(item.id);
            return;
          }
        }
      }
      
      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-[#1F2937]/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Link href="/" className="inline-flex items-center gap-2 cursor-pointer transition-transform hover:rotate-3 group">
            <div className="w-8 h-8 bg-lowfi-slate-dark rounded-lg flex items-center justify-center text-white">
              <div className="w-4 h-4 bg-white rounded-[2px]" />
            </div>
            <span className="text-xl font-bold text-lowfi-slate-dark tracking-tight">LowFi</span>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`relative text-xs font-bold tracking-[0.1em] uppercase transition-colors ${
                activeSection === item.id ? "text-[#1F2937]" : "text-[#1F2937]/50 hover:text-[#1F2937]"
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              {activeSection === item.id && (
                <motion.div
                  layoutId="nav-active-marker"
                  className="absolute -bottom-1 left-0 right-0 flex justify-center"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                >
                  <svg
                    width="24"
                    height="6"
                    viewBox="0 0 24 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-lowfi-slate-dark"
                  >
                    <path
                      d="M2 4C6 4 8 2 12 2C16 2 18 4 22 4"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
              )}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-6">
          <button 
              className="text-xs font-bold text-[#1F2937]/50 hover:text-[#1F2937] transition-colors uppercase tracking-widest cursor-pointer"
              onClick={() => window.location.href = '/auth/signin'}
          >
            Log in
          </button>
          <button 
            onClick={() => window.location.href = '/auth/signup'}
            className="h-10 px-6 bg-[#1F2937] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-lowfi-slate-dark"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-lowfi-white border-t border-lowfi-gray-light overflow-hidden"
        >
          <div className="px-6 py-8 space-y-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-xl font-bold text-lowfi-slate-dark cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-4 pt-6 border-t border-lowfi-gray-light">
              <Button variant="secondary" size="lg" className="w-full" onClick={() => window.location.href = '/auth/signin'}>
                Log in
              </Button>
              <Button variant="primary" size="lg" className="w-full" onClick={() => window.location.href = '/auth/signup'}>
                Get Started
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
