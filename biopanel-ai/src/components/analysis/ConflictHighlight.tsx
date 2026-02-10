'use client';

import { ConflictDoc } from '@/types/analysis';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { AgentId } from '@/types/agent';

interface ConflictHighlightProps {
  conflicts: ConflictDoc[];
}

const SEVERITY_CONFIG: Record<
  ConflictDoc['severity'],
  { label: string; badge: string }
> = {
  minor: {
    label: '경미',
    badge: 'bg-yellow-200 text-yellow-800',
  },
  moderate: {
    label: '보통',
    badge: 'bg-orange-200 text-orange-800',
  },
  major: {
    label: '중대',
    badge: 'bg-red-200 text-red-800',
  },
};

function getAgentName(agentId: AgentId): string {
  return AGENT_REGISTRY[agentId]?.name ?? agentId;
}

function getAgentColor(agentId: AgentId): string {
  return AGENT_REGISTRY[agentId]?.color ?? '#6B7280';
}

export default function ConflictHighlight({ conflicts }: ConflictHighlightProps) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="my-4 rounded-xl border border-amber-300 bg-amber-50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-amber-100 border-b border-amber-200">
        {/* Lightning bolt icon */}
        <svg
          className="h-5 w-5 text-amber-600 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="font-semibold text-amber-800 text-sm">
          의견 충돌 감지 ({conflicts.length}건)
        </h3>
      </div>

      {/* Conflicts List */}
      <div className="divide-y divide-amber-200">
        {conflicts.map((conflict) => {
          const severityConfig = SEVERITY_CONFIG[conflict.severity];

          return (
            <div key={conflict.id} className="px-5 py-4">
              {/* Topic and severity */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">{conflict.topic}</h4>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${severityConfig.badge}`}
                >
                  {severityConfig.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-3">{conflict.description}</p>

              {/* Agent Positions */}
              <div className="space-y-2">
                {conflict.agentPositions.map((pos) => (
                  <div
                    key={pos.agentId}
                    className="flex items-start gap-2 pl-3 border-l-2 text-xs"
                    style={{ borderColor: getAgentColor(pos.agentId) }}
                  >
                    <span
                      className="font-semibold flex-shrink-0 mt-0.5"
                      style={{ color: getAgentColor(pos.agentId) }}
                    >
                      {getAgentName(pos.agentId)}
                    </span>
                    <span className="text-gray-600 flex-1">{pos.position}</span>
                    <span className="text-gray-400 flex-shrink-0 ml-1">
                      확신도 {Math.round(pos.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Resolution if available */}
              {conflict.resolution && (
                <div className="mt-3 p-2.5 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg
                      className="h-3.5 w-3.5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-[11px] font-semibold text-green-700">해결</span>
                  </div>
                  <p className="text-xs text-gray-700">{conflict.resolution}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
