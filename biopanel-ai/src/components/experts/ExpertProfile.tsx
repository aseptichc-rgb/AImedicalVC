import React from 'react';
import { ExpertDoc, ConsultMethod } from '@/types/expert';
import { formatCurrency } from '@/lib/utils/format';
import Badge from '@/components/ui/Badge';
import ExpertBadge from './ExpertBadge';

interface ExpertProfileProps {
  expert: ExpertDoc;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <svg key={i} className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`profile-half-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#profile-half-${i})`}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex">{stars}</div>
      <span className="text-base font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-500">
        ({count}개 리뷰)
      </span>
    </div>
  );
}

const CONSULT_METHOD_MAP: Record<ConsultMethod, { label: string; icon: React.ReactElement }> = {
  video: {
    label: '화상통화',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  phone: {
    label: '전화',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  email: {
    label: '이메일',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  in_person: {
    label: '대면',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
};

export default function ExpertProfile({ expert }: ExpertProfileProps) {
  const initials = getInitials(expert.name);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Large photo placeholder */}
          <div className="relative flex-shrink-0">
            <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-full bg-blue-600 text-white text-3xl md:text-4xl font-bold">
              {initials}
            </div>
            {/* Active indicator */}
            {expert.isActive && (
              <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {expert.name}
              </h1>
              {expert.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  활동 중
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  비활동
                </span>
              )}
            </div>

            <p className="mt-1 text-lg text-gray-600">
              {expert.credentials.title}
              {expert.credentials.hospital && (
                <span className="text-gray-400"> | {expert.credentials.hospital}</span>
              )}
            </p>

            {/* Rating */}
            <div className="mt-3">
              <StarRating rating={expert.rating || 0} count={expert.reviewCount} />
            </div>

            {/* Response time */}
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>평균 응답시간: {expert.responseTime}</span>
            </div>

            {/* Specialty badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <ExpertBadge specialty={expert.specialty} />
              {expert.subSpecialties.map((sub) => (
                <Badge key={sub} variant="default" size="sm">
                  {sub}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">자격 및 경력</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              학력
            </h3>
            <ul className="space-y-2">
              {expert.credentials.education.map((edu, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              자격증
            </h3>
            <ul className="space-y-2">
              {expert.credentials.certifications.map((cert, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Experience */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            경력
          </h3>
          <p className="text-sm text-gray-600">{expert.credentials.experience}</p>
        </div>
      </div>

      {/* Consult Areas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">상담 분야</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {expert.consultAreas.map((area, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {area}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing & Consult Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-5">상담 비용</h2>
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 text-sm text-gray-500">초기 상담</td>
                <td className="py-3 text-sm font-semibold text-gray-900 text-right">
                  {formatCurrency(expert.pricing.initialConsult, expert.pricing.currency)}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-500">시간당 요금</td>
                <td className="py-3 text-sm font-semibold text-gray-900 text-right">
                  {formatCurrency(expert.pricing.hourlyRate, expert.pricing.currency)}
                </td>
              </tr>
            </tbody>
          </table>
          {expert.pricing.note && (
            <p className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              {expert.pricing.note}
            </p>
          )}
        </div>

        {/* Consult Methods */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-5">상담 방법</h2>
          <div className="grid grid-cols-2 gap-3">
            {expert.consultMethods.map((method) => {
              const info = CONSULT_METHOD_MAP[method];
              return (
                <div
                  key={method}
                  className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-blue-600">{info.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
