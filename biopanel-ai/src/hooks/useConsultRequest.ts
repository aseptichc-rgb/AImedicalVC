'use client';
import { useState } from 'react';
import { useAuth } from './useAuth';
import { createConsultRequest } from '@/lib/firebase/firestore';

export function useConsultRequest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRequest(data: {
    expertId: string;
    expertName: string;
    expertSpecialty: string;
    subject: string;
    message: string;
    preferredMethod: 'video' | 'phone' | 'email' | 'in_person';
    preferredSchedule?: string;
    urgency?: 'normal' | 'urgent';
    linkedAnalysisId?: string;
    linkedCompany?: string;
    aiReportSummary?: string;
    userCompany?: string;
    userPhone?: string;
  }) {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createConsultRequest({
        ...data,
        userId: user.uid,
        userName: user.displayName || '',
        userEmail: user.email || '',
        urgency: data.urgency || 'normal',
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '요청 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return { submitRequest, loading, success, error, reset: () => { setSuccess(false); setError(null); } };
}
