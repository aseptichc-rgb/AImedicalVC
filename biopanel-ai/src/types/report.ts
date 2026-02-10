import { AgentId, VerdictType } from './agent';

export interface FinalReport {
  executiveSummary: string;
  overallScore: number;
  dimensionScores: DimensionScores;
  pipelineAnalysis: PipelineAnalysisItem[];
  riskMatrix: RiskMatrixItem[];
  competitorLandscape: CompetitorLandscapeItem[];
  agentVerdicts: AgentVerdict[];
  consensusPoints: string[];
  dissensusPoints: DissensusPoint[];
  openQuestions: string[];
  recommendedExperts: RecommendedExpert[];
}

export interface DimensionScores {
  clinicalValue: number;
  regulatoryPath: number;
  commercialPotential: number;
  competitivePosition: number;
  financialHealth: number;
  ipStrength: number;
}

export interface PipelineAnalysisItem {
  asset: string;
  indication: string;
  phase: string;
  probabilityOfSuccess: number;
  estimatedPeakSales?: string;
  keyRisks: string[];
  competitorCount: number;
}

export interface RiskMatrixItem {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigants: string[];
}

export interface CompetitorLandscapeItem {
  company: string;
  overlap: string;
  threat: 'low' | 'medium' | 'high';
  differentiation: string;
}

export interface AgentVerdict {
  agentId: AgentId;
  agentName: string;
  verdict: VerdictType;
  summary: string;
  keyArgument: string;
  confidenceLevel: number;
}

export interface DissensusPoint {
  topic: string;
  positions: { agentId: AgentId; view: string }[];
}

export interface RecommendedExpert {
  expertId: string;
  expertName: string;
  specialty: string;
  reason: string;
  relevantTopics: string[];
}
