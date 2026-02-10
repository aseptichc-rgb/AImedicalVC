'use client';

import { useState, FormEvent } from 'react';
import { CompanyInput as CompanyInputType } from '@/types/company';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const SECTORS = [
  '바이오시밀러',
  'mRNA 치료제',
  '항암제',
  '면역치료제',
  '유전자치료',
  '의료기기',
  '디지털헬스',
  '기타',
] as const;

interface CompanyInputProps {
  onSubmit: (company: CompanyInputType) => void;
  loading?: boolean;
  error?: string | null;
}

export default function CompanyInput({ onSubmit, loading = false, error }: CompanyInputProps) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState<string>(SECTORS[0]);
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      sector,
      ticker: ticker.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <Card padding="lg" className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">기업 분석 요청</h2>
        <p className="mt-1 text-sm text-gray-500">
          분석할 바이오/헬스케어 기업 정보를 입력하세요. 5명의 AI 전문가 패널이 다각도로 분석합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company Name */}
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
            기업명 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="company-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 삼성바이오로직스, Moderna, 셀트리온"
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Sector Dropdown */}
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
            섹터
          </label>
          <select
            id="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Ticker (optional) */}
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 mb-1">
            티커 / 종목코드 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="예: MRNA, 068270.KS"
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            추가 설명 <span className="text-gray-400 text-xs font-normal">(선택)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="특정 파이프라인, 관심 분야, 분석 요청사항 등을 자유롭게 입력하세요."
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

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
          disabled={!name.trim() || loading}
          className="w-full"
        >
          {loading ? '분석 준비 중...' : '분석 시작'}
        </Button>
      </form>
    </Card>
  );
}
