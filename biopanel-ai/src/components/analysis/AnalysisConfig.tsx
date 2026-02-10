'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface AnalysisConfigProps {
  onStart: (config: { type: string }) => void;
}

export default function AnalysisConfig({ onStart }: AnalysisConfigProps) {
  return (
    <Card padding="md" className="max-w-lg mx-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-4">분석 설정</h3>

      <div className="space-y-3">
        {/* Default analysis option - selected */}
        <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-blue-500 bg-blue-50 cursor-pointer">
          <input
            type="radio"
            name="analysis-type"
            value="panel_debate"
            defaultChecked
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div>
            <span className="block text-sm font-semibold text-gray-900">
              기본 분석 (5명 패널 토론)
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              종양내과 전문의, 약물경제학 전문가, 투자 분석가, 규제과학 전문가, 면역학자가 참여하는 다각도 패널 토론 분석
            </span>
          </div>
        </label>

        {/* Placeholder: Quick analysis */}
        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed opacity-60">
          <input
            type="radio"
            name="analysis-type"
            value="quick"
            disabled
            className="mt-1 h-4 w-4 text-gray-400 border-gray-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="block text-sm font-semibold text-gray-500">
                빠른 분석 (단일 에이전트)
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-500">
                Coming Soon
              </span>
            </div>
            <span className="block text-xs text-gray-400 mt-0.5">
              단일 AI 에이전트가 빠르게 핵심 분석을 제공합니다.
            </span>
          </div>
        </label>

        {/* Placeholder: Deep analysis */}
        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed opacity-60">
          <input
            type="radio"
            name="analysis-type"
            value="deep"
            disabled
            className="mt-1 h-4 w-4 text-gray-400 border-gray-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="block text-sm font-semibold text-gray-500">
                심층 분석 (확장 패널)
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-500">
                Coming Soon
              </span>
            </div>
            <span className="block text-xs text-gray-400 mt-0.5">
              추가 전문가를 포함한 확장된 패널 토론과 심층 데이터 분석을 제공합니다.
            </span>
          </div>
        </label>
      </div>

      <div className="mt-5">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => onStart({ type: 'panel_debate' })}
        >
          이 설정으로 시작
        </Button>
      </div>
    </Card>
  );
}
