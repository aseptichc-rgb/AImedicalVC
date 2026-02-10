'use client';

import { AnalysisStatus } from '@/types/analysis';

interface LiveIndicatorProps {
  status: AnalysisStatus;
  currentPhase: string;
  progress: number;
}

const STATUS_CONFIG: Record<
  AnalysisStatus,
  { label: string; dotColor: string; badgeClass: string; active: boolean }
> = {
  enriching: {
    label: '데이터 수집',
    dotColor: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700',
    active: true,
  },
  analyzing: {
    label: '분석 진행',
    dotColor: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700',
    active: true,
  },
  debating: {
    label: '패널 토론',
    dotColor: 'bg-purple-500',
    badgeClass: 'bg-purple-100 text-purple-700',
    active: true,
  },
  synthesizing: {
    label: '보고서 종합',
    dotColor: 'bg-yellow-500',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    active: true,
  },
  completed: {
    label: '완료',
    dotColor: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700',
    active: false,
  },
  failed: {
    label: '실패',
    dotColor: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700',
    active: false,
  },
};

const PHASE_LABELS: Record<string, string> = {
  independent_analysis: 'Phase 1: 독립 분석',
  cross_examination: 'Phase 2: 교차 검증',
  rebuttal: 'Phase 3: 반박',
  final_verdict: 'Phase 4: 최종 의견',
  data_enrichment: '데이터 수집 및 정제',
  report_synthesis: '최종 보고서 생성',
};

export default function LiveIndicator({ status, currentPhase, progress }: LiveIndicatorProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.analyzing;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const phaseLabel = PHASE_LABELS[currentPhase] ?? currentPhase;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
      {/* Pulsing dot */}
      <div className="relative flex-shrink-0">
        <span className={`block h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
        {config.active && (
          <span
            className={`absolute inset-0 rounded-full ${config.dotColor} animate-ping opacity-40`}
          />
        )}
      </div>

      {/* Phase text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">{phaseLabel}</span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.badgeClass}`}
          >
            {config.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${config.dotColor}`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      {/* Progress percentage */}
      <span className="text-xs font-medium text-gray-500 flex-shrink-0 tabular-nums">
        {clampedProgress}%
      </span>
    </div>
  );
}
