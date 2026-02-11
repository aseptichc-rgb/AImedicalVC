'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAnalysis() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startAnalysis(company: { name: string; sector: string; ticker?: string; description?: string }) {
    setLoading(true);
    setError(null);

    try {
      console.log('[useAnalysis] Starting analysis for:', company.name);
      console.log('[useAnalysis] Sending request to /api/analysis/start...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('[useAnalysis] Request timeout - aborting');
        controller.abort();
      }, 30000); // 30 second client-side timeout

      const res = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[useAnalysis] Response received - status:', res.status);

      if (!res.ok) {
        const data = await res.json();
        console.error('[useAnalysis] Error response:', data);
        throw new Error(data.error || '분석 시작에 실패했습니다.');
      }

      const data = await res.json();
      console.log('[useAnalysis] Success response:', data);
      const { sessionId } = data;
      console.log('[useAnalysis] Navigating to session:', sessionId);
      router.push(`/analysis/${sessionId}`);
    } catch (err: any) {
      console.error('[useAnalysis] Error:', err);
      if (err.name === 'AbortError') {
        setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return { startAnalysis, loading, error };
}
