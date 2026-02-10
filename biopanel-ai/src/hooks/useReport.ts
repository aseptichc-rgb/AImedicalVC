'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AnalysisDoc } from '@/types/analysis';
import { FinalReport } from '@/types/report';

export function useReport(sessionId: string) {
  const [analysis, setAnalysis] = useState<AnalysisDoc | null>(null);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const snap = await getDoc(doc(db, 'analyses', sessionId));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as AnalysisDoc;
          setAnalysis(data);
          setReport(data.report || null);
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [sessionId]);

  return { analysis, report, loading };
}
