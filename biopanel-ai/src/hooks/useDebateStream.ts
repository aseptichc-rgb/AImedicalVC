'use client';
import { useState, useEffect } from 'react';
import { subscribeToAnalysis, subscribeToMessages, subscribeToConflicts } from '@/lib/firebase/firestore';
import { AnalysisDoc, AnalysisStatus, MessageDoc, ConflictDoc } from '@/types/analysis';
import { EnrichmentStepData } from '@/types/analysis';
import { CompanyInput } from '@/types/company';

export function useDebateStream(sessionId: string) {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>('enriching');
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [conflicts, setConflicts] = useState<ConflictDoc[]>([]);
  const [report, setReport] = useState<any>(null);
  const [enrichmentSteps, setEnrichmentSteps] = useState<EnrichmentStepData[]>([]);
  const [company, setCompany] = useState<CompanyInput | null>(null);

  useEffect(() => {
    console.log('[useDebateStream] Subscribing to session:', sessionId);

    const unsubSession = subscribeToAnalysis(sessionId, (data) => {
      console.log('[useDebateStream] Session data received:', {
        status: data.status,
        progress: data.progress,
        company: data.company?.name,
        hasEnrichmentSteps: !!data.enrichmentSteps,
      });
      setStatus(data.status);
      setProgress(data.progress);
      setCurrentPhase(data.currentPhase);
      if (data.report) setReport(data.report);
      if (data.enrichmentSteps) setEnrichmentSteps(data.enrichmentSteps);
      if (data.company) setCompany(data.company);
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

  return { messages, status, progress, currentPhase, conflicts, report, enrichmentSteps, company };
}
