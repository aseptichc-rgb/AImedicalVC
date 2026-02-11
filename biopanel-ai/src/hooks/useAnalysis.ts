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
      console.log('[useAnalysis] Response URL:', res.url);
      console.log('[useAnalysis] Content-Type:', res.headers.get('content-type'));

      const text = await res.text();
      console.log('[useAnalysis] Raw response (first 500 chars):', text.substring(0, 500));

      // Check if response is JSON
      if (!res.headers.get('content-type')?.includes('application/json')) {
        console.error('[useAnalysis] Expected JSON but got:', res.headers.get('content-type'));
        throw new Error(`서버에서 잘못된 응답을 반환했습니다. Status: ${res.status}, URL: ${res.url}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('[useAnalysis] JSON parse error:', parseErr);
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }

      if (!res.ok) {
        console.error('[useAnalysis] Error response:', data);
        throw new Error(data.error || '분석 시작에 실패했습니다.');
      }
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
