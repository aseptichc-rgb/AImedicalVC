export type AgentId = 'oncologist' | 'pharmacist' | 'analyst' | 'regulatory' | 'immunologist';

export const AGENT_IDS: AgentId[] = ['oncologist', 'pharmacist', 'analyst', 'regulatory', 'immunologist'];

export interface AgentProfile {
  id: AgentId;
  name: string;
  nameEn: string;
  title: string;
  avatar: string;
  color: string;
  evaluationAxes: string[];
  dataFocus: string[];
  biasProfile: string;
  conflictTriggers: string[];
}

export type AnalysisPhase = 'independent_analysis' | 'cross_examination' | 'rebuttal' | 'final_verdict';

export interface AgentAnalysisResult {
  narrative: string;
  structured: {
    scores: Record<string, number>;
    keyFindings: string[];
    risks: string[];
    opportunities: string[];
  };
  tokenCount: number;
}

export interface RebuttalResult {
  content: string;
  agreementLevel: 'agree' | 'partially_agree' | 'disagree' | 'strongly_disagree';
  tokenCount: number;
}

export interface VerdictResult {
  content: string;
  structured: {
    scores: Record<string, number>;
    keyFindings: string[];
    risks: string[];
    opportunities: string[];
  };
  tokenCount: number;
}
