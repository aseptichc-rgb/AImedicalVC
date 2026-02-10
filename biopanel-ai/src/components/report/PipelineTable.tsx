'use client';

import { PipelineAnalysisItem } from '@/types/report';
import Card from '@/components/ui/Card';

interface PipelineTableProps {
  pipeline: PipelineAnalysisItem[];
}

function getProbabilityColor(prob: number): string {
  if (prob > 60) return 'text-green-700 bg-green-100';
  if (prob > 30) return 'text-yellow-700 bg-yellow-100';
  return 'text-red-700 bg-red-100';
}

function getProbabilityDotColor(prob: number): string {
  if (prob > 60) return 'bg-green-500';
  if (prob > 30) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function PipelineTable({ pipeline }: PipelineTableProps) {
  if (pipeline.length === 0) {
    return (
      <Card padding="lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">파이프라인 분석</h2>
        <p className="text-gray-500 text-sm">파이프라인 데이터가 없습니다.</p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">파이프라인 분석</h2>

      {/* Desktop: Table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold text-gray-600">자산</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">적응증</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">단계</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-600">성공확률(%)</th>
              <th className="text-right py-3 px-3 font-semibold text-gray-600">예상 최고매출</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-600">경쟁사수</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">핵심리스크</th>
            </tr>
          </thead>
          <tbody>
            {pipeline.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-3 font-medium text-gray-900">{item.asset}</td>
                <td className="py-3 px-3 text-gray-700">{item.indication}</td>
                <td className="py-3 px-3 text-gray-700">{item.phase}</td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getProbabilityColor(item.probabilityOfSuccess)}`}
                  >
                    {item.probabilityOfSuccess}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  {item.estimatedPeakSales || '-'}
                </td>
                <td className="py-3 px-3 text-center text-gray-700">{item.competitorCount}</td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {item.keyRisks.map((risk, ri) => (
                      <span
                        key={ri}
                        className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                      >
                        {risk}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden flex flex-col gap-4">
        {pipeline.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{item.asset}</h3>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getProbabilityColor(item.probabilityOfSuccess)}`}
              >
                {item.probabilityOfSuccess}%
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">적응증</span>
                <span className="text-gray-800">{item.indication}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">단계</span>
                <span className="text-gray-800">{item.phase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">예상 최고매출</span>
                <span className="text-gray-800">{item.estimatedPeakSales || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">경쟁사수</span>
                <span className="text-gray-800">{item.competitorCount}</span>
              </div>
            </div>

            {item.keyRisks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500 font-medium">핵심리스크</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.keyRisks.map((risk, ri) => (
                    <span
                      key={ri}
                      className="inline-flex items-center gap-1 bg-white text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getProbabilityDotColor(item.probabilityOfSuccess)}`} />
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
