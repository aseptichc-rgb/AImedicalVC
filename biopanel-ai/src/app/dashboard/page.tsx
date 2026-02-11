'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getAllAnalyses, convertTimestamp } from '@/lib/firebase/firestore';
import { AnalysisDoc, AnalysisStatus } from '@/types/analysis';

const statusConfig: Record<AnalysisStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }> = {
  enriching: { label: '데이터 수집 중', variant: 'info' },
  analyzing: { label: '분석 중', variant: 'purple' },
  debating: { label: '토론 진행 중', variant: 'warning' },
  synthesizing: { label: '리포트 생성 중', variant: 'info' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'danger' },
};

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const data = await getAllAnalyses();
        setAnalyses(data);
      } catch (error) {
        console.error('Failed to fetch analyses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              분석 히스토리
            </p>
          </div>
          <Link href="/analysis/new">
            <Button size="md">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              새 분석 시작
            </Button>
          </Link>
        </div>

        {/* Analysis List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : analyses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 분석 기록이 없습니다</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
              바이오/헬스케어 기업을 검색하고 AI 전문가 패널의 심사를 받아보세요.
            </p>
            <Link href="/analysis/new">
              <Button>
                첫 분석 시작하기
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {analyses.map((analysis) => {
              const status = statusConfig[analysis.status];
              const date = analysis.createdAt
                ? convertTimestamp(analysis.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '';

              return (
                <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
                  <Card hover className="h-full">
                    <div className="flex flex-col h-full">
                      {/* Company name and status */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {analysis.company.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {analysis.company.sector}
                            {analysis.company.ticker && ` | ${analysis.company.ticker}`}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      {/* Progress bar */}
                      {analysis.status !== 'completed' && analysis.status !== 'failed' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{analysis.currentPhase || '준비 중'}</span>
                            <span className="text-xs font-medium text-blue-600">{analysis.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${analysis.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Score if completed */}
                      {analysis.status === 'completed' && analysis.report && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                            {analysis.report.overallScore}
                          </div>
                          <span className="text-sm text-green-700 font-medium">종합 점수</span>
                        </div>
                      )}

                      {/* Date and link */}
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{date}</span>
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          {analysis.status === 'completed' ? '리포트 보기' : '상세 보기'}
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
