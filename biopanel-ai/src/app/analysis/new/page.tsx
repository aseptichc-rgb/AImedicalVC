'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAnalysis } from '@/hooks/useAnalysis';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { AgentId } from '@/types/agent';

const sectors = [
  '바이오시밀러',
  'mRNA 치료제',
  '항암제',
  '면역치료제',
  '유전자치료',
  '의료기기',
  '디지털헬스',
  '기타',
];

const agentIds: AgentId[] = ['oncologist', 'pharmacist', 'analyst', 'regulatory', 'immunologist'];

export default function NewAnalysisPage() {
  const { startAnalysis, loading, error } = useAnalysis();
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !sector) return;
    await startAnalysis({
      name: companyName.trim(),
      sector,
      ticker: ticker.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">새 기업 분석</h1>
          <p className="text-sm text-gray-500 mt-1">
            분석할 바이오/헬스케어 기업 정보를 입력하세요. AI 전문가 패널이 심층 분석을 시작합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
                    기업명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="예: 삼성바이오로직스, Moderna, BioNTech"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Sector */}
                <div>
                  <label htmlFor="sector" className="block text-sm font-semibold text-gray-700 mb-2">
                    섹터 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    required
                  >
                    <option value="">섹터를 선택하세요</option>
                    {sectors.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ticker */}
                <div>
                  <label htmlFor="ticker" className="block text-sm font-semibold text-gray-700 mb-2">
                    티커 (선택)
                  </label>
                  <input
                    id="ticker"
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="예: MRNA, 207940.KS"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    추가 설명 (선택)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="분석에 참고할 추가 정보를 입력하세요. 예: 특정 파이프라인, 최근 이슈, 관심 포인트 등"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  disabled={!companyName.trim() || !sector}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg"
                >
                  {loading ? '분석 시작 중...' : '분석 시작'}
                  {!loading && (
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </Button>
              </form>
            </Card>

            {/* Info Box */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">분석 진행 과정</p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    분석이 시작되면 ClinicalTrials.gov, PubMed, SEC/DART 등에서 데이터를 수집한 후,
                    5명의 AI 전문가가 4단계(독립 분석 - 상호 검토 - 반론 - 최종 판결) 토론을 진행합니다.
                    전체 과정은 약 3~5분 소요됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Profiles Sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">AI 전문가 패널</h2>
            <p className="text-xs text-gray-500 mb-4">
              아래 5명의 전문가가 입력된 기업을 분석합니다.
            </p>
            {agentIds.map((id) => {
              const agent = AGENT_REGISTRY[id];
              return (
                <Card key={id} padding="sm" className="relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1"
                    style={{ backgroundColor: agent.color }}
                  />
                  <div className="pl-3">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.name[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{agent.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{agent.title.split('/')[0].trim()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.evaluationAxes.slice(0, 3).map((axis, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${agent.color}15`,
                            color: agent.color,
                          }}
                        >
                          {axis.length > 20 ? axis.substring(0, 20) + '...' : axis}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
