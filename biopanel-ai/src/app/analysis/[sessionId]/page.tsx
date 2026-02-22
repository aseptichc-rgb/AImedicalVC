'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import EnrichmentProgress from '@/components/analysis/EnrichmentProgress';
import CollapsiblePhaseSection from '@/components/analysis/CollapsiblePhaseSection';
import DataDetailModal from '@/components/analysis/DataDetailModal';
import DataCollectionOverview from '@/components/analysis/DataCollectionOverview';
import { useDebateStream } from '@/hooks/useDebateStream';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { AgentId } from '@/types/agent';
import { AnalysisStatus } from '@/types/analysis';
import ReactMarkdown from 'react-markdown';

const phaseLabels: Record<string, string> = {
  enriching: '데이터 수집',
  independent_analysis: '독립 분석',
  cross_examination: '상호 검토',
  rebuttal: '반론',
  final_verdict: '최종 판결',
  synthesizing: '리포트 생성',
};

const phaseOrder = ['enriching', 'independent_analysis', 'cross_examination', 'rebuttal', 'final_verdict', 'synthesizing'];

const statusBadgeConfig: Record<AnalysisStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }> = {
  enriching: { label: '데이터 수집 중', variant: 'info' },
  analyzing: { label: '분석 중', variant: 'purple' },
  debating: { label: '토론 진행 중', variant: 'warning' },
  synthesizing: { label: '리포트 생성 중', variant: 'info' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'danger' },
};

const agreementColors: Record<string, string> = {
  agree: 'text-green-600 bg-green-50',
  partially_agree: 'text-yellow-600 bg-yellow-50',
  disagree: 'text-orange-600 bg-orange-50',
  strongly_disagree: 'text-red-600 bg-red-50',
};

const agreementLabels: Record<string, string> = {
  agree: '동의',
  partially_agree: '부분 동의',
  disagree: '반대',
  strongly_disagree: '강한 반대',
};

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function DebateViewPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const { messages, status, progress, currentPhase, conflicts, report, enrichmentSteps, company, enrichedData } = useDebateStream(sessionId);
  const enrichTriggered = useRef(false);
  const runTriggered = useRef(false);

  // Debug: Log status changes
  useEffect(() => {
    console.log('[Analysis] Status:', status, '| Company:', company?.name, '| Progress:', progress);
  }, [status, company, progress]);

  // Trigger enrichment when status is 'enriching' and company data is available
  useEffect(() => {
    console.log('[Analysis] Checking enrichment trigger - status:', status, 'company:', !!company, 'triggered:', enrichTriggered.current);
    if (status === 'enriching' && company && !enrichTriggered.current) {
      enrichTriggered.current = true;
      console.log('[Analysis] Starting enrichment for:', company.name);
      fetch('/api/analysis/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, company }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('[Analysis] Enrichment response:', data);
        })
        .catch((err) => console.error('[Analysis] Enrichment error:', err));
    }
  }, [status, company, sessionId]);

  // Trigger analysis run when status changes to 'analyzing'
  useEffect(() => {
    console.log('[Analysis] Checking run trigger - status:', status, 'company:', !!company, 'triggered:', runTriggered.current);
    if (status === 'analyzing' && company && !runTriggered.current) {
      runTriggered.current = true;
      console.log('[Analysis] Starting AI analysis for:', company.name);
      fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, company }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('[Analysis] AI analysis response:', data);
        })
        .catch((err) => console.error('[Analysis] Run error:', err));
    }
  }, [status, company, sessionId]);

  const agentIds: AgentId[] = ['oncologist', 'pharmacist', 'analyst', 'regulatory', 'immunologist', 'aseptic'];

  // Modal state for data detail view
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [selectedDataCategory, setSelectedDataCategory] = useState<'news' | 'clinical' | 'fda' | 'pubmed' | 'financial' | 'competitor'>('news');
  const [showDataCollectionPanel, setShowDataCollectionPanel] = useState(false);

  const openDataModal = (category: typeof selectedDataCategory) => {
    setSelectedDataCategory(category);
    setDataModalOpen(true);
  };

  // Group messages by phase
  const messagesByPhase: Record<string, typeof messages> = {};
  messages.forEach((msg) => {
    const phase = msg.phase || 'unknown';
    if (!messagesByPhase[phase]) {
      messagesByPhase[phase] = [];
    }
    messagesByPhase[phase].push(msg);
  });

  // Determine which agents have spoken
  const agentStatuses: Partial<Record<AgentId, 'idle' | 'analyzing' | 'speaking' | 'done'>> = {
    oncologist: 'idle',
    pharmacist: 'idle',
    analyst: 'idle',
    regulatory: 'idle',
    immunologist: 'idle',
    aseptic: 'idle',
  };

  const spokenAgents = new Set(messages.map((m) => m.agentId));
  agentIds.forEach((id) => {
    if (spokenAgents.has(id)) {
      agentStatuses[id] = 'done';
    }
  });

  // If we are in an active phase, mark the latest agent as speaking
  if (status !== 'completed' && status !== 'failed' && messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.agentId) {
      agentStatuses[lastMsg.agentId as AgentId] = 'speaking';
    }
    // Mark agents that haven't spoken in current phase as analyzing
    agentIds.forEach((id) => {
      if (!spokenAgents.has(id) && status === 'analyzing') {
        agentStatuses[id] = 'analyzing';
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Bar: Status and Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">AI 토론 진행</h1>
              <Badge variant={statusBadgeConfig[status].variant}>
                {statusBadgeConfig[status].label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {enrichedData && (
                <Link href={`/analysis/${sessionId}/data`}>
                  <Button size="sm" variant="outline">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                    수집 데이터
                  </Button>
                </Link>
              )}
              {status === 'completed' && (
                <Link href={`/analysis/${sessionId}/report`}>
                  <Button size="sm">
                    리포트 보기
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Phase Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-1 mb-2">
              {phaseOrder.map((phase, i) => {
                const currentIdx = phaseOrder.indexOf(currentPhase);
                const isActive = i === currentIdx;
                const isComplete = i < currentIdx || status === 'completed';
                const isClickable = isComplete && (phase === 'enriching' ? !!enrichedData : !!messagesByPhase[phase]?.length);

                const handlePhaseClick = () => {
                  if (!isClickable) return;
                  if (phase === 'enriching') {
                    // Open data collection overview modal
                    setShowDataCollectionPanel(true);
                  } else {
                    // Scroll to section
                    const element = document.getElementById(`phase-${phase}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                };

                return (
                  <div key={phase} className="flex-1 flex items-center">
                    <button
                      onClick={handlePhaseClick}
                      disabled={!isClickable}
                      className={`flex-1 ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                    >
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isComplete
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                            : isActive
                              ? 'bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse'
                              : 'bg-gray-100'
                        }`}
                      />
                      <p className={`text-xs mt-1 text-center flex items-center justify-center gap-1 ${
                        isActive ? 'text-blue-600 font-semibold' : isComplete ? 'text-gray-600' : 'text-gray-400'
                      } ${isClickable ? 'hover:text-blue-600' : ''}`}>
                        {phaseLabels[phase] || phase}
                        {isClickable && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </p>
                    </button>
                    {i < phaseOrder.length - 1 && <div className="w-1" />}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">진행률</span>
              <span className="text-xs font-semibold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expert Panel - Horizontal Layout */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              전문가 패널
            </h2>
            {conflicts.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-orange-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{conflicts.length}개 논쟁 포인트</span>
              </div>
            )}
          </div>

          {/* Horizontal Agent Cards */}
          <div className="flex flex-wrap gap-2">
            {agentIds.map((id) => {
              const agent = AGENT_REGISTRY[id];
              const agentStatus = agentStatuses[id];
              const agentMessages = messages.filter((m) => m.agentId === id);

              return (
                <div
                  key={id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    agentStatus === 'speaking'
                      ? 'bg-white border-green-300 shadow-md ring-2 ring-green-100'
                      : agentStatus === 'analyzing'
                        ? 'bg-yellow-50 border-yellow-200'
                        : agentStatus === 'done'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                    >
                      {agent.name[0]}
                    </div>
                    {agentStatus === 'speaking' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse-dot" />
                    )}
                    {agentStatus === 'analyzing' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                        {agent.name}
                      </span>
                      {agentStatus === 'speaking' && (
                        <span className="text-[10px] text-green-600 font-medium px-1.5 py-0.5 bg-green-100 rounded-full">발언 중</span>
                      )}
                      {agentStatus === 'analyzing' && (
                        <span className="text-[10px] text-yellow-600 font-medium px-1.5 py-0.5 bg-yellow-100 rounded-full">분석 중</span>
                      )}
                      {agentStatus === 'done' && agentMessages.length > 0 && (
                        <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-full">{agentMessages.length}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                      {agent.title.split('/')[0].trim()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conflicts - Inline Display */}
          {conflicts.length > 0 && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex flex-wrap gap-2">
                {conflicts.map((conflict, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-orange-200 text-xs">
                    <Badge
                      variant={conflict.severity === 'major' ? 'danger' : conflict.severity === 'moderate' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {conflict.severity === 'major' ? '주요' : conflict.severity === 'moderate' ? '보통' : '경미'}
                    </Badge>
                    <span className="text-gray-700 font-medium">{conflict.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Area: Debate Timeline - Full Width */}
        <div>
            <div className="space-y-6">
              {messages.length === 0 && status !== 'completed' && (
                <>
                  {status === 'enriching' ? (
                    <EnrichmentProgress
                      steps={enrichmentSteps.length > 0 ? enrichmentSteps : undefined}
                      companyName={company?.name}
                      sector={company?.sector}
                      enrichedData={enrichedData}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <LoadingSpinner size="lg" />
                      <p className="text-sm text-gray-500 mt-4">
                        AI 전문가 패널이 분석을 준비하고 있습니다...
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Data Collection Section - Shows collected data after enrichment */}
              {enrichedData && status !== 'enriching' && (
                <CollapsiblePhaseSection
                  title="데이터 수집"
                  defaultOpen={false}
                  badge={
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      완료
                    </span>
                  }
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'news', label: '관련 뉴스', icon: '📰', count: enrichedData.news?.length || 0 },
                      { id: 'clinical', label: '임상시험', icon: '🧪', count: enrichedData.clinicalTrials?.length || 0 },
                      { id: 'fda', label: 'FDA 규제', icon: '🛡️', count: (enrichedData.fdaEvents?.length || 0) + (enrichedData.regulatoryHistory?.length || 0) },
                      { id: 'pubmed', label: '학술 논문', icon: '📚', count: enrichedData.recentPapers?.length || 0 },
                      { id: 'financial', label: '재무 데이터', icon: '📊', count: enrichedData.financials ? 1 : 0 },
                      { id: 'competitor', label: '경쟁사 분석', icon: '🏢', count: enrichedData.competitors?.length || 0 },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => openDataModal(item.id as typeof selectedDataCategory)}
                        className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.count}개 항목</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-blue-600">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          상세 보기
                        </div>
                      </button>
                    ))}
                  </div>
                </CollapsiblePhaseSection>
              )}

              {phaseOrder.map((phase) => {
                const phaseMessages = messagesByPhase[phase];
                if (!phaseMessages || phaseMessages.length === 0) return null;

                return (
                  <CollapsiblePhaseSection
                    key={phase}
                    id={`phase-${phase}`}
                    title={phaseLabels[phase] || phase}
                    itemCount={phaseMessages.length}
                    defaultOpen={true}
                  >
                    {/* Messages */}
                    <div className="space-y-4">
                      {phaseMessages.map((msg, i) => {
                        const agent = AGENT_REGISTRY[msg.agentId as AgentId];
                        if (!agent) return null;

                        return (
                          <div key={msg.id || i} className="debate-message">
                            <Card padding="none" className="overflow-hidden">
                              {/* Message Header */}
                              <div
                                className="px-5 py-3 flex items-center gap-3 border-b"
                                style={{ borderColor: `${agent.color}20`, backgroundColor: `${agent.color}08` }}
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                  style={{ backgroundColor: agent.color }}
                                >
                                  {agent.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{agent.title.split('/')[0].trim()}</span>
                                  </div>
                                </div>
                                {msg.agreementLevel && (
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${agreementColors[msg.agreementLevel] || ''}`}>
                                    {agreementLabels[msg.agreementLevel] || msg.agreementLevel}
                                  </span>
                                )}
                              </div>

                              {/* Message Body */}
                              <div className="px-5 py-4">
                                <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h3:text-base prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                                  <ReactMarkdown>
                                    {msg.content?.replace(/```json[\s\S]*?```/g, '') || ''}
                                  </ReactMarkdown>
                                </div>

                                {/* Structured Evaluation */}
                                {msg.structuredEval && (
                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    {/* Scores */}
                                    {msg.structuredEval.scores && Object.keys(msg.structuredEval.scores).length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-xs font-semibold text-gray-500 mb-2">평가 점수</p>
                                        <div className="flex flex-wrap gap-2">
                                          {Object.entries(msg.structuredEval.scores).map(([key, value]) => (
                                            <div
                                              key={key}
                                              className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100"
                                            >
                                              <span className="text-xs text-gray-500">{key}</span>
                                              <span className="ml-2 text-sm font-bold" style={{ color: agent.color }}>
                                                {value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Key Findings */}
                                    {msg.structuredEval.keyFindings && msg.structuredEval.keyFindings.length > 0 && (
                                      <div className="mb-2">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">주요 발견</p>
                                        <ul className="space-y-1">
                                          {msg.structuredEval.keyFindings.map((f: string, fi: number) => (
                                            <li key={fi} className="text-xs text-gray-600 flex items-start gap-1.5">
                                              <span className="text-blue-500 mt-0.5">-</span>
                                              {f}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Risks */}
                                    {msg.structuredEval.risks && msg.structuredEval.risks.length > 0 && (
                                      <div className="mb-2">
                                        <p className="text-xs font-semibold text-red-500 mb-1">리스크</p>
                                        <ul className="space-y-1">
                                          {msg.structuredEval.risks.map((r: string, ri: number) => (
                                            <li key={ri} className="text-xs text-gray-600 flex items-start gap-1.5">
                                              <span className="text-red-400 mt-0.5">-</span>
                                              {r}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Opportunities */}
                                    {msg.structuredEval.opportunities && msg.structuredEval.opportunities.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-green-600 mb-1">기회 요인</p>
                                        <ul className="space-y-1">
                                          {msg.structuredEval.opportunities.map((o: string, oi: number) => (
                                            <li key={oi} className="text-xs text-gray-600 flex items-start gap-1.5">
                                              <span className="text-green-500 mt-0.5">-</span>
                                              {o}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsiblePhaseSection>
                );
              })}

              {/* Completion CTA */}
              {status === 'completed' && (
                <div className="animate-fade-in-up">
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">토론이 완료되었습니다</h3>
                          <p className="text-sm text-gray-600">
                            {report?.overallScore
                              ? `종합 점수: ${report.overallScore}점`
                              : '구조화된 리포트가 준비되었습니다.'}
                          </p>
                        </div>
                      </div>
                      <Link href={`/analysis/${sessionId}/report`}>
                        <Button>
                          전체 리포트 보기
                          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              )}

              {/* Live indicator for active state */}
              {status !== 'completed' && status !== 'failed' && messages.length > 0 && (
                <div className="flex items-center gap-2 py-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-dot" style={{ animationDelay: '600ms' }} />
                  </div>
                  <span className="text-sm text-gray-500">AI 전문가가 토론을 계속하고 있습니다...</span>
                </div>
              )}
            </div>
        </div>
      </main>

      {/* Data Detail Modal */}
      <DataDetailModal
        isOpen={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        category={selectedDataCategory}
        enrichedData={enrichedData}
      />

      {/* Data Collection Overview Modal */}
      <DataCollectionOverview
        isOpen={showDataCollectionPanel}
        onClose={() => setShowDataCollectionPanel(false)}
        enrichedData={enrichedData}
      />
    </div>
  );
}
