// Re-export from central types
import type {
  AgentId as AgentIdType,
  CoreAgentId,
  ClinicalAgentId,
  PhysicianRole,
  MedicalDepartment,
  TherapeuticArea,
  AgentProfile,
} from '@/types/agent';

export type {
  CoreAgentId,
  ClinicalAgentId,
  PhysicianRole,
  MedicalDepartment,
  TherapeuticArea,
  AgentProfile,
};

export type AgentId = AgentIdType;

// 핵심 분석가 (항상 참여)
export const CORE_AGENT_IDS: string[] = ['analyst', 'regulatory'];

// 기본 6명의 에이전트 ID (아셉틱 투자사 관점 포함)
export const AGENT_IDS: AgentIdType[] = ['oncologist', 'pharmacist', 'analyst', 'regulatory', 'immunologist', 'aseptic'];

// 기본 임상 전문가 (관련성에 따라 참여)
export const CLINICAL_SPECIALIST_IDS: string[] = [
  'oncologist', 'pharmacist', 'immunologist',
  'cardiology_professor', 'gastro_professor', 'neurology_professor',
  'psychiatry_professor', 'dermatology_professor', 'ophthalmology_professor',
  'orthopedic_professor', 'obgyn_professor', 'pediatrics_professor'
];

export type AnalysisPhase = 'independent_analysis' | 'cross_examination' | 'rebuttal' | 'final_verdict';

// 근거 기반 주장 타입
export interface EvidenceBackedClaim {
  claim: string;
  evidenceIds: string[];
  confidence: number;
}

// 근거자료 타입
export interface Evidence {
  id: string;
  type: 'clinical_trial' | 'pubmed' | 'fda' | 'sec_filing' | 'news' | 'guideline' | 'conference' | 'competitor_data' | string;
  title: string;
  source: string;
  url?: string;
  date?: string;
  strength: 'high' | 'medium' | 'low' | string;
  excerpt?: string;
  relevance: string;
}

// 유연한 타입: 기존 문자열 또는 새로운 근거 기반 주장 모두 지원
export type ClaimItem = string | EvidenceBackedClaim;

export interface AgentAnalysisResult {
  narrative: string;
  structured: {
    scores: Record<string, number>;
    keyFindings: ClaimItem[];
    risks: ClaimItem[];
    opportunities: ClaimItem[];
    evidences?: Evidence[];
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
    keyFindings: ClaimItem[];
    risks: ClaimItem[];
    opportunities: ClaimItem[];
    evidences?: Evidence[];
  };
  tokenCount: number;
}
