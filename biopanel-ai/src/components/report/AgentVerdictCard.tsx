import { AgentVerdict } from '@/types/report';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { getVerdictLabel } from '@/lib/utils/format';
import Card from '@/components/ui/Card';

interface AgentVerdictCardProps {
  verdict: AgentVerdict;
}

export default function AgentVerdictCard({ verdict }: AgentVerdictCardProps) {
  const agent = AGENT_REGISTRY[verdict.agentId];
  const agentColor = agent?.color || '#6b7280';
  const { label: verdictLabel, color: verdictColorClass } = getVerdictLabel(verdict.verdict);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex">
        {/* Left accent border */}
        <div
          className="w-1.5 flex-shrink-0"
          style={{ backgroundColor: agentColor }}
        />

        <div className="flex-1 p-5">
          {/* Header: agent name + verdict badge */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              {verdict.agentName}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${verdictColorClass}`}
            >
              {verdictLabel}
            </span>
          </div>

          {/* Summary text */}
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {verdict.summary}
          </p>

          {/* Key argument highlighted */}
          <div
            className="rounded-lg p-3 mb-4"
            style={{ backgroundColor: `${agentColor}10`, borderLeft: `3px solid ${agentColor}` }}
          >
            <span className="text-xs text-gray-500 font-medium block mb-1">핵심 논거</span>
            <p className="text-sm text-gray-800 leading-relaxed">{verdict.keyArgument}</p>
          </div>

          {/* Confidence level as small progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-medium">확신도</span>
              <span className="text-xs font-semibold text-gray-700">
                {verdict.confidenceLevel}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${verdict.confidenceLevel}%`,
                  backgroundColor: agentColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
