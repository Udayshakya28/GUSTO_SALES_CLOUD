"use client";
import React from 'react';
import LoadingLeads from './LoadingLeads';
import { motion } from 'framer-motion';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  loadingText,
  className = ""
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <LoadingLeads />
        {loadingText && (
          <p className="text-sm text-gray-400 mt-4">
            {loadingText}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
};