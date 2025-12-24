import { create } from 'zustand';
import { Lead } from '@/components/dashboard/LeadCard'; // Assuming Lead type is exported from LeadCard

interface ReplyModalStore {
  isOpen: boolean;
  lead: Lead | null;
  onOpen: (lead: Lead) => void;
  onClose: () => void;
}

export const useReplyModal = create<ReplyModalStore>((set) => ({
  isOpen: false,
  lead: null,
  onOpen: (lead) => set({ isOpen: true, lead }),
  onClose: () => set({ isOpen: false, lead: null }),
}));

export type  { Lead };
