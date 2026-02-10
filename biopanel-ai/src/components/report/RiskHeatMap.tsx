import { RiskMatrixItem } from '@/types/report';
import Card from '@/components/ui/Card';
import HeatMap from '@/components/ui/HeatMap';

interface RiskHeatMapProps {
  risks: RiskMatrixItem[];
}

const levelColors: Record<RiskMatrixItem['level'], string> = {
  low: 'border-green-300 bg-green-50',
  medium: 'border-yellow-300 bg-yellow-50',
  high: 'border-orange-300 bg-orange-50',
  critical: 'border-red-400 bg-red-50',
};

const levelTextColors: Record<RiskMatrixItem['level'], string> = {
  low: 'text-green-700',
  medium: 'text-yellow-700',
  high: 'text-orange-700',
  critical: 'text-red-700',
};

export default function RiskHeatMap({ risks }: RiskHeatMapProps) {
  const heatMapItems = risks.map((r) => ({
    category: r.category,
    level: r.level,
    description: r.description,
  }));

  return (
    <Card padding="lg">
      {/* HeatMap visual */}
      <HeatMap items={heatMapItems} title="리스크 히트맵" />

      {/* Mitigants list */}
      {risks.some((r) => r.mitigants.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">완화 요인</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {risks.map((risk, index) => (
              risk.mitigants.length > 0 && (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${levelColors[risk.level]}`}
                >
                  <h4 className={`text-sm font-semibold mb-2 ${levelTextColors[risk.level]}`}>
                    {risk.category}
                  </h4>
                  <ul className="space-y-1">
                    {risk.mitigants.map((mitigant, mi) => (
                      <li
                        key={mi}
                        className="flex items-start gap-2 text-xs text-gray-700"
                      >
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          risk.level === 'low' ? 'bg-green-500' :
                          risk.level === 'medium' ? 'bg-yellow-500' :
                          risk.level === 'high' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`} />
                        {mitigant}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
