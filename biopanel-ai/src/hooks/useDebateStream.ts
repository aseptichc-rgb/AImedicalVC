'use client';
import { useState, useEffect } from 'react';
import { subscribeToAnalysis, subscribeToMessages, subscribeToConflicts } from '@/lib/firebase/firestore';
import { AnalysisDoc, AnalysisStatus, MessageDoc, ConflictDoc } from '@/types/analysis';

export function useDebateStream(sessionId: string) {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>('enriching');
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [conflicts, setConflicts] = useState<ConflictDoc[]>([]);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const unsubSession = subscribeToAnalysis(sessionId, (data) => {
      setStatus(data.status);
      setProgress(data.progress);
      setCurrentPhase(data.currentPhase);
      if (data.report) setReport(data.report);
    });

    const unsubMessages = subscribeToMessages(sessionId, (msgs) => {
      setMessages(msgs as MessageDoc[]);
    });

    const unsubConflicts = subscribeToConflicts(sessionId, (conf) => {
      setConflicts(conf as ConflictDoc[]);
    });

    return () => {
      unsubSession();
      unsubMessages();
      unsubConflicts();
    };
  }, [sessionId]);

  return { messages, status, progress, currentPhase, conflicts, report };
}
