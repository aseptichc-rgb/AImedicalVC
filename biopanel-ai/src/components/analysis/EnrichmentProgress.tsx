'use client';

import { useEffect, useState } from 'react';
import { EnrichmentStepData } from '@/types/analysis';

export type EnrichmentStep = EnrichmentStepData;

const defaultSteps: EnrichmentStep[] = [
  {
    id: 'news',
    label: '관련 뉴스 탐색',
    description: '최근 3개월 내 기업 관련 뉴스 검색',
    icon: 'news',
    status: 'pending',
  },
  {
    id: 'clinical',
    label: 'ClinicalTrials.gov 검색',
    description: '진행 중인 임상시험 데이터 수집',
    icon: 'clinical',
    status: 'pending',
  },
  {
    id: 'fda',
    label: 'FDA 자료 수집',
    description: '승인 이력 및 규제 정보 조회',
    icon: 'fda',
    status: 'pending',
  },
  {
    id: 'pubmed',
    label: 'PubMed 논문 검색',
    description: '관련 학술 논문 및 연구 자료',
    icon: 'pubmed',
    status: 'pending',
  },
  {
    id: 'financial',
    label: '재무 데이터 분석',
    description: 'SEC/DART 공시 자료 수집',
    icon: 'financial',
    status: 'pending',
  },
  {
    id: 'competitor',
    label: '경쟁사 분석',
    description: '동일 적응증 파이프라인 비교',
    icon: 'competitor',
    status: 'pending',
  },
];

const iconMap: Record<EnrichmentStep['icon'], React.ReactNode> = {
  news: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
  pdf: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  fda: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  clinical: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  pubmed: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  financial: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  competitor: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  digital: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
};

interface EnrichmentProgressProps {
  steps?: EnrichmentStep[];
  companyName?: string;
  sector?: string;
}

export default function EnrichmentProgress({
  steps: externalSteps,
  companyName = '기업',
  sector = '바이오'
}: EnrichmentProgressProps) {
  const [steps, setSteps] = useState<EnrichmentStep[]>(externalSteps || defaultSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Simulate progression if no external steps provided
  useEffect(() => {
    if (externalSteps) {
      setSteps(externalSteps);
      return;
    }

    // Auto-progress simulation
    const progressInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length) {
          clearInterval(progressInterval);
          return prev;
        }

        setSteps((prevSteps) =>
          prevSteps.map((step, i) => {
            if (i < prev) return { ...step, status: 'completed' as const };
            if (i === prev) return { ...step, status: 'in_progress' as const };
            return step;
          })
        );

        return prev + 1;
      });
    }, 2500);

    // Timer for elapsed time
    const timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timerInterval);
    };
  }, [externalSteps, steps.length]);

  // Update steps when external steps change
  useEffect(() => {
    if (externalSteps) {
      setSteps(externalSteps);
    }
  }, [externalSteps]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              데이터 수집 중
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {companyName} ({sector}) 분석을 위한 자료 수집
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-white">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-blue-100 text-xs">경과 시간</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
            <span>{completedCount} / {steps.length} 완료</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-6">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-all duration-500
                ${step.status === 'in_progress'
                  ? 'bg-blue-50 border-2 border-blue-200 shadow-md scale-[1.02]'
                  : step.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-100'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${step.status === 'in_progress'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                  : step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }
              `}>
                {step.status === 'completed' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : step.status === 'in_progress' ? (
                  <div className="relative">
                    {iconMap[step.icon]}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
                  </div>
                ) : (
                  iconMap[step.icon]
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`
                    font-semibold transition-colors
                    ${step.status === 'in_progress'
                      ? 'text-blue-900'
                      : step.status === 'completed'
                        ? 'text-green-800'
                        : 'text-gray-500'
                    }
                  `}>
                    {step.label}
                  </h3>
                  {step.status === 'in_progress' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      진행 중
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      완료
                    </span>
                  )}
                </div>
                <p className={`
                  text-sm mt-0.5
                  ${step.status === 'in_progress'
                    ? 'text-blue-600'
                    : step.status === 'completed'
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }
                `}>
                  {step.description}
                </p>
                {step.result && step.status === 'completed' && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    {step.result}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {step.status === 'in_progress' && (
                  <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                )}
                {step.status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">분석 팁</p>
              <p className="text-xs text-amber-700 mt-0.5">
                데이터 수집이 완료되면 5명의 AI 전문가가 독립적으로 분석을 시작합니다.
                전체 과정은 약 3-5분 소요됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
