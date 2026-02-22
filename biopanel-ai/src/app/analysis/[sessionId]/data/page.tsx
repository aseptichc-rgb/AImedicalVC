'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  EnrichedData,
  NewsArticle,
  ClinicalTrialSummary,
  FDAEvent,
  RegulatoryEvent,
  PaperSummary,
  CompetitorInfo,
} from '@/types/analysis';
import { CompanyInput } from '@/types/company';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type TabId = 'all' | 'news' | 'clinical' | 'fda' | 'pubmed' | 'financial' | 'competitor';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '📋' },
  { id: 'news', label: '뉴스', icon: '📰' },
  { id: 'clinical', label: '임상시험', icon: '🧪' },
  { id: 'fda', label: 'FDA', icon: '🛡️' },
  { id: 'pubmed', label: '논문', icon: '📚' },
  { id: 'financial', label: '재무', icon: '📊' },
  { id: 'competitor', label: '경쟁사', icon: '🏢' },
];

export default function DataCollectionPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null);
  const [company, setCompany] = useState<CompanyInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('all');

  useEffect(() => {
    const sessionRef = doc(db, 'analyses', sessionId);
    const unsubscribe = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setEnrichedData(data.enrichedData || null);
        setCompany(data.company || null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const getCategoryCount = (id: TabId): number => {
    if (!enrichedData || id === 'all') return 0;
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

  const totalCount = enrichedData
    ? (enrichedData.news?.length || 0) +
      (enrichedData.clinicalTrials?.length || 0) +
      (enrichedData.fdaEvents?.length || 0) +
      (enrichedData.regulatoryHistory?.length || 0) +
      (enrichedData.recentPapers?.length || 0) +
      (enrichedData.financials ? 1 : 0) +
      (enrichedData.competitors?.length || 0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link href={`/analysis/${sessionId}`} className="hover:text-blue-600">
                  ← 토론으로 돌아가기
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">📊</span>
                수집된 데이터
                {company && (
                  <Badge variant="purple">{company.name}</Badge>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                AI 전문가 패널이 분석에 활용한 모든 데이터를 확인하세요
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
              <p className="text-xs text-gray-500">총 수집 항목</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const count = tab.id === 'all' ? totalCount : getCategoryCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:shadow'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!enrichedData ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">수집된 데이터가 없습니다.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* News Section */}
            {(activeTab === 'all' || activeTab === 'news') && enrichedData.news && enrichedData.news.length > 0 && (
              <section id="news">
                <SectionHeader icon="📰" title="관련 뉴스" count={enrichedData.news.length} color="blue" />
                <div className="grid gap-4 md:grid-cols-2">
                  {enrichedData.news.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {/* Clinical Trials Section */}
            {(activeTab === 'all' || activeTab === 'clinical') && enrichedData.clinicalTrials && enrichedData.clinicalTrials.length > 0 && (
              <section id="clinical">
                <SectionHeader icon="🧪" title="임상시험 데이터" count={enrichedData.clinicalTrials.length} color="green" />
                <div className="grid gap-4">
                  {enrichedData.clinicalTrials.map((trial) => (
                    <ClinicalTrialCard key={trial.nctId} trial={trial} />
                  ))}
                </div>
              </section>
            )}

            {/* FDA Section */}
            {(activeTab === 'all' || activeTab === 'fda') && (
              (enrichedData.fdaEvents?.length || 0) + (enrichedData.regulatoryHistory?.length || 0) > 0
            ) && (
              <section id="fda">
                <SectionHeader
                  icon="🛡️"
                  title="FDA 및 규제 정보"
                  count={(enrichedData.fdaEvents?.length || 0) + (enrichedData.regulatoryHistory?.length || 0)}
                  color="purple"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {enrichedData.fdaEvents?.map((event) => (
                    <FDAEventCard key={event.id} event={event} />
                  ))}
                  {enrichedData.regulatoryHistory?.map((event, i) => (
                    <RegulatoryCard key={i} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* PubMed Section */}
            {(activeTab === 'all' || activeTab === 'pubmed') && enrichedData.recentPapers && enrichedData.recentPapers.length > 0 && (
              <section id="pubmed">
                <SectionHeader icon="📚" title="학술 논문" count={enrichedData.recentPapers.length} color="indigo" />
                <div className="grid gap-4">
                  {enrichedData.recentPapers.map((paper) => (
                    <PaperCard key={paper.pmid} paper={paper} />
                  ))}
                </div>
              </section>
            )}

            {/* Financial Section */}
            {(activeTab === 'all' || activeTab === 'financial') && enrichedData.financials && (
              <section id="financial">
                <SectionHeader icon="📊" title="재무 데이터" count={1} color="emerald" />
                <FinancialCard financial={enrichedData.financials} />
              </section>
            )}

            {/* Competitor Section */}
            {(activeTab === 'all' || activeTab === 'competitor') && enrichedData.competitors && enrichedData.competitors.length > 0 && (
              <section id="competitor">
                <SectionHeader icon="🏢" title="경쟁사 분석" count={enrichedData.competitors.length} color="orange" />
                <div className="grid gap-4 md:grid-cols-2">
                  {enrichedData.competitors.map((competitor, i) => (
                    <CompetitorCard key={i} competitor={competitor} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Section Header Component
function SectionHeader({
  icon,
  title,
  count,
  color,
}: {
  icon: string;
  title: string;
  count: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{count}개 항목</p>
      </div>
    </div>
  );
}

// News Card Component
function NewsCard({ article }: { article: NewsArticle }) {
  const categoryLabels: Record<string, { label: string; color: string }> = {
    clinical: { label: '임상', color: 'bg-green-100 text-green-700' },
    regulatory: { label: '규제', color: 'bg-purple-100 text-purple-700' },
    business: { label: '비즈니스', color: 'bg-blue-100 text-blue-700' },
    digital_health: { label: '디지털헬스', color: 'bg-cyan-100 text-cyan-700' },
    general: { label: '일반', color: 'bg-gray-100 text-gray-700' },
  };

  const cat = categoryLabels[article.category] || categoryLabels.general;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.snippet && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.snippet}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
              {cat.label}
            </span>
            <span className="text-xs text-gray-500">{article.source}</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </div>
    </a>
  );
}

// Clinical Trial Card Component
function ClinicalTrialCard({ trial }: { trial: ClinicalTrialSummary }) {
  const statusColors: Record<string, string> = {
    Recruiting: 'bg-green-100 text-green-700 border-green-200',
    'Active, not recruiting': 'bg-blue-100 text-blue-700 border-blue-200',
    Completed: 'bg-gray-100 text-gray-700 border-gray-200',
    Withdrawn: 'bg-red-100 text-red-700 border-red-200',
    Terminated: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🧪</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <a
              href={`https://clinicaltrials.gov/study/${trial.nctId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              {trial.nctId}
            </a>
            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${statusColors[trial.status] || 'bg-gray-100 text-gray-700'}`}>
              {trial.status}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              {trial.phase}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3">
            {trial.title}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 rounded-lg bg-gray-50">
              <span className="text-gray-500 block mb-0.5">적응증</span>
              <span className="text-gray-900 font-medium">{trial.condition}</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <span className="text-gray-500 block mb-0.5">중재</span>
              <span className="text-gray-900 font-medium">{trial.intervention}</span>
            </div>
            {trial.enrollment && (
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="text-gray-500 block mb-0.5">등록 수</span>
                <span className="text-gray-900 font-medium">{trial.enrollment}명</span>
              </div>
            )}
            {trial.completionDate && (
              <div className="p-2 rounded-lg bg-gray-50">
                <span className="text-gray-500 block mb-0.5">완료 예정</span>
                <span className="text-gray-900 font-medium">{trial.completionDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// FDA Event Card Component
function FDAEventCard({ event }: { event: FDAEvent }) {
  const eventTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
    drug_approval: { label: '의약품 승인', color: 'bg-green-100 text-green-700', icon: '✅' },
    device_510k: { label: '510(k) 인허가', color: 'bg-blue-100 text-blue-700', icon: '📋' },
    warning_letter: { label: '경고장', color: 'bg-red-100 text-red-700', icon: '⚠️' },
    recall: { label: '리콜', color: 'bg-red-100 text-red-700', icon: '🔄' },
    breakthrough: { label: '혁신치료 지정', color: 'bg-purple-100 text-purple-700', icon: '🌟' },
  };

  const config = eventTypeConfig[event.type] || { label: event.type, color: 'bg-gray-100 text-gray-700', icon: '📄' };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-500">{event.date}</span>
          </div>
          <p className="font-semibold text-gray-900">{event.product || event.applicant}</p>
          {event.indication && (
            <p className="text-sm text-gray-600 mt-1">{event.indication}</p>
          )}
          {event.decision && (
            <p className="text-sm text-green-600 font-medium mt-2">{event.decision}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Regulatory Event Card Component
function RegulatoryCard({ event }: { event: RegulatoryEvent }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🏛️</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              {event.agency}
            </span>
            <span className="text-xs text-gray-500">{event.date}</span>
          </div>
          <p className="font-semibold text-gray-900">{event.event}</p>
          <p className="text-sm text-gray-600 mt-1">{event.outcome}</p>
        </div>
      </div>
    </Card>
  );
}

// Paper Card Component
function PaperCard({ paper }: { paper: PaperSummary }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📄</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
            {paper.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            {paper.authors.slice(0, 3).join(', ')}
            {paper.authors.length > 3 && ` 외 ${paper.authors.length - 3}명`}
          </p>
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-medium text-indigo-600">{paper.journal}</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">{paper.publishDate}</span>
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
            >
              PMID: {paper.pmid}
            </a>
          </div>
          {paper.abstract && (
            <p className="text-xs text-gray-600 mt-3 line-clamp-3 bg-gray-50 p-3 rounded-lg">
              {paper.abstract}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Financial Card Component
function FinancialCard({ financial }: { financial: any }) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return '-';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const metrics = [
    { label: '시가총액', value: formatCurrency(financial.marketCap), icon: '📊', color: 'from-blue-400 to-blue-500' },
    { label: '매출', value: formatCurrency(financial.revenue), icon: '💰', color: 'from-green-400 to-green-500' },
    { label: '현금 보유', value: formatCurrency(financial.cashPosition), icon: '💵', color: 'from-emerald-400 to-emerald-500' },
    { label: '월 소진율', value: formatCurrency(financial.burnRate), icon: '🔥', color: 'from-orange-400 to-orange-500' },
    { label: '런웨이', value: financial.runway || '-', icon: '🛫', color: 'from-purple-400 to-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="p-5 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
            <span className="text-xl">{metric.icon}</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
          <p className="text-xl font-bold text-gray-900">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

// Competitor Card Component
function CompetitorCard({ competitor }: { competitor: CompetitorInfo }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🏢</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-3">{competitor.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-gray-500 flex-shrink-0">파이프라인:</span>
              <span className="text-gray-900">{competitor.pipeline}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500 flex-shrink-0">단계:</span>
              <span className="font-medium text-blue-600">{competitor.stage}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500 flex-shrink-0">차별점:</span>
              <span className="text-gray-900">{competitor.differentiation}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
