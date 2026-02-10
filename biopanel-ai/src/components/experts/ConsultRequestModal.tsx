'use client';

import { useEffect, useRef } from 'react';
import ConsultRequestForm from './ConsultRequestForm';

interface ConsultRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  expertId: string;
  expertName: string;
  expertSpecialty: string;
  linkedAnalysisId?: string;
  linkedCompany?: string;
  aiReportSummary?: string;
}

export default function ConsultRequestModal({
  isOpen,
  onClose,
  expertId,
  expertName,
  expertSpecialty,
  linkedAnalysisId,
  linkedCompany,
  aiReportSummary,
}: ConsultRequestModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close when clicking backdrop
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="상담 요청"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          aria-label="닫기"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Form */}
        <ConsultRequestForm
          expertId={expertId}
          expertName={expertName}
          expertSpecialty={expertSpecialty}
          linkedAnalysisId={linkedAnalysisId}
          linkedCompany={linkedCompany}
          aiReportSummary={aiReportSummary}
        />
      </div>
    </div>
  );
}
