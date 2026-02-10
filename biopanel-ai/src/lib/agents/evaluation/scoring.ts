import { DimensionKey, EVALUATION_DIMENSIONS } from './rubrics';
import { DimensionScores } from '@/types/report';

export function calculateOverallScore(scores: DimensionScores): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, config] of Object.entries(EVALUATION_DIMENSIONS)) {
    const score = scores[key as DimensionKey];
    if (score !== undefined) {
      weightedSum += score * config.weight;
      totalWeight += config.weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export function aggregateAgentScores(agentScores: Record<string, number>[]): DimensionScores {
  const dimensions: DimensionKey[] = ['clinicalValue', 'regulatoryPath', 'commercialPotential', 'competitivePosition', 'financialHealth', 'ipStrength'];
  const result: any = {};

  for (const dim of dimensions) {
    const scores = agentScores
      .map((s) => s[dim])
      .filter((s) => s !== undefined);
    result[dim] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  return result as DimensionScores;
}
