'use client';

import { use } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useDebateStream } from '@/hooks/useDebateStream';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { AgentId, AnalysisPhase } from '@/types/agent';
import { AnalysisStatus } from '@/types/analysis';

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
  const { messages, status, progress, currentPhase, conflicts, report } = useDebateStream(sessionId);

  const agentIds: AgentId[] = ['oncologist', 'pharmacist', 'analyst', 'regulatory', 'immunologist'];

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
  const agentStatuses: Record<AgentId, 'idle' | 'analyzing' | 'speaking' | 'done'> = {
    oncologist: 'idle',
    pharmacist: 'idle',
    analyst: 'idle',
    regulatory: 'idle',
    immunologist: 'idle',
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

          {/* Phase Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-1 mb-2">
              {phaseOrder.map((phase, i) => {
                const currentIdx = phaseOrder.indexOf(currentPhase);
                const isActive = i === currentIdx;
                const isComplete = i < currentIdx || status === 'completed';
                return (
                  <div key={phase} className="flex-1 flex items-center">
                    <div className="flex-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isComplete
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                            : isActive
                              ? 'bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse'
                              : 'bg-gray-100'
                        }`}
                      />
                      <p className={`text-xs mt-1 text-center ${isActive ? 'text-blue-600 font-semibold' : isComplete ? 'text-gray-600' : 'text-gray-400'}`}>
                        {phaseLabels[phase] || phase}
                      </p>
                    </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Agent Panel */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              전문가 패널
            </h2>
            {agentIds.map((id) => {
              const agent = AGENT_REGISTRY[id];
              const agentStatus = agentStatuses[id];
              const agentMessages = messages.filter((m) => m.agentId === id);

              return (
                <Card key={id} padding="sm" className="relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1"
                    style={{ backgroundColor: agent.color }}
                  />
                  <div className="pl-3 flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.name[0]}
                      </div>
                      {agentStatus === 'speaking' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white animate-pulse-dot" />
                      )}
                      {agentStatus === 'analyzing' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-white animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{agent.name}</h3>
                        {agentStatus === 'speaking' && (
                          <span className="text-xs text-green-600 font-medium">발언 중</span>
                        )}
                        {agentStatus === 'analyzing' && (
                          <span className="text-xs text-yellow-600 font-medium">분석 중</span>
                        )}
                        {agentStatus === 'done' && (
                          <span className="text-xs text-gray-400">완료</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{agent.title.split('/')[0].trim()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{agentMessages.length}개 메시지</p>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  논쟁 포인트
                </h2>
                {conflicts.map((conflict, i) => (
                  <Card key={i} padding="sm" className="mb-2">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{conflict.topic}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{conflict.description}</p>
                        <Badge
                          variant={conflict.severity === 'major' ? 'danger' : conflict.severity === 'moderate' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {conflict.severity === 'major' ? '주요' : conflict.severity === 'moderate' ? '보통' : '경미'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Main Area: Debate Timeline */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {messages.length === 0 && status !== 'completed' && (
                <div className="flex flex-col items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                  <p className="text-sm text-gray-500 mt-4">
                    {status === 'enriching'
                      ? '외부 데이터를 수집하고 있습니다...'
                      : 'AI 전문가 패널이 분석을 준비하고 있습니다...'}
                  </p>
                </div>
              )}

              {phaseOrder.map((phase) => {
                const phaseMessages = messagesByPhase[phase];
                if (!phaseMessages || phaseMessages.length === 0) return null;

                return (
                  <div key={phase} className="animate-fade-in-up">
                    {/* Phase Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 bg-gray-100 rounded-full">
                        {phaseLabels[phase] || phase}
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

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
                                    <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
                                    <span className="text-xs text-gray-500">{msg.agentRole || agent.title.split('/')[0].trim()}</span>
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
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {msg.content}
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
                  </div>
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
        </div>
      </main>
    </div>
  );
}
