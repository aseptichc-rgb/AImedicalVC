export type AgentId = 'oncologist' | 'pharmacist' | 'analyst' | 'regulatory' | 'immunologist';

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
export type AgreementLevel = 'agree' | 'partially_agree' | 'disagree' | 'strongly_disagree';
export type VerdictType = 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
