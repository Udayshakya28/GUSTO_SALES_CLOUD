"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrashIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

interface DeleteLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  leadStats: { new: number; replied: number; saved: number; ignored: number; all: number };
  onLeadsDeleted: () => void;
}

export const DeleteLeadsModal: React.FC<DeleteLeadsModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  leadStats,
  onLeadsDeleted
}) => {
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedStatus) {
      setError("Please select a category of leads to delete.");
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      const token = await getToken();
      
      // FIX: Check which status is selected and call the correct API function
      // with the correct arguments, including the auth token.
      if (selectedStatus === 'all') {
        await api.deleteAllLeads(campaignId, token);
      } else {
        await api.deleteLeadsByStatus(campaignId, selectedStatus, token);
      }

      onLeadsDeleted();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete leads.");
    } finally {
      setIsDeleting(false);
    }
  };

  const leadTypes = [
    { status: 'ignored', count: leadStats.ignored, label: 'Ignored Leads' },
    { status: 'saved', count: leadStats.saved, label: 'Saved Leads' },
    { status: 'replied', count: leadStats.replied, label: 'Replied Leads' },
    { status: 'all', count: leadStats.all, label: 'All Leads' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-black rounded-xl border border-zinc-800 shadow-2xl p-8"
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <TrashIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <h3 className={`mt-5 text-2xl font-bold leading-6 text-white ${poppins.className}`}>
                Bulk Delete Leads
              </h3>
              <div className="mt-2">
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  This action is irreversible. Please select which category of leads you want to permanently delete.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {leadTypes.map(type => (
                <button
                  key={type.status}
                  onClick={() => setSelectedStatus(type.status)}
                  disabled={type.count === 0}
                  className={`w-full flex justify-between items-center p-4 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${selectedStatus === type.status ? 'bg-red-500/20 border-red-500/40' : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'}
                  `}
                >
                  <span className={`font-medium ${selectedStatus === type.status ? 'text-red-300' : 'text-white'} ${inter.className}`}>{type.label}</span>
                  <Badge variant={selectedStatus === type.status ? 'destructive' : 'secondary'}>{type.count}</Badge>
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-red-400">{error}</p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={onClose} className="border-zinc-700 text-gray-300 hover:bg-zinc-800">Cancel</Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting || !selectedStatus}
                className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-800/50"
              >
                {isDeleting ? 'Deleting...' : `Delete ${selectedStatus ? leadStats[selectedStatus as keyof typeof leadStats] : ''} Leads`}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};