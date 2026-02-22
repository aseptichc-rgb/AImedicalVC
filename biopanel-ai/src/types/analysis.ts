import { AgentId, AnalysisPhase, AgreementLevel } from './agent';
import { CompanyInput } from './company';
import { FinalReport } from './report';

export type AnalysisStatus = 'enriching' | 'analyzing' | 'debating' | 'synthesizing' | 'completed' | 'failed';

export type EnrichmentStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface EnrichmentStepData {
  id: string;
  label: string;
  description: string;
  icon: 'news' | 'pdf' | 'fda' | 'clinical' | 'pubmed' | 'financial' | 'competitor' | 'digital';
  status: EnrichmentStepStatus;
  result?: string;
}

export interface AnalysisDoc {
  id: string;
  userId: string;
  company: CompanyInput;
  status: AnalysisStatus;
  currentPhase: string;
  progress: number;
  enrichedData?: EnrichedData;
  enrichmentSteps?: EnrichmentStepData[];
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
  news: NewsArticle[];
  fdaEvents: FDAEvent[];
  digitalHealthData?: DigitalHealthInfo;
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

export type NewsCategory = 'clinical' | 'regulatory' | 'business' | 'digital_health' | 'general';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  snippet?: string;
  category: NewsCategory;
}

export type FDAEventType = 'drug_approval' | 'device_510k' | 'warning_letter' | 'recall' | 'breakthrough';

export interface FDAEvent {
  id: string;
  type: FDAEventType;
  date: string;
  product?: string;
  applicant: string;
  decision?: string;
  indication?: string;
  documentUrl?: string;
}

export interface DigitalHealthClearance {
  type: '510k' | 'De Novo' | 'PMA' | 'Exempt';
  clearanceNumber?: string;
  date?: string;
  productCode?: string;
  deviceName?: string;
}

export interface DigitalHealthInfo {
  fdaClearances: DigitalHealthClearance[];
  certifications: string[];
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

// 근거자료 (Evidence/Citation) 타입 정의
export type EvidenceType =
  | 'clinical_trial'    // ClinicalTrials.gov
  | 'pubmed'            // PubMed 논문
  | 'fda'               // FDA 데이터
  | 'sec_filing'        // SEC 공시
  | 'news'              // 뉴스 기사
  | 'guideline'         // 임상 가이드라인
  | 'conference'        // 학회 발표
  | 'competitor_data';  // 경쟁사 데이터

export type EvidenceStrength = 'high' | 'medium' | 'low';

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  source: string;
  url?: string;
  date?: string;
  strength: EvidenceStrength;
  excerpt?: string;          // 인용된 핵심 내용
  relevance: string;         // 왜 이 근거가 관련있는지
}

// 근거 기반 주장 (Evidence-backed Claim)
export interface EvidenceBackedClaim {
  claim: string;             // 주장 내용
  evidenceIds: string[];     // 뒷받침하는 근거 ID 목록
  confidence: number;        // 확신도 (0-100)
}

// 확장된 구조화된 평가 (근거자료 포함)
export interface StructuredEvalWithEvidence {
  scores: Record<string, number>;
  keyFindings: EvidenceBackedClaim[];
  risks: EvidenceBackedClaim[];
  opportunities: EvidenceBackedClaim[];
  evidences: Evidence[];     // 분석에 사용된 모든 근거자료
}
