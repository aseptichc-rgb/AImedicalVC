'use client';

import { Fragment } from 'react';
import {
  EnrichedData,
  ClinicalTrialSummary,
  PaperSummary,
  NewsArticle,
  FDAEvent,
  CompetitorInfo,
  RegulatoryEvent,
} from '@/types/analysis';

type DataCategory = 'news' | 'clinical' | 'fda' | 'pubmed' | 'financial' | 'competitor';

interface DataDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: DataCategory;
  enrichedData: EnrichedData | null;
}

const categoryTitles: Record<DataCategory, string> = {
  news: '관련 뉴스',
  clinical: '임상시험 데이터',
  fda: 'FDA 규제 정보',
  pubmed: '학술 논문',
  financial: '재무 데이터',
  competitor: '경쟁사 분석',
};

const categoryIcons: Record<DataCategory, React.ReactNode> = {
  news: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
  clinical: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  fda: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  pubmed: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  financial: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  competitor: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
};

export default function DataDetailModal({
  isOpen,
  onClose,
  category,
  enrichedData,
}: DataDetailModalProps) {
  if (!isOpen) return null;

  const renderContent = () => {
    if (!enrichedData) {
      return (
        <div className="text-center py-8 text-gray-500">
          데이터가 없습니다.
        </div>
      );
    }

    switch (category) {
      case 'news':
        return <NewsContent news={enrichedData.news} />;
      case 'clinical':
        return <ClinicalContent trials={enrichedData.clinicalTrials} />;
      case 'fda':
        return <FDAContent events={enrichedData.fdaEvents} regulatory={enrichedData.regulatoryHistory} />;
      case 'pubmed':
        return <PubMedContent papers={enrichedData.recentPapers} />;
      case 'financial':
        return <FinancialContent financial={enrichedData.financials} />;
      case 'competitor':
        return <CompetitorContent competitors={enrichedData.competitors} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl transform transition-all max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                {categoryIcons[category]}
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {categoryTitles[category]}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for each category

function NewsContent({ news }: { news: NewsArticle[] }) {
  if (!news || news.length === 0) {
    return <EmptyState message="수집된 뉴스가 없습니다." />;
  }

  const categoryLabels: Record<string, string> = {
    clinical: '임상',
    regulatory: '규제',
    business: '비즈니스',
    digital_health: '디지털헬스',
    general: '일반',
  };

  return (
    <div className="space-y-4">
      {news.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              {article.snippet && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.snippet}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">{article.source}</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-500">{article.publishedAt}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {categoryLabels[article.category] || article.category}
                </span>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
        </a>
      ))}
    </div>
  );
}

function ClinicalContent({ trials }: { trials: ClinicalTrialSummary[] }) {
  if (!trials || trials.length === 0) {
    return <EmptyState message="수집된 임상시험 데이터가 없습니다." />;
  }

  const statusColors: Record<string, string> = {
    Recruiting: 'bg-green-100 text-green-700',
    'Active, not recruiting': 'bg-blue-100 text-blue-700',
    Completed: 'bg-gray-100 text-gray-700',
    Withdrawn: 'bg-red-100 text-red-700',
    Terminated: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      {trials.map((trial) => (
        <div
          key={trial.nctId}
          className="p-4 rounded-xl border border-gray-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {trial.nctId}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[trial.status] || 'bg-gray-100 text-gray-700'}`}>
                  {trial.status}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                  {trial.phase}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                {trial.title}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-gray-500">적응증: </span>
                  <span className="text-gray-900">{trial.condition}</span>
                </div>
                <div>
                  <span className="text-gray-500">중재: </span>
                  <span className="text-gray-900">{trial.intervention}</span>
                </div>
                {trial.enrollment && (
                  <div>
                    <span className="text-gray-500">등록 수: </span>
                    <span className="text-gray-900">{trial.enrollment}명</span>
                  </div>
                )}
                {trial.completionDate && (
                  <div>
                    <span className="text-gray-500">완료 예정: </span>
                    <span className="text-gray-900">{trial.completionDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FDAContent({ events, regulatory }: { events: FDAEvent[]; regulatory: RegulatoryEvent[] }) {
  const hasEvents = events && events.length > 0;
  const hasRegulatory = regulatory && regulatory.length > 0;

  if (!hasEvents && !hasRegulatory) {
    return <EmptyState message="수집된 FDA 데이터가 없습니다." />;
  }

  const eventTypeLabels: Record<string, string> = {
    drug_approval: '의약품 승인',
    device_510k: '510(k) 인허가',
    warning_letter: '경고장',
    recall: '리콜',
    breakthrough: '혁신치료 지정',
  };

  return (
    <div className="space-y-6">
      {hasEvents && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">FDA 이벤트</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-xl border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    event.type === 'drug_approval' || event.type === 'breakthrough' ? 'bg-green-500' :
                    event.type === 'warning_letter' || event.type === 'recall' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {eventTypeLabels[event.type] || event.type}
                      </span>
                      <span className="text-xs text-gray-500">{event.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{event.product || event.applicant}</p>
                    {event.indication && (
                      <p className="text-xs text-gray-600 mt-1">{event.indication}</p>
                    )}
                    {event.decision && (
                      <p className="text-xs text-green-600 mt-1 font-medium">{event.decision}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasRegulatory && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">규제 이력</h3>
          <div className="space-y-3">
            {regulatory.map((event, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {event.agency}
                      </span>
                      <span className="text-xs text-gray-500">{event.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-600 mt-1">{event.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PubMedContent({ papers }: { papers: PaperSummary[] }) {
  if (!papers || papers.length === 0) {
    return <EmptyState message="수집된 논문이 없습니다." />;
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <div
          key={paper.pmid}
          className="p-4 rounded-xl border border-gray-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                {paper.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ` 외 ${paper.authors.length - 3}명`}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-purple-600">{paper.journal}</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">{paper.publishDate}</span>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  PMID: {paper.pmid}
                </span>
              </div>
              {paper.abstract && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-3">{paper.abstract}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancialContent({ financial }: { financial: any }) {
  if (!financial) {
    return <EmptyState message="수집된 재무 데이터가 없습니다." />;
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '-';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const metrics = [
    { label: '시가총액', value: formatCurrency(financial.marketCap), icon: '📊' },
    { label: '매출', value: formatCurrency(financial.revenue), icon: '💰' },
    { label: '현금 보유', value: formatCurrency(financial.cashPosition), icon: '💵' },
    { label: '월 소진율', value: formatCurrency(financial.burnRate), icon: '🔥' },
    { label: '런웨이', value: financial.runway || '-', icon: '🛫' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-gray-200 bg-gray-50"
        >
          <div className="text-2xl mb-2">{metric.icon}</div>
          <p className="text-xs text-gray-500">{metric.label}</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

function CompetitorContent({ competitors }: { competitors: CompetitorInfo[] }) {
  if (!competitors || competitors.length === 0) {
    return <EmptyState message="수집된 경쟁사 데이터가 없습니다." />;
  }

  return (
    <div className="space-y-4">
      {competitors.map((competitor, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-gray-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🏢</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="text-gray-500">파이프라인:</span> {competitor.pipeline}</p>
                <p><span className="text-gray-500">단계:</span> <span className="font-medium text-blue-600">{competitor.stage}</span></p>
                <p><span className="text-gray-500">차별점:</span> {competitor.differentiation}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
