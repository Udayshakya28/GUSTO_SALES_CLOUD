"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlareCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlareCard: React.FC<GlareCardProps> = ({ children, className, onClick }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300 hover:border-orange-400/30",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50" />
      
      {/* Glare effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 69, 0, 0.15), transparent 40%)`,
        }}
      />
      
      {/* Subtle reflection effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isHovered && "opacity-100"
        )}
        style={{
          background: `linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.03) 45%, rgba(255, 140, 0, 0.1) 50%, rgba(255, 255, 255, 0.03) 55%, transparent 100%)`,
          transform: `translate(${(mousePosition.x - 250) * 0.1}px, ${(mousePosition.y - 250) * 0.1}px)`,
        }}
      />
      
      {/* Border glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-all duration-300",
        isHovered && "shadow-lg shadow-orange-500/20"
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
