import Link from 'next/link';
import { ExpertDoc } from '@/types/expert';
import { formatCurrency } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface ExpertCardProps {
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
        <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <svg key={i} className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-star-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#half-star-${i})`}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className="text-sm text-gray-500">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const initials = getInitials(expert.name);

  return (
    <Link href={`/experts/${expert.id}`} className="block">
      <Card hover padding="none" className="overflow-hidden">
        <div className="p-5">
          {/* Header: Avatar + Name */}
          <div className="flex items-center gap-4 mb-4">
            {/* Photo placeholder - circle with initials */}
            <div className="relative flex-shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold">
                {initials}
              </div>
              {/* Active status dot */}
              {expert.isActive && (
                <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-400 ring-2 ring-white" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {expert.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {expert.specialtyLabel}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <StarRating rating={expert.rating || 0} count={expert.reviewCount} />
          </div>

          {/* Sub-specialties */}
          {expert.subSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {expert.subSpecialties.slice(0, 3).map((sub) => (
                <Badge key={sub} variant="default" size="sm">
                  {sub}
                </Badge>
              ))}
              {expert.subSpecialties.length > 3 && (
                <Badge variant="default" size="sm">
                  +{expert.subSpecialties.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Response time */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>응답시간: {expert.responseTime}</span>
          </div>

          {/* Pricing */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">초기 상담</span>
              <span className="text-base font-semibold text-gray-900">
                {formatCurrency(expert.pricing.initialConsult, expert.pricing.currency)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
