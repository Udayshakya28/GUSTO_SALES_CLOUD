"use client";
import React from 'react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface ReplyLoaderProps {
  message?: string;
  subMessage?: string;
}

export const ReplyLoader: React.FC<ReplyLoaderProps> = ({ 
  message = "Generating AI replies",
  subMessage = "This may take a few seconds..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
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
      
      {/* Loading Text */}
      <div className="text-center space-y-1">
        <p className={`text-white font-medium ${poppins.className}`}>
          {message}
        </p>
        <p className={`text-gray-400 text-sm ${inter.className}`}>
          {subMessage}
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

export const RefiningLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="flex space-x-1">
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full"
          style={{
            animation: 'pulse-dot 1.2s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full"
          style={{
            animation: 'pulse-dot 1.2s ease-in-out infinite',
            animationDelay: '0.2s'
          }}
        />
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full"
          style={{
            animation: 'pulse-dot 1.2s ease-in-out infinite',
            animationDelay: '0.4s'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};
