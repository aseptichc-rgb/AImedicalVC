'use client';

import { use } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ExecutiveSummary from '@/components/report/ExecutiveSummary';
import AgentVerdictCard from '@/components/report/AgentVerdictCard';
import { useReport } from '@/hooks/useReport';
import { useDebateStream } from '@/hooks/useDebateStream';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { AgentId } from '@/types/agent';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ReportPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const { analysis, report, loading } = useReport(sessionId);
  const { messages } = useDebateStream(sessionId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 mt-4">리포트를 불러오는 중...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-12">
          <Card className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">분석을 찾을 수 없습니다</h2>
            <p className="text-gray-500 mb-6">요청하신 분석 세션이 존재하지 않습니다.</p>
            <Link href="/dashboard">
              <Button>대시보드로 이동</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  // Group messages by agent for verdict cards
  const agentIds: AgentId[] = ['oncologist', 'pharmacist', 'analyst', 'regulatory', 'immunologist'];
  const agentVerdicts = agentIds.map((agentId) => {
    const agent = AGENT_REGISTRY[agentId];
    const agentMessages = messages.filter((m) => m.agentId === agentId);

    // structuredEval is only available in independent_analysis phase
    const analysisMessage = agentMessages.find((m) => m.phase === 'independent_analysis');
    const lastMessage = agentMessages[agentMessages.length - 1];
    const structuredEval = analysisMessage?.structuredEval;

    const overallScore = structuredEval?.scores?.overall ?? 0;
    return {
      agentId,
      agentName: agent.name,
      verdict: overallScore >= 70 ? 'positive' : overallScore >= 50 ? 'neutral' : 'negative',
      summary: lastMessage?.content?.slice(0, 200) + '...' || '분석 내용이 없습니다.',
      keyArgument: structuredEval?.keyFindings?.[0] || '핵심 논거를 추출할 수 없습니다.',
      confidenceLevel: overallScore || 70,
    };
  });

  // Calculate overall score from agent verdicts
  const overallScore = Math.round(
    agentVerdicts.reduce((sum, v) => sum + (v.confidenceLevel || 70), 0) / agentVerdicts.length
  );

  // Generate summary from messages
  const generateSummary = () => {
    if (report?.executiveSummary) return report.executiveSummary;

    const summaryParts: string[] = [];
    const independentMessages = messages.filter((m) => m.phase === 'independent_analysis');

    if (independentMessages.length > 0) {
      summaryParts.push(`${analysis.company?.name || '대상 기업'}에 대한 ${independentMessages.length}명의 전문가 분석이 완료되었습니다.`);
    }

    const risks = messages
      .flatMap((m) => m.structuredEval?.risks || [])
      .slice(0, 3);
    if (risks.length > 0) {
      summaryParts.push(`\n\n주요 리스크: ${risks.join(', ')}`);
    }

    const opportunities = messages
      .flatMap((m) => m.structuredEval?.opportunities || [])
      .slice(0, 3);
    if (opportunities.length > 0) {
      summaryParts.push(`\n\n기회 요인: ${opportunities.join(', ')}`);
    }

    return summaryParts.join('') || '분석 요약을 생성할 수 없습니다.';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href={`/analysis/${sessionId}`}>
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              토론으로 돌아가기
            </Button>
          </Link>
        </div>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {analysis.company?.name} 투자 분석 리포트
          </h1>
          <p className="text-gray-500">
            {analysis.company?.sector} | 분석 완료: {
              analysis.completedAt
                ? (typeof (analysis.completedAt as any).toDate === 'function'
                    ? (analysis.completedAt as any).toDate().toLocaleDateString('ko-KR')
                    : new Date(analysis.completedAt as any).toLocaleDateString('ko-KR'))
                : '완료'
            }
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <ExecutiveSummary
            summary={generateSummary()}
            overallScore={overallScore}
          />
        </div>

        {/* Agent Verdicts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">전문가별 의견</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentVerdicts.map((verdict) => (
              <AgentVerdictCard key={verdict.agentId} verdict={verdict as any} />
            ))}
          </div>
        </div>

        {/* Key Findings */}
        <div className="mb-8">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">주요 발견사항</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risks */}
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  리스크 요인
                </h3>
                <ul className="space-y-2">
                  {messages
                    .flatMap((m) => m.structuredEval?.risks || [])
                    .filter((r, i, arr) => arr.indexOf(r) === i)
                    .slice(0, 5)
                    .map((risk, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-400 mt-1">-</span>
                        {risk}
                      </li>
                    ))}
                  {messages.flatMap((m) => m.structuredEval?.risks || []).length === 0 && (
                    <li className="text-sm text-gray-400">리스크 정보가 없습니다.</li>
                  )}
                </ul>
              </div>

              {/* Opportunities */}
              <div>
                <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                  기회 요인
                </h3>
                <ul className="space-y-2">
                  {messages
                    .flatMap((m) => m.structuredEval?.opportunities || [])
                    .filter((o, i, arr) => arr.indexOf(o) === i)
                    .slice(0, 5)
                    .map((opp, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">-</span>
                        {opp}
                      </li>
                    ))}
                  {messages.flatMap((m) => m.structuredEval?.opportunities || []).length === 0 && (
                    <li className="text-sm text-gray-400">기회 요인 정보가 없습니다.</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.print()}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            PDF 출력
          </Button>
          <Link href="/dashboard">
            <Button>
              새 분석 시작
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
