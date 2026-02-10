export function formatScore(score: number): string {
  return score.toFixed(0);
}

export function formatCurrency(amount: number, currency: 'KRW' | 'USD' = 'KRW'): string {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 30) return `${diffDays}일 전`;
  return formatDate(d);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

export function getRiskLevelColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[level];
}

export function getVerdictLabel(verdict: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    strong_positive: { label: '매우 긍정', color: 'bg-green-600 text-white' },
    positive: { label: '긍정', color: 'bg-green-100 text-green-800' },
    neutral: { label: '중립', color: 'bg-gray-100 text-gray-800' },
    negative: { label: '부정', color: 'bg-red-100 text-red-800' },
    strong_negative: { label: '매우 부정', color: 'bg-red-600 text-white' },
  };
  return map[verdict] || { label: verdict, color: 'bg-gray-100 text-gray-800' };
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    enriching: '데이터 수집 중',
    analyzing: '전문가 분석 중',
    debating: '토론 진행 중',
    synthesizing: '리포트 생성 중',
    completed: '분석 완료',
    failed: '분석 실패',
  };
  return map[status] || status;
}
