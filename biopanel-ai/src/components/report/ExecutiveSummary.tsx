import Card from '@/components/ui/Card';
import ScoreGauge from '@/components/ui/ScoreGauge';

interface ExecutiveSummaryProps {
  summary: string;
  overallScore: number;
}

export default function ExecutiveSummary({ summary, overallScore }: ExecutiveSummaryProps) {
  return (
    <Card padding="lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">종합 요약</h2>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Large score gauge */}
        <div className="flex-shrink-0">
          <ScoreGauge score={overallScore} label="종합 점수" size="lg" />
        </div>

        {/* Summary text */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
            {summary}
          </p>
        </div>
      </div>
    </Card>
  );
}
