import { AgentId, AnalysisPhase, AgreementLevel } from './agent';
import { CompanyInput } from './company';
import { FinalReport } from './report';

export type AnalysisStatus = 'enriching' | 'analyzing' | 'debating' | 'synthesizing' | 'completed' | 'failed';

export interface AnalysisDoc {
  id: string;
  userId: string;
  company: CompanyInput;
  status: AnalysisStatus;
  currentPhase: string;
  progress: number;
  enrichedData?: EnrichedData;
  report?: FinalReport;
  createdAt: Date;
  completedAt?: Date;
  totalTokensUsed: number;
  estimatedCost: number;
}

export interface EnrichedData {
  clinicalTrials: ClinicalTrialSummary[];
  recentPapers: PaperSummary[];
  financials?: FinancialSummary;
  competitors: CompetitorInfo[];
  regulatoryHistory: RegulatoryEvent[];
}

export interface ClinicalTrialSummary {
  nctId: string;
  title: string;
  phase: string;
  status: string;
  condition: string;
  intervention: string;
  startDate?: string;
  completionDate?: string;
  enrollment?: number;
}

export interface PaperSummary {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publishDate: string;
  abstract?: string;
}

export interface FinancialSummary {
  revenue?: number;
  marketCap?: number;
  cashPosition?: number;
  burnRate?: number;
  runway?: string;
}

export interface CompetitorInfo {
  name: string;
  pipeline: string;
  stage: string;
  differentiation: string;
}

export interface RegulatoryEvent {
  date: string;
  agency: string;
  event: string;
  outcome: string;
}

export interface MessageDoc {
  id: string;
  sessionId: string;
  agentId: AgentId;
  agentName: string;
  agentRole: string;
  phase: AnalysisPhase;
  content: string;
  structuredEval?: {
    scores: Record<string, number>;
    keyFindings: string[];
    risks: string[];
    opportunities: string[];
  };
  referencedMessageId?: string;
  agreementLevel?: AgreementLevel;
  order: number;
  createdAt: Date;
  tokenCount: number;
}

export interface ConflictDoc {
  id: string;
  topic: string;
  description: string;
  agentPositions: {
    agentId: AgentId;
    position: string;
    confidence: number;
  }[];
  resolution?: string;
  severity: 'minor' | 'moderate' | 'major';
}
