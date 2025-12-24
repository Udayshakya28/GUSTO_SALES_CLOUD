"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

interface Campaign {
  id: string;
  name: string;
  analyzedUrl: string;
  _count?: {
    leads: number;
  };
}

interface DeleteCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onCampaignDeleted: () => void;
}

export const DeleteCampaignModal: React.FC<DeleteCampaignModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onCampaignDeleted
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const campaignName = campaign?.name || (campaign?.analyzedUrl ? new URL(campaign.analyzedUrl).hostname : '');
  const isConfirmed = confirmationText === campaignName;

  const handleDelete = async () => {
    if (!campaign || !isConfirmed) return;

    setLoading(true);
    try {
      const token = await getToken();
      await api.deleteCampaign(campaign.id, token);
      toast.success('Campaign deleted successfully');
      onCampaignDeleted();
    } catch (error: any) {
      toast.error('Failed to delete campaign', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !campaign) return null;

  return (
    <AnimatePresence>
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
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
            
            <h3 className={`mt-5 text-2xl font-bold leading-6 text-white ${poppins.className}`}>
              Delete Campaign
            </h3>
            
            <div className="mt-4 space-y-3">
              <p className={`text-sm text-zinc-400 ${inter.className}`}>
                This action will permanently delete the campaign{' '}
                <span className="font-semibold text-white">"{campaignName}"</span>{' '}
                and all associated data.
              </p>
              
              {campaign._count?.leads && campaign._count.leads > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className={`text-sm text-red-400 ${inter.className}`}>
                    ⚠️ This will also delete {campaign._count.leads} associated leads
                  </p>
                </div>
              )}

              <p className={`text-sm text-zinc-400 ${inter.className}`}>
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className={`block text-sm font-medium text-zinc-300 mb-2 ${inter.className}`}>
                Type "{campaignName}" to confirm deletion
              </label>
              <Input
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder={campaignName}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={loading || !isConfirmed}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-red-800/50"
              >
                {loading ? 'Deleting...' : 'Delete Campaign'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};