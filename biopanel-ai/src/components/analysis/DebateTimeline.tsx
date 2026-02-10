'use client';

import { useRef, useEffect, useMemo } from 'react';
import { MessageDoc, ConflictDoc } from '@/types/analysis';
import { AnalysisPhase } from '@/types/agent';
import AgentMessage from './AgentMessage';
import ConflictHighlight from './ConflictHighlight';

interface DebateTimelineProps {
  messages: MessageDoc[];
  conflicts: ConflictDoc[];
}

const PHASE_ORDER: AnalysisPhase[] = [
  'independent_analysis',
  'cross_examination',
  'rebuttal',
  'final_verdict',
];

const PHASE_HEADERS: Record<AnalysisPhase, string> = {
  independent_analysis: 'Phase 1: 독립 분석',
  cross_examination: 'Phase 2: 교차 검증',
  rebuttal: 'Phase 3: 반박',
  final_verdict: 'Phase 4: 최종 의견',
};

const PHASE_DESCRIPTIONS: Record<AnalysisPhase, string> = {
  independent_analysis: '각 전문가가 독립적으로 기업을 분석합니다.',
  cross_examination: '다른 전문가의 분석을 교차 검증하고 질문합니다.',
  rebuttal: '상충되는 의견에 대해 반박하고 근거를 제시합니다.',
  final_verdict: '토론을 종합하여 최종 평가를 제출합니다.',
};

export default function DebateTimeline({ messages, conflicts }: DebateTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group messages by phase
  const groupedMessages = useMemo(() => {
    const groups: Record<string, MessageDoc[]> = {};

    for (const msg of messages) {
      const phase = msg.phase;
      if (!groups[phase]) {
        groups[phase] = [];
      }
      groups[phase].push(msg);
    }

    // Sort messages within each phase by order
    for (const phase of Object.keys(groups)) {
      groups[phase].sort((a, b) => a.order - b.order);
    }

    return groups;
  }, [messages]);

  // Determine which phases have messages
  const activePhasesInOrder = useMemo(() => {
    return PHASE_ORDER.filter((phase) => groupedMessages[phase]?.length > 0);
  }, [groupedMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="h-12 w-12 text-gray-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-sm text-gray-400">아직 토론 메시지가 없습니다.</p>
        <p className="text-xs text-gray-300 mt-1">분석이 시작되면 전문가들의 의견이 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {activePhasesInOrder.map((phase, phaseIdx) => {
        const phaseMessages = groupedMessages[phase] || [];

        // Determine if we should show conflicts between this phase and the next
        const showConflicts =
          phaseIdx < activePhasesInOrder.length - 1 && conflicts.length > 0;

        return (
          <div key={phase}>
            {/* Phase Header */}
            <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 mb-4 -mx-1 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {phaseIdx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {PHASE_HEADERS[phase]}
                  </h3>
                  <p className="text-xs text-gray-500">{PHASE_DESCRIPTIONS[phase]}</p>
                </div>
              </div>
            </div>

            {/* Messages in this phase */}
            <div className="space-y-1">
              {phaseMessages.map((msg) => (
                <AgentMessage
                  key={msg.id}
                  agentName={msg.agentName}
                  agentRole={msg.agentRole}
                  agentId={msg.agentId}
                  content={msg.content}
                  phase={msg.phase}
                  structuredEval={msg.structuredEval}
                  agreementLevel={msg.agreementLevel}
                  order={msg.order}
                />
              ))}
            </div>

            {/* Conflict Highlights between phases */}
            {showConflicts && <ConflictHighlight conflicts={conflicts} />}
          </div>
        );
      })}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
