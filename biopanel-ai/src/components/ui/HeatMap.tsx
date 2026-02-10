'use client';

interface HeatMapItem {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface HeatMapProps {
  items: HeatMapItem[];
  title?: string;
}

const levelColors = {
  low: 'bg-green-200 text-green-900 border-green-300',
  medium: 'bg-yellow-200 text-yellow-900 border-yellow-300',
  high: 'bg-orange-200 text-orange-900 border-orange-300',
  critical: 'bg-red-300 text-red-900 border-red-400',
};

const levelLabels = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  critical: '심각',
};

export default function HeatMap({ items, title = '리스크 히트맵' }: HeatMapProps) {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border ${levelColors[item.level]}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{item.category}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
                {levelLabels[item.level]}
              </span>
            </div>
            <p className="text-xs opacity-80">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
