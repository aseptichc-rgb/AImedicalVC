'use client';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

function getColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export default function ScoreGauge({ score, maxScore = 100, label, size = 'md' }: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;
  const color = getColor(score);
  const sizes = { sm: 80, md: 120, lg: 160 };
  const dim = sizes[size];
  const strokeWidth = size === 'sm' ? 6 : 8;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'}`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className={`text-gray-600 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</span>
    </div>
  );
}
