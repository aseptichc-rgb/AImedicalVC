import { CompetitorLandscapeItem } from '@/types/report';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface CompetitorMatrixProps {
  competitors: CompetitorLandscapeItem[];
}

const threatBadgeVariant: Record<CompetitorLandscapeItem['threat'], 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

const threatLabel: Record<CompetitorLandscapeItem['threat'], string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

const threatBorderColor: Record<CompetitorLandscapeItem['threat'], string> = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
};

export default function CompetitorMatrix({ competitors }: CompetitorMatrixProps) {
  if (competitors.length === 0) {
    return (
      <Card padding="lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">경쟁 구도</h2>
        <p className="text-gray-500 text-sm">경쟁사 데이터가 없습니다.</p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">경쟁 구도</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitors.map((comp, index) => (
          <div
            key={index}
            className={`border border-gray-200 rounded-lg p-4 bg-white border-l-4 ${threatBorderColor[comp.threat]} hover:shadow-sm transition-shadow`}
          >
            {/* Header: company name + threat badge */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm truncate mr-2">
                {comp.company}
              </h3>
              <Badge variant={threatBadgeVariant[comp.threat]} size="sm">
                위협 {threatLabel[comp.threat]}
              </Badge>
            </div>

            {/* Overlap area */}
            <div className="mb-2">
              <span className="text-xs text-gray-500 font-medium">중복 영역</span>
              <p className="text-sm text-gray-800 mt-0.5">{comp.overlap}</p>
            </div>

            {/* Differentiation */}
            <div>
              <span className="text-xs text-gray-500 font-medium">차별화 요인</span>
              <p className="text-sm text-gray-700 mt-0.5">{comp.differentiation}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
