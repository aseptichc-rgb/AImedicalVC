'use client';

import { useState, ReactNode } from 'react';

interface CollapsiblePhaseSectionProps {
  id?: string;
  title: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  itemCount?: number;
  children: ReactNode;
}

export default function CollapsiblePhaseSection({
  id,
  title,
  badge,
  defaultOpen = true,
  itemCount,
  children,
}: CollapsiblePhaseSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="animate-fade-in-up scroll-mt-4">
      {/* Phase Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
      >
        <div className="h-px flex-1 bg-gray-200" />
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </span>
          {itemCount !== undefined && (
            <span className="text-xs text-gray-400">({itemCount})</span>
          )}
          {badge}
        </div>
        <div className="h-px flex-1 bg-gray-200" />
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
