'use client';

import { useState } from 'react';
import { DissensusPoint } from '@/types/report';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import Card from '@/components/ui/Card';

interface ConsensusViewProps {
  consensusPoints: string[];
  dissensusPoints: DissensusPoint[];
}

export default function ConsensusView({ consensusPoints, dissensusPoints }: ConsensusViewProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

  function toggleTopic(index: number) {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Consensus section */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <h2 className="text-xl font-bold text-gray-900">합의 사항</h2>
        </div>

        {consensusPoints.length === 0 ? (
          <p className="text-gray-500 text-sm">합의된 사항이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {consensusPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Dissensus section */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">의견 분기</h2>
        </div>

        {dissensusPoints.length === 0 ? (
          <p className="text-gray-500 text-sm">의견 분기가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {dissensusPoints.map((point, index) => {
              const isExpanded = expandedTopics.has(index);

              return (
                <div
                  key={index}
                  className="border border-orange-200 rounded-lg overflow-hidden bg-orange-50/50"
                >
                  {/* Topic header (clickable) */}
                  <button
                    onClick={() => toggleTopic(index)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{point.topic}</span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded agent positions */}
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2 border-t border-orange-200">
                      {point.positions.map((pos, pi) => {
                        const agent = AGENT_REGISTRY[pos.agentId];
                        return (
                          <div
                            key={pi}
                            className="flex items-start gap-3 pt-2"
                          >
                            <div
                              className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: agent?.color || '#6b7280' }}
                            />
                            <div className="min-w-0">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: agent?.color || '#6b7280' }}
                              >
                                {agent?.name || pos.agentId}
                              </span>
                              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                {pos.view}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
