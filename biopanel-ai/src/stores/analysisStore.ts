import { create } from 'zustand';
import { AnalysisStatus, MessageDoc, ConflictDoc } from '@/types/analysis';

interface AnalysisState {
  sessionId: string | null;
  status: AnalysisStatus;
  progress: number;
  currentPhase: string;
  messages: MessageDoc[];
  conflicts: ConflictDoc[];
  setSession: (id: string) => void;
  setStatus: (status: AnalysisStatus) => void;
  setProgress: (progress: number) => void;
  setCurrentPhase: (phase: string) => void;
  setMessages: (messages: MessageDoc[]) => void;
  setConflicts: (conflicts: ConflictDoc[]) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  sessionId: null,
  status: 'enriching',
  progress: 0,
  currentPhase: '',
  messages: [],
  conflicts: [],
  setSession: (id) => set({ sessionId: id }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  setMessages: (messages) => set({ messages }),
  setConflicts: (conflicts) => set({ conflicts }),
  reset: () => set({ sessionId: null, status: 'enriching', progress: 0, currentPhase: '', messages: [], conflicts: [] }),
}));
