'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useAnalysis() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startAnalysis(company: { name: string; sector: string; ticker?: string; description?: string }) {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ company }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '분석 시작에 실패했습니다.');
      }

      const { sessionId } = await res.json();
      router.push(`/analysis/${sessionId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { startAnalysis, loading, error };
}
