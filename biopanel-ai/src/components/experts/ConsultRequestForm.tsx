'use client';

import { useState, FormEvent } from 'react';
import { ConsultMethod } from '@/types/expert';
import { useConsultRequest } from '@/hooks/useConsultRequest';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ConsultRequestFormProps {
  expertId: string;
  expertName: string;
  expertSpecialty: string;
  linkedAnalysisId?: string;
  linkedCompany?: string;
  aiReportSummary?: string;
}

const METHODS: { value: ConsultMethod; label: string }[] = [
  { value: 'video', label: '화상통화' },
  { value: 'phone', label: '전화' },
  { value: 'email', label: '이메일' },
  { value: 'in_person', label: '대면' },
];

export default function ConsultRequestForm({
  expertId,
  expertName,
  expertSpecialty,
  linkedAnalysisId,
  linkedCompany,
  aiReportSummary,
}: ConsultRequestFormProps) {
  const { submitRequest, loading, success, error, reset } = useConsultRequest();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<ConsultMethod>('video');
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [userCompany, setUserCompany] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [attachReport, setAttachReport] = useState(true);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    await submitRequest({
      expertId,
      expertName,
      expertSpecialty,
      subject: subject.trim(),
      message: message.trim(),
      preferredMethod,
      preferredSchedule: preferredSchedule.trim() || undefined,
      urgency,
      linkedAnalysisId: attachReport && linkedAnalysisId ? linkedAnalysisId : undefined,
      linkedCompany: attachReport && linkedCompany ? linkedCompany : undefined,
      aiReportSummary: attachReport && aiReportSummary ? aiReportSummary : undefined,
      userCompany: userCompany.trim() || undefined,
      userPhone: userPhone.trim() || undefined,
    });
  };

  // Success state
  if (success) {
    return (
      <Card padding="lg">
        <div className="text-center py-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">상담 요청 완료</h3>
          <p className="text-sm text-gray-500 mb-6">
            {expertName} 전문가에게 상담 요청이 전송되었습니다.
            <br />
            빠른 시일 내에 응답을 받으실 수 있습니다.
          </p>
          <Button variant="outline" size="md" onClick={reset}>
            새 요청 작성
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">상담 요청</h2>
        <p className="mt-1 text-sm text-gray-500">
          {expertName} 전문가에게 상담을 요청합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subject */}
        <div>
          <label htmlFor="consult-subject" className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="consult-subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="상담 주제를 입력하세요"
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="consult-message" className="block text-sm font-medium text-gray-700 mb-1">
            상담 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="consult-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="상담하고자 하는 내용을 상세히 기술해 주세요."
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Preferred Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            선호 상담 방법
          </label>
          <div className="flex flex-wrap gap-3">
            {METHODS.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                  preferredMethod === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="preferredMethod"
                  value={value}
                  checked={preferredMethod === value}
                  onChange={() => setPreferredMethod(value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Schedule */}
        <div>
          <label htmlFor="consult-schedule" className="block text-sm font-medium text-gray-700 mb-1">
            희망 일정 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </label>
          <input
            id="consult-schedule"
            type="text"
            value={preferredSchedule}
            onChange={(e) => setPreferredSchedule(e.target.value)}
            placeholder="예: 평일 오후 2시-5시, 이번 주 금요일"
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Urgency Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            긴급도
          </label>
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setUrgency('normal')}
              className={`px-5 py-2 text-sm font-medium transition-colors ${
                urgency === 'normal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              일반
            </button>
            <button
              type="button"
              onClick={() => setUrgency('urgent')}
              className={`px-5 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                urgency === 'urgent'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              긴급
            </button>
          </div>
        </div>

        {/* User Company */}
        <div>
          <label htmlFor="consult-company" className="block text-sm font-medium text-gray-700 mb-1">
            소속 기관 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </label>
          <input
            id="consult-company"
            type="text"
            value={userCompany}
            onChange={(e) => setUserCompany(e.target.value)}
            placeholder="소속 회사 또는 기관명"
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* User Phone */}
        <div>
          <label htmlFor="consult-phone" className="block text-sm font-medium text-gray-700 mb-1">
            연락처 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </label>
          <input
            id="consult-phone"
            type="tel"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Linked AI Report Checkbox */}
        {linkedAnalysisId && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <input
              id="attach-report"
              type="checkbox"
              checked={attachReport}
              onChange={(e) => setAttachReport(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="attach-report" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">AI 분석 리포트 첨부</span>
              {linkedCompany && (
                <span className="text-gray-500"> - {linkedCompany} 분석 결과</span>
              )}
              {aiReportSummary && (
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {aiReportSummary}
                </p>
              )}
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!subject.trim() || !message.trim() || loading}
          className="w-full"
        >
          {loading ? '요청 전송 중...' : '상담 요청 보내기'}
        </Button>
      </form>
    </Card>
  );
}
