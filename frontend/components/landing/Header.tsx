"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';
import { motion } from "framer-motion";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-xl border-b border-white/10" style={{
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      willChange: 'scroll-position'
    }}>
      {/* Clean Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-8 py-6">
        <nav className="flex items-center justify-between relative">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link className="flex items-center gap-3 hover:opacity-80 transition-opacity" href="/">
              <span 
                className={`text-[24px] font-black bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent ${poppins.className}`}
                style={{ 
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '900'
                }}
              >
                RedLead
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[16px] text-white/80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:text-white transition-colors font-semibold ${poppins.className}`}
                style={{ 
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '600'
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <div className="flex items-center gap-3">
                <Link 
                  href="/sign-in"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 ${poppins.className}`}
                  style={{ 
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600'
                  }}
                >
                  Sign in
                </Link>
                
                <Link
                  href="/sign-up"
                  className={`inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors ${poppins.className}`}
                  style={{ 
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '700'
                  }}
                >
                  Get started
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 ${poppins.className}`}
                  style={{ 
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600'
                  }}
                >
                  Go to Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-white/70 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu - Dropdown Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-black">
          <div className="pt-4 pb-8 px-8 flex flex-col items-center gap-6 text-center">
            
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xl text-white hover:text-orange-500 transition-colors font-semibold ${poppins.className}`}
                style={{ 
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '600'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Divider */}
            <div className="w-full max-w-xs border-t border-white/20 my-4"></div>
            
            {/* Auth Buttons */}
            <SignedOut>
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <Link
                  href="/sign-in"
                  className={`px-6 py-3 rounded-lg text-base font-semibold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all duration-200 text-center ${poppins.className}`}
                  style={{ 
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                
                <Link
                  href="/sign-up"
                  className={`bg-white text-black px-6 py-3 rounded-lg text-base font-bold hover:bg-gray-100 transition-colors text-center ${poppins.className}`}
                  style={{ 
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '700'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get started
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col gap-4 w-full max-w-xs items-center">
                <Link
                  href="/dashboard"
                  className={`px-6 py-3 rounded-lg text-base font-semibold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all duration-200 w-full text-center ${poppins.className}`}
                  style={{ 
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
                <div className="pt-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
};
