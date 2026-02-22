'use client';

import { useState } from 'react';
import { EnrichedData } from '@/types/analysis';
import DataDetailModal from './DataDetailModal';

type DataCategory = 'news' | 'clinical' | 'fda' | 'pubmed' | 'financial' | 'competitor';

interface DataCollectionOverviewProps {
  isOpen: boolean;
  onClose: () => void;
  enrichedData: EnrichedData | null;
}

const categories: { id: DataCategory; label: string; icon: string; description: string }[] = [
  { id: 'news', label: '관련 뉴스', icon: '📰', description: '기업 관련 최신 뉴스 및 보도자료' },
  { id: 'clinical', label: '임상시험', icon: '🧪', description: 'ClinicalTrials.gov 임상시험 데이터' },
  { id: 'fda', label: 'FDA 규제', icon: '🛡️', description: 'FDA 승인 이력 및 규제 정보' },
  { id: 'pubmed', label: '학술 논문', icon: '📚', description: 'PubMed 관련 연구 논문' },
  { id: 'financial', label: '재무 데이터', icon: '📊', description: 'SEC/DART 공시 재무 정보' },
  { id: 'competitor', label: '경쟁사 분석', icon: '🏢', description: '동일 적응증 경쟁 파이프라인' },
];

export default function DataCollectionOverview({
  isOpen,
  onClose,
  enrichedData,
}: DataCollectionOverviewProps) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DataCategory>('news');

  if (!isOpen) return null;

  const getCategoryCount = (id: DataCategory): number => {
    if (!enrichedData) return 0;
    switch (id) {
      case 'news':
        return enrichedData.news?.length || 0;
      case 'clinical':
        return enrichedData.clinicalTrials?.length || 0;
      case 'fda':
        return (enrichedData.fdaEvents?.length || 0) + (enrichedData.regulatoryHistory?.length || 0);
      case 'pubmed':
        return enrichedData.recentPapers?.length || 0;
      case 'financial':
        return enrichedData.financials ? 1 : 0;
      case 'competitor':
        return enrichedData.competitors?.length || 0;
      default:
        return 0;
    }
  };

  const handleCategoryClick = (id: DataCategory) => {
    setSelectedCategory(id);
    setDetailModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                    수집된 데이터
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    AI 분석에 사용된 데이터 소스를 확인하세요
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!enrichedData ? (
                <div className="text-center py-8 text-gray-500">
                  수집된 데이터가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => {
                    const count = getCategoryCount(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        disabled={count === 0}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          count > 0
                            ? 'border-gray-200 hover:border-blue-400 hover:shadow-lg bg-white cursor-pointer'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{cat.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{cat.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{cat.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-lg font-bold ${count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                {count}
                              </span>
                              <span className="text-xs text-gray-400">개 항목</span>
                            </div>
                          </div>
                        </div>
                        {count > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-blue-600 font-medium">상세 보기</span>
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Summary */}
              {enrichedData && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        총 {categories.reduce((sum, cat) => sum + getCategoryCount(cat.id), 0)}개의 데이터 수집 완료
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        각 카테고리를 클릭하여 상세 데이터를 확인하세요
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DataDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        category={selectedCategory}
        enrichedData={enrichedData}
      />
    </>
  );
}
