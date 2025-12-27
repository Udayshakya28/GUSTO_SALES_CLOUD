"use client";
import React from 'react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

const PulsatingDotsLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      {/* Pulsating Three Dots */}
      <div className="flex space-x-2">
        <div 
          className="w-3 h-3 bg-orange-500 rounded-full"
          style={{
            animation: 'pulse-dot 1.5s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
        <div 
          className="w-3 h-3 bg-orange-500 rounded-full"
          style={{
            animation: 'pulse-dot 1.5s ease-in-out infinite',
            animationDelay: '0.3s'
          }}
        />
        <div 
          className="w-3 h-3 bg-orange-500 rounded-full"
          style={{
            animation: 'pulse-dot 1.5s ease-in-out infinite',
            animationDelay: '0.6s'
          }}
        />
      </div>
      
      {/* Clean Text */}
      <div className="text-center space-y-1">
        <p className={`text-white font-medium ${poppins.className}`}>
          Loading leads
        </p>
        <p className={`text-gray-400 text-sm ${inter.className}`}>
          Discovering opportunities...
        </p>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default PulsatingDotsLoader;
