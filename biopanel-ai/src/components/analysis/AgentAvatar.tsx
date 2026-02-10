'use client';

import { AgentId } from '@/types/agent';

type AgentStatus = 'waiting' | 'analyzing' | 'speaking' | 'done';

interface AgentAvatarProps {
  agentId: AgentId;
  name: string;
  title: string;
  color: string;
  status: AgentStatus;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getStatusLabel(status: AgentStatus): string {
  switch (status) {
    case 'waiting':
      return '대기 중';
    case 'analyzing':
      return '분석 중';
    case 'speaking':
      return '발언 중';
    case 'done':
      return '완료';
  }
}

function getStatusClasses(status: AgentStatus): string {
  switch (status) {
    case 'waiting':
      return 'bg-gray-100 text-gray-500';
    case 'analyzing':
      return 'bg-yellow-100 text-yellow-700';
    case 'speaking':
      return 'bg-blue-100 text-blue-700';
    case 'done':
      return 'bg-green-100 text-green-700';
  }
}

export default function AgentAvatar({ agentId, name, title, color, status }: AgentAvatarProps) {
  const initials = getInitials(name);
  const isSpeaking = status === 'speaking';
  const isDone = status === 'done';

  return (
    <div
      className={`relative flex items-center gap-3 rounded-xl border-2 bg-white p-3 transition-all duration-300 ${
        isSpeaking ? 'shadow-lg' : 'shadow-sm'
      }`}
      style={{ borderColor: color }}
      data-agent-id={agentId}
    >
      {/* Avatar Circle */}
      <div className="relative flex-shrink-0">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold ${
            isSpeaking ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: color }}
        >
          {isDone ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            initials
          )}
        </div>

        {/* Speaking ring animation */}
        {isSpeaking && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm truncate">{name}</span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusClasses(status)}`}
          >
            {getStatusLabel(status)}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5" title={title}>
          {title}
        </p>
      </div>
    </div>
  );
}
