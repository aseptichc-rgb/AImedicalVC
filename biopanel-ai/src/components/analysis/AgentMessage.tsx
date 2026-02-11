'use client';

import React from 'react';
import { AgentId, AnalysisPhase } from '@/types/agent';
import { AgreementLevel } from '@/types/agent';
import Badge from '@/components/ui/Badge';
import { AGENT_REGISTRY } from '@/lib/agents/registry';

interface StructuredEval {
  scores: Record<string, number>;
  keyFindings: string[];
  risks: string[];
  opportunities: string[];
}

interface AgentMessageProps {
  agentName: string;
  agentRole: string;
  agentId: AgentId;
  content: string;
  phase: AnalysisPhase;
  structuredEval?: StructuredEval;
  agreementLevel?: AgreementLevel;
  order: number;
}

const PHASE_LABELS: Record<AnalysisPhase, string> = {
  independent_analysis: '독립 분석',
  cross_examination: '교차 검증',
  rebuttal: '반박',
  final_verdict: '최종 의견',
};

const PHASE_BADGE_VARIANTS: Record<AnalysisPhase, 'info' | 'purple' | 'warning' | 'success'> = {
  independent_analysis: 'info',
  cross_examination: 'purple',
  rebuttal: 'warning',
  final_verdict: 'success',
};

const AGREEMENT_CONFIG: Record<AgreementLevel, { label: string; color: string }> = {
  agree: { label: '동의', color: 'bg-green-100 text-green-700 border-green-300' },
  partially_agree: { label: '부분 동의', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  disagree: { label: '반대', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  strongly_disagree: { label: '강력 반대', color: 'bg-red-100 text-red-700 border-red-300' },
};

/**
 * Renders markdown-like content as safe HTML paragraphs.
 * Supports: paragraphs (double newline), bold (**text**), and single line breaks.
 */
function renderMarkdownContent(content: string): React.ReactElement[] {
  const paragraphs = content.split(/\n{2,}/);

  return paragraphs.map((paragraph, idx) => {
    // Convert **bold** to <strong>
    const parts: (string | React.ReactElement)[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = boldRegex.exec(paragraph)) !== null) {
      if (match.index > lastIndex) {
        parts.push(paragraph.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${idx}-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < paragraph.length) {
      parts.push(paragraph.slice(lastIndex));
    }

    // Handle single line breaks within the paragraph
    const finalParts: (string | React.ReactElement)[] = [];
    parts.forEach((part, partIdx) => {
      if (typeof part === 'string') {
        const lines = part.split('\n');
        lines.forEach((line, lineIdx) => {
          finalParts.push(line);
          if (lineIdx < lines.length - 1) {
            finalParts.push(<br key={`br-${idx}-${partIdx}-${lineIdx}`} />);
          }
        });
      } else {
        finalParts.push(part);
      }
    });

    return (
      <p key={idx} className="mb-3 last:mb-0 leading-relaxed">
        {finalParts}
      </p>
    );
  });
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.min(Math.max(value, 0), 10) * 10;
  let barColor = 'bg-red-400';
  if (percentage >= 70) barColor = 'bg-green-500';
  else if (percentage >= 50) barColor = 'bg-yellow-500';
  else if (percentage >= 30) barColor = 'bg-orange-400';

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 truncate text-gray-600" title={label}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium text-gray-700">{value}/10</span>
    </div>
  );
}

export default function AgentMessage({
  agentName,
  agentRole,
  agentId,
  content,
  phase,
  structuredEval,
  agreementLevel,
  order,
}: AgentMessageProps) {
  const agentColor = AGENT_REGISTRY[agentId]?.color ?? '#6B7280';

  return (
    <div
      className="debate-message animate-fade-in relative pl-4 mb-5"
      style={{ animationDelay: `${order * 80}ms` }}
    >
      {/* Colored left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
        style={{ backgroundColor: agentColor }}
      />

      <div className="bg-white rounded-lg border border-gray-150 shadow-sm p-4">
        {/* Header: agent name, role, phase badge */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Small avatar circle */}
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: agentColor }}
            >
              {agentName.slice(0, 1)}
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-900">{agentName}</span>
              <span className="text-xs text-gray-500 ml-1.5">{agentRole}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {agreementLevel && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${AGREEMENT_CONFIG[agreementLevel].color}`}
              >
                {AGREEMENT_CONFIG[agreementLevel].label}
              </span>
            )}
            <Badge variant={PHASE_BADGE_VARIANTS[phase]} size="sm">
              {PHASE_LABELS[phase]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-800">{renderMarkdownContent(content)}</div>

        {/* Structured Evaluation Scores */}
        {structuredEval && Object.keys(structuredEval.scores).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              평가 점수
            </h4>
            <div className="space-y-1.5">
              {Object.entries(structuredEval.scores).map(([label, value]) => (
                <ScoreBar key={label} label={label} value={value} />
              ))}
            </div>

            {/* Key Findings / Risks / Opportunities summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {structuredEval.keyFindings.length > 0 && (
                <div className="bg-blue-50 rounded-md p-2.5">
                  <h5 className="text-[11px] font-semibold text-blue-700 mb-1">주요 발견</h5>
                  <ul className="text-[11px] text-blue-600 space-y-0.5">
                    {structuredEval.keyFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="mt-0.5 flex-shrink-0">&#8226;</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {structuredEval.risks.length > 0 && (
                <div className="bg-red-50 rounded-md p-2.5">
                  <h5 className="text-[11px] font-semibold text-red-700 mb-1">리스크</h5>
                  <ul className="text-[11px] text-red-600 space-y-0.5">
                    {structuredEval.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="mt-0.5 flex-shrink-0">&#8226;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {structuredEval.opportunities.length > 0 && (
                <div className="bg-green-50 rounded-md p-2.5">
                  <h5 className="text-[11px] font-semibold text-green-700 mb-1">기회</h5>
                  <ul className="text-[11px] text-green-600 space-y-0.5">
                    {structuredEval.opportunities.map((o, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="mt-0.5 flex-shrink-0">&#8226;</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
