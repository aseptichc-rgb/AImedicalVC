# 🏥 BioPanel AI — MVP 프로젝트 구조 설계서

> 의료·바이오·헬스케어 특화 AI 심사역 토론 플랫폼

---

## 1. 프로젝트 개요

### 핵심 가치
사용자가 바이오/헬스케어 기업명을 입력하면, 5명의 AI 전문가 패널이 실시간으로 해당 기업을 분석하고 토론하여 투자/사업성 심사 리포트를 생성한다.

### MVP 스코프 (v0.1)
- ✅ 기업명 입력 → 5명 에이전트 순차 분석 → 실시간 토론 스트리밍
- ✅ 구조화된 최종 리포트 (정량 평가 포함)
- ✅ 분석 이력 저장 및 조회
- ✅ 사용자 인증 (Google 로그인)
- ✅ 실제 전문가 프로필 열람 + 개별 상담 요청 (유료 전문가 연결)
- ✅ 완전 무료 서비스 (AI 분석)
- ⬜ 커스텀 데이터 업로드 (v0.2)
- ⬜ Knowledge Graph (v0.3)

---

## 2. 기술 스택

```
Frontend:    Next.js 14 (App Router) + TypeScript + Tailwind CSS
배포:         Vercel
인증:         Firebase Auth (Google OAuth)
DB:          Cloud Firestore
서버 로직:    Cloud Functions 2nd Gen (또는 Cloud Run)
AI 엔진:     Anthropic Claude API (Sonnet 4)
실시간:       Firestore onSnapshot (실시간 토론 스트리밍)
외부 데이터:  ClinicalTrials.gov API, PubMed API, SEC EDGAR
```

---

## 3. 폴더 구조

```
biopanel-ai/
├── public/
│   ├── agents/                    # 에이전트 아바타 이미지
│   │   ├── oncologist.png
│   │   ├── pharmacist.png
│   │   ├── analyst.png
│   │   ├── regulatory.png
│   │   └── immunologist.png
│   └── logo.svg
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   ├── page.tsx               # 랜딩/홈
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                # 인증 관련 라우트
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── dashboard/             # 대시보드 (분석 이력)
│   │   │   └── page.tsx
│   │   │
│   │   ├── analysis/              # 분석 세션
│   │   │   ├── new/page.tsx       # 새 분석 시작
│   │   │   └── [sessionId]/
│   │   │       ├── page.tsx       # 실시간 토론 뷰
│   │   │       └── report/page.tsx # 최종 리포트 뷰
│   │   │
│   │   ├── experts/               # ⭐ 실제 전문가 연결
│   │   │   ├── page.tsx           # 전문가 목록/검색
│   │   │   └── [expertId]/
│   │   │       ├── page.tsx       # 전문가 프로필 상세
│   │   │       └── request/page.tsx # 상담 요청 폼
│   │   │
│   │   └── api/                   # Next.js API Routes (경량 프록시)
│   │       ├── analysis/
│   │       │   └── start/route.ts # 분석 시작 트리거
│   │       ├── experts/
│   │       │   ├── list/route.ts  # 전문가 목록 조회
│   │       │   └── request/route.ts # 상담 요청 전송
│   │       └── webhook/
│   │           └── route.ts       # Cloud Functions 콜백
│   │
│   ├── components/
│   │   ├── ui/                    # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── HeatMap.tsx        # 리스크 히트맵
│   │   │   └── ScoreGauge.tsx     # 점수 게이지
│   │   │
│   │   ├── analysis/              # 분석 관련 컴포넌트
│   │   │   ├── CompanyInput.tsx         # 기업 검색/입력
│   │   │   ├── AnalysisConfig.tsx       # 분석 설정 (심화 옵션)
│   │   │   ├── DebateTimeline.tsx       # 토론 타임라인 (메인 뷰)
│   │   │   ├── AgentMessage.tsx         # 개별 에이전트 발언 버블
│   │   │   ├── AgentAvatar.tsx          # 에이전트 프로필 카드
│   │   │   ├── ConflictHighlight.tsx    # 의견 충돌 하이라이트
│   │   │   └── LiveIndicator.tsx        # 실시간 분석 중 표시
│   │   │
│   │   ├── report/                # 리포트 관련 컴포넌트
│   │   │   ├── ExecutiveSummary.tsx     # 종합 요약
│   │   │   ├── PipelineTable.tsx        # 파이프라인 밸류에이션
│   │   │   ├── RiskHeatMap.tsx          # 리스크 히트맵
│   │   │   ├── CompetitorMatrix.tsx     # 경쟁 구도 매트릭스
│   │   │   ├── ConsensusView.tsx        # 합의/비합의 뷰
│   │   │   └── AgentVerdictCard.tsx     # 에이전트별 최종 의견
│   │   │
│   │   ├── experts/               # ⭐ 실제 전문가 연결
│   │   │   ├── ExpertCard.tsx           # 전문가 카드 (목록용)
│   │   │   ├── ExpertProfile.tsx        # 전문가 상세 프로필
│   │   │   ├── ExpertFilter.tsx         # 분야별 필터
│   │   │   ├── ConsultRequestForm.tsx   # 상담 요청 폼
│   │   │   ├── ConsultRequestModal.tsx  # 리포트 내 상담 요청 모달
│   │   │   └── ExpertBadge.tsx          # 전문분야 뱃지
│   │   │
│   │   └── layout/                # 레이아웃 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/                       # 핵심 라이브러리
│   │   ├── firebase/
│   │   │   ├── config.ts          # Firebase 초기화
│   │   │   ├── auth.ts            # Auth 헬퍼
│   │   │   ├── firestore.ts       # Firestore 헬퍼
│   │   │   └── admin.ts           # Admin SDK (서버용)
│   │   │
│   │   ├── agents/                # ⭐ 에이전트 시스템 (핵심)
│   │   │   ├── types.ts           # 에이전트 타입 정의
│   │   │   ├── registry.ts        # 에이전트 레지스트리
│   │   │   ├── orchestrator.ts    # 토론 오케스트레이터
│   │   │   ├── conflict-detector.ts  # 의견 충돌 감지
│   │   │   ├── prompts/           # ⭐ 에이전트별 프롬프트
│   │   │   │   ├── base.ts        # 공통 베이스 프롬프트
│   │   │   │   ├── oncologist.ts  # 종양내과 전문의
│   │   │   │   ├── pharmacist.ts  # 약사/약물경제학자
│   │   │   │   ├── analyst.ts     # 바이오 애널리스트
│   │   │   │   ├── regulatory.ts  # 규제 전문가
│   │   │   │   └── immunologist.ts # 면역학 전문의
│   │   │   └── evaluation/        # ⭐ 평가 프레임워크
│   │   │       ├── rubrics.ts     # 정량 평가 기준표
│   │   │       ├── scoring.ts     # 점수 산출 로직
│   │   │       └── synthesis.ts   # 종합 리포트 생성
│   │   │
│   │   ├── data/                  # 외부 데이터 수집
│   │   │   ├── clinical-trials.ts # ClinicalTrials.gov API
│   │   │   ├── pubmed.ts          # PubMed API
│   │   │   ├── sec-edgar.ts       # SEC EDGAR API
│   │   │   └── company-info.ts    # 기업 기본 정보 수집
│   │   │
│   │   └── utils/
│   │       ├── claude.ts          # Claude API 래퍼
│   │       ├── stream.ts          # 스트리밍 유틸
│   │       └── format.ts          # 포맷 유틸
│   │
│   ├── hooks/                     # React Hooks
│   │   ├── useAuth.ts
│   │   ├── useAnalysis.ts         # 분석 세션 관리
│   │   ├── useDebateStream.ts     # 실시간 토론 구독
│   │   ├── useReport.ts           # 리포트 데이터
│   │   ├── useExperts.ts          # 전문가 목록/필터
│   │   └── useConsultRequest.ts   # 상담 요청 관리
│   │
│   ├── stores/                    # 상태 관리 (Zustand)
│   │   ├── authStore.ts
│   │   └── analysisStore.ts
│   │
│   └── types/                     # 전역 타입
│       ├── agent.ts
│       ├── analysis.ts
│       ├── company.ts
│       ├── report.ts
│       └── expert.ts              # 전문가 & 상담 요청 타입
│
├── functions/                     # ⭐ Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts               # Functions 엔트리
│   │   ├── orchestrate.ts         # 메인 오케스트레이션 로직
│   │   ├── agents/
│   │   │   ├── runner.ts          # 에이전트 실행기
│   │   │   └── debate.ts          # 토론 라운드 관리
│   │   ├── experts/               # ⭐ 전문가 연결 시스템
│   │   │   ├── notification.ts    # 전문가에게 상담 요청 알림 (이메일)
│   │   │   └── matching.ts        # 분석 결과 기반 전문가 추천
│   │   ├── data/
│   │   │   ├── enrichment.ts      # 기업 데이터 보강
│   │   │   └── fetchers.ts        # 외부 API 호출
│   │   └── utils/
│   │       ├── claude.ts          # Claude API 호출
│   │       └── email.ts           # 이메일 발송 (SendGrid/Resend)
│   ├── package.json
│   └── tsconfig.json
│
├── firestore.rules                # Firestore 보안 규칙
├── firestore.indexes.json         # Firestore 인덱스
├── firebase.json                  # Firebase 설정
├── .firebaserc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local                     # 환경변수 (로컬)
└── .env.example
```

---

## 4. Firestore 데이터 모델

### 4.1 컬렉션 구조

```typescript
// ============================================
// users/{userId}
// ============================================
interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  analysisCount: number;        // 총 분석 횟수
  dailyUsage: number;           // 오늘 사용량 (남용 방지)
  consultRequestCount: number;  // 전문가 상담 요청 횟수
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

// ============================================
// analyses/{sessionId}  ⭐ 핵심 컬렉션
// ============================================
interface AnalysisDoc {
  id: string;
  userId: string;
  
  // 분석 대상
  company: {
    name: string;               // "삼성바이오로직스" or "Moderna"
    ticker?: string;            // "KRX:207940" or "MRNA"
    sector: string;             // "바이오시밀러", "mRNA 치료제" 등
    description?: string;       // 간단 설명
  };
  
  // 상태 관리
  status: 'enriching'           // 데이터 수집 중
    | 'analyzing'               // 에이전트 독립 분석 중
    | 'debating'                // 토론 진행 중
    | 'synthesizing'            // 종합 리포트 생성 중
    | 'completed'               // 완료
    | 'failed';                 // 실패
  
  currentPhase: string;         // 현재 진행 단계 표시
  progress: number;             // 0-100 진행률
  
  // 수집된 데이터 (에이전트에게 제공)
  enrichedData: {
    clinicalTrials: ClinicalTrialSummary[];
    recentPapers: PaperSummary[];
    financials?: FinancialSummary;
    competitors: CompetitorInfo[];
    regulatoryHistory: RegulatoryEvent[];
  };
  
  // 최종 리포트
  report?: FinalReport;
  
  // 메타
  createdAt: Timestamp;
  completedAt?: Timestamp;
  totalTokensUsed: number;
  estimatedCost: number;        // USD
}

// ============================================
// analyses/{sessionId}/messages/{messageId}
// 실시간 토론 메시지 (서브컬렉션)
// ============================================
interface MessageDoc {
  id: string;
  sessionId: string;
  
  // 발언자
  agentId: AgentId;             // 'oncologist' | 'pharmacist' | ...
  agentName: string;            // "김서연 (종양내과 전문의)"
  agentRole: string;
  
  // 발언 내용
  phase: 'independent_analysis' // 1단계: 독립 분석
    | 'cross_examination'       // 2단계: 교차 검증
    | 'rebuttal'                // 3단계: 반박
    | 'final_verdict';          // 4단계: 최종 의견
  
  content: string;              // 마크다운 형식의 발언 내용
  
  // 구조화된 평가 (독립 분석 시)
  structuredEval?: {
    scores: Record<string, number>;   // 항목별 점수
    keyFindings: string[];
    risks: string[];
    opportunities: string[];
  };
  
  // 반박/교차검증 시
  referencedMessageId?: string;  // 어떤 발언에 대한 반박인지
  agreementLevel?: 'agree' | 'partially_agree' | 'disagree' | 'strongly_disagree';
  
  // 메타
  order: number;                // 발언 순서
  createdAt: Timestamp;
  tokenCount: number;
}

// ============================================
// analyses/{sessionId}/conflicts/{conflictId}
// 감지된 의견 충돌 (서브컬렉션)
// ============================================
interface ConflictDoc {
  id: string;
  topic: string;                // 충돌 주제
  description: string;
  agentPositions: {
    agentId: AgentId;
    position: string;
    confidence: number;         // 0-1
  }[];
  resolution?: string;          // 해소 여부 및 방법
  severity: 'minor' | 'moderate' | 'major';
}

// ============================================
// experts/{expertId}  ⭐ 실제 전문가 프로필
// ============================================
interface ExpertDoc {
  id: string;
  
  // 기본 정보
  name: string;                   // "홍길동"
  nameEn: string;                 // "Dr. Hong"
  email: string;                  // 알림 수신용 (비공개)
  photoURL?: string;
  
  // 전문 분야
  specialty: ExpertSpecialty;     // 'oncology' | 'cardiology' | 'pharmacology' | ...
  specialtyLabel: string;        // "종양내과 전문의"
  subSpecialties: string[];      // ["폐암", "면역항암제", "ADC"]
  
  // 경력
  credentials: {
    title: string;               // "서울대 의대 교수"
    hospital?: string;           // "서울대학교병원"
    experience: string;          // "임상시험 15년"
    education: string[];         // ["서울대 의대", "Harvard MGH 펠로우"]
    certifications: string[];    // ["대한종양내과학회 전문의"]
  };
  
  // 자문 가능 영역
  consultAreas: string[];        // ["임상시험 디자인 자문", "파이프라인 평가", "적응증 전략"]
  
  // 자문료 & 방식
  pricing: {
    initialConsult: number;      // 초기 상담 (원) - e.g. 300000
    hourlyRate: number;          // 시간당 (원) - e.g. 500000
    currency: 'KRW' | 'USD';
    note?: string;               // "30분 무료 사전 통화 가능"
  };
  
  consultMethods: ('video' | 'phone' | 'email' | 'in_person')[];
  
  // 프로필 상태
  isActive: boolean;             // 현재 상담 가능 여부
  responseTime: string;          // "보통 24시간 이내 응답"
  rating?: number;               // 평균 평점 (1-5)
  reviewCount: number;
  
  // 관련 AI 에이전트 매핑
  linkedAgentId?: AgentId;       // AI 에이전트와의 매핑 (있으면)
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type ExpertSpecialty = 
  | 'oncology'          // 종양내과
  | 'cardiology'        // 심장내과
  | 'neurology'         // 신경과
  | 'immunology'        // 면역학
  | 'endocrinology'     // 내분비내과
  | 'pharmacology'      // 약학/약물경제학
  | 'regulatory'        // 규제 전문
  | 'biotech_analyst'   // 바이오 애널리스트
  | 'patent_law'        // 특허/IP 법률
  | 'clinical_trials'   // 임상시험 설계
  | 'digital_health'    // 디지털 헬스
  | 'medical_device'    // 의료기기
  | 'other';

// ============================================
// consultRequests/{requestId}  ⭐ 상담 요청
// ============================================
interface ConsultRequestDoc {
  id: string;
  
  // 요청자
  userId: string;
  userName: string;
  userEmail: string;
  userCompany?: string;          // 소속 (선택)
  userPhone?: string;            // 연락처 (선택)
  
  // 대상 전문가
  expertId: string;
  expertName: string;
  expertSpecialty: string;
  
  // 요청 내용
  subject: string;               // 상담 주제
  message: string;               // 상세 내용
  
  // AI 분석 연동 (있으면)
  linkedAnalysisId?: string;     // 어떤 AI 분석에서 연결됐는지
  linkedCompany?: string;        // 분석 대상 기업명
  aiReportSummary?: string;      // AI 리포트 요약 (전문가에게 맥락 제공)
  
  // 희망 사항
  preferredMethod: 'video' | 'phone' | 'email' | 'in_person';
  preferredSchedule?: string;    // "평일 오후 희망"
  urgency: 'normal' | 'urgent';
  
  // 상태
  status: 'pending'              // 요청 접수
    | 'notified'                 // 전문가에게 알림 발송됨
    | 'accepted'                 // 전문가 수락
    | 'scheduled'                // 일정 확정
    | 'completed'                // 상담 완료
    | 'declined'                 // 전문가 거절
    | 'cancelled';               // 사용자 취소
  
  // 전문가 응답
  expertResponse?: {
    message: string;
    proposedSchedule?: string;
    respondedAt: Timestamp;
  };
  
  // 메타
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notifiedAt?: Timestamp;
}
```

### 4.2 최종 리포트 구조

```typescript
interface FinalReport {
  // 종합 요약
  executiveSummary: string;
  
  // 종합 점수 (100점 만점)
  overallScore: number;
  
  // 축별 점수
  dimensionScores: {
    clinicalValue: number;      // 임상적 가치 (0-100)
    regulatoryPath: number;     // 규제 승인 가능성 (0-100)
    commercialPotential: number;// 상업적 잠재력 (0-100)
    competitivePosition: number;// 경쟁 우위 (0-100)
    financialHealth: number;    // 재무 건전성 (0-100)
    ipStrength: number;         // IP/특허 강도 (0-100)
  };
  
  // 파이프라인 분석
  pipelineAnalysis: {
    asset: string;
    indication: string;
    phase: string;
    probabilityOfSuccess: number;
    estimatedPeakSales?: string;
    keyRisks: string[];
    competitorCount: number;
  }[];
  
  // 리스크 매트릭스
  riskMatrix: {
    category: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigants: string[];
  }[];
  
  // 경쟁 구도
  competitorLandscape: {
    company: string;
    overlap: string;            // 겹치는 영역
    threat: 'low' | 'medium' | 'high';
    differentiation: string;
  }[];
  
  // 에이전트별 최종 의견
  agentVerdicts: {
    agentId: AgentId;
    agentName: string;
    verdict: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
    summary: string;
    keyArgument: string;
    confidenceLevel: number;    // 0-1
  }[];
  
  // 합의 vs 비합의
  consensusPoints: string[];     // 모두 동의한 점
  dissensusPoints: {             // 의견이 갈린 점
    topic: string;
    positions: { agentId: AgentId; view: string }[];
  }[];
  
  // 핵심 질문 (추가 리서치 필요)
  openQuestions: string[];
  
  // ⭐ 전문가 상담 추천
  recommendedExperts: {
    expertId: string;
    expertName: string;
    specialty: string;
    reason: string;              // "임상시험 디자인에 대한 심층 자문 필요"
    relevantTopics: string[];    // 이 분석에서 해당 전문가가 도울 수 있는 토픽
  }[];
}
```

---

## 5. 에이전트 시스템 설계 ⭐

### 5.1 에이전트 정의

```typescript
// src/lib/agents/types.ts

type AgentId = 
  | 'oncologist'      // 종양내과 전문의
  | 'pharmacist'      // 약사/약물경제학자  
  | 'analyst'         // 바이오 애널리스트
  | 'regulatory'      // 규제 전문가
  | 'immunologist';   // 면역학/내과 전문의

interface AgentProfile {
  id: AgentId;
  name: string;           // 캐릭터 이름
  nameEn: string;
  title: string;          // 직함
  avatar: string;         // 아바타 이미지 경로
  color: string;          // 테마 컬러 (UI용)
  
  // 인지 프레임워크 ⭐
  evaluationAxes: string[];     // 이 에이전트가 중점적으로 보는 축
  dataFocus: string[];          // 주로 참조하는 데이터 유형
  biasProfile: string;          // 성향 (보수적/공격적/균형적)
  conflictTriggers: string[];   // 다른 에이전트와 충돌하기 쉬운 주제
}

// 에이전트 레지스트리
const AGENTS: Record<AgentId, AgentProfile> = {
  oncologist: {
    id: 'oncologist',
    name: '김서연',
    nameEn: 'Dr. Kim',
    title: '종양내과 전문의 · 前 NCC 임상시험센터',
    avatar: '/agents/oncologist.png',
    color: '#E74C3C',
    evaluationAxes: [
      '임상 endpoint의 실질적 의미 (OS/PFS/ORR/DOR)',
      '부작용 프로파일과 임상 관리 가능성',
      '기존 표준치료 대비 실제 처방 전환 가능성',
      'Unmet medical need 충족 정도',
      '바이오마커 전략의 합리성',
    ],
    dataFocus: ['임상시험 결과', 'NCCN 가이드라인', '학술 논문', 'KOL 의견'],
    biasProfile: '임상적 의미에 보수적. 통계적으로 유의해도 임상적으로 의미없으면 부정적',
    conflictTriggers: ['과대 추정된 임상 효과', '안전성 간과', 'surrogate endpoint 과신'],
  },
  
  pharmacist: {
    id: 'pharmacist',
    name: '박준호',
    nameEn: 'Dr. Park',
    title: '약물경제학 박사 · 약가 협상 자문',
    avatar: '/agents/pharmacist.png',
    color: '#2ECC71',
    evaluationAxes: [
      '증분비용효과비 (ICER) 분석',
      'QALY 추정과 지불용의 임계값',
      '보험 급여 등재 가능성 (한국/미국)',
      '약가 결정 및 협상 레버리지',
      '제네릭/바이오시밀러 진입 리스크',
    ],
    dataFocus: ['약가 데이터', 'HTA 평가', '건보 급여 이력', '약물경제성 분석'],
    biasProfile: '비용 효과에 엄격. 임상적으로 좋아도 ICER가 높으면 상업성에 회의적',
    conflictTriggers: ['비현실적 약가 가정', '급여 가능성 과대평가', '경쟁약 대비 가격경쟁력'],
  },
  
  analyst: {
    id: 'analyst',
    name: '이현우',
    nameEn: 'Daniel Lee',
    title: '바이오 섹터 수석 애널리스트 · CFA',
    avatar: '/agents/analyst.png',
    color: '#3498DB',
    evaluationAxes: [
      'TAM/SAM/SOM 시장 규모 산정',
      'Peak sales 추정 및 rNPV 모델링',
      '경영진 역량 및 실행력',
      'M&A/라이센싱 딜 가능성',
      '자금 소진율(burn rate) 및 runway',
    ],
    dataFocus: ['재무제표', '시장 데이터', '딜 히스토리', '컨센서스 추정치'],
    biasProfile: '시장 기회에 공격적. 임상 리스크보다 상업적 업사이드에 가중치',
    conflictTriggers: ['시장 규모 과소평가', '경쟁 과소평가', '밸류에이션 괴리'],
  },
  
  regulatory: {
    id: 'regulatory',
    name: '정미래',
    nameEn: 'Dr. Jung',
    title: '前 식약처 심사관 · 규제 컨설턴트',
    avatar: '/agents/regulatory.png',
    color: '#F39C12',
    evaluationAxes: [
      '승인 확률 및 예상 심사 경로',
      '임상 설계의 규제적 적합성',
      'CMC/제조 관련 리스크',
      '글로벌 규제 전략 (FDA/EMA/MFDS)',
      'Post-marketing 의무사항 및 리스크',
    ],
    dataFocus: ['FDA 심사 이력', '유사약물 승인 사례', 'Advisory Committee 기록'],
    biasProfile: '규제 리스크에 매우 보수적. 작은 규제 이슈도 크게 평가',
    conflictTriggers: ['규제 리스크 경시', '비현실적 승인 타임라인', 'GMP 이슈'],
  },
  
  immunologist: {
    id: 'immunologist',
    name: '최은지',
    nameEn: 'Dr. Choi',
    title: '면역학 교수 · 기초-중개연구 전문',
    avatar: '/agents/immunologist.png',
    color: '#9B59B6',
    evaluationAxes: [
      '작용기전(MOA)의 과학적 타당성',
      '타겟 검증 수준 (target validation)',
      '내성 기전 및 극복 전략',
      '병용요법 시너지 가능성',
      '플랫폼 기술의 확장성',
    ],
    dataFocus: ['기초연구 논문', 'Nature/Science/Cell 급 출판물', '전임상 데이터'],
    biasProfile: '과학적 근거에 엄격. 기전이 불명확하면 임상 결과가 좋아도 회의적',
    conflictTriggers: ['과학적 근거 부족', 'MOA 불명확', '과장된 플랫폼 주장'],
  },
};
```

### 5.2 토론 오케스트레이션 플로우

```typescript
// functions/src/orchestrate.ts

/**
 * 전체 토론 플로우 (Cloud Functions 2nd Gen)
 * 예상 실행시간: 2-5분
 * 
 * Phase 1: Data Enrichment (15-30초)
 *   → 외부 API에서 기업 데이터 수집
 * 
 * Phase 2: Independent Analysis (30-60초)
 *   → 5명 에이전트가 병렬로 독립 분석 (Promise.all)
 *   → 각자의 평가축에 따라 구조화된 분석 생성
 *   → 즉시 Firestore에 write → 프론트에서 실시간 표시
 * 
 * Phase 3: Conflict Detection (5초)
 *   → 5개 독립 분석에서 의견 충돌 자동 감지
 *   → 충돌 토픽 추출 (예: "임상 효과 해석", "시장 규모 추정")
 * 
 * Phase 4: Cross-Examination & Rebuttal (30-60초)
 *   → 충돌 토픽별로 관련 에이전트 2-3명이 교차 검증
 *   → 상대 분석을 읽고 targeted rebuttal 생성
 *   → 각 발언을 Firestore에 순차 write
 * 
 * Phase 5: Final Verdict (15-30초)
 *   → 각 에이전트가 토론 결과를 반영한 최종 의견 제출
 *   → 점수 + 한줄 의견 + 핵심 논거
 * 
 * Phase 6: Synthesis (10-15초)
 *   → 별도 Claude 호출로 종합 리포트 생성
 *   → 합의점, 비합의점, 리스크 매트릭스, 종합 점수
 */

async function orchestrateAnalysis(sessionId: string, company: CompanyInput) {
  const db = getFirestore();
  const sessionRef = db.doc(`analyses/${sessionId}`);

  try {
    // ─── Phase 1: Data Enrichment ───
    await sessionRef.update({ status: 'enriching', currentPhase: '기업 데이터 수집 중...' });
    const enrichedData = await enrichCompanyData(company);
    await sessionRef.update({ enrichedData, progress: 15 });

    // ─── Phase 2: Independent Analysis (병렬) ───
    await sessionRef.update({ status: 'analyzing', currentPhase: '전문가 독립 분석 중...' });
    
    const independentAnalyses = await Promise.all(
      AGENT_IDS.map(async (agentId, index) => {
        const analysis = await runAgentAnalysis(agentId, company, enrichedData);
        
        // 각 에이전트 분석 완료 즉시 Firestore에 write (실시간 표시)
        await db.collection(`analyses/${sessionId}/messages`).add({
          agentId,
          agentName: AGENTS[agentId].name,
          agentRole: AGENTS[agentId].title,
          phase: 'independent_analysis',
          content: analysis.narrative,
          structuredEval: analysis.structured,
          order: index,
          createdAt: FieldValue.serverTimestamp(),
          tokenCount: analysis.tokenCount,
        });
        
        await sessionRef.update({ progress: 15 + (index + 1) * 10 });
        return { agentId, analysis };
      })
    );

    // ─── Phase 3: Conflict Detection ───
    await sessionRef.update({ 
      status: 'debating', 
      currentPhase: '의견 충돌 분석 중...',
      progress: 70 
    });
    
    const conflicts = await detectConflicts(independentAnalyses);
    
    // 충돌 정보 저장
    for (const conflict of conflicts) {
      await db.collection(`analyses/${sessionId}/conflicts`).add(conflict);
    }

    // ─── Phase 4: Cross-Examination & Rebuttal ───
    await sessionRef.update({ currentPhase: '교차 검증 및 토론 중...' });
    
    let messageOrder = AGENT_IDS.length;
    
    for (const conflict of conflicts) {
      const involvedAgents = conflict.agentPositions.map(p => p.agentId);
      
      for (const agentId of involvedAgents) {
        const otherPositions = conflict.agentPositions
          .filter(p => p.agentId !== agentId);
        
        const rebuttal = await generateRebuttal(
          agentId, conflict.topic, otherPositions, enrichedData
        );
        
        await db.collection(`analyses/${sessionId}/messages`).add({
          agentId,
          agentName: AGENTS[agentId].name,
          agentRole: AGENTS[agentId].title,
          phase: 'rebuttal',
          content: rebuttal.content,
          agreementLevel: rebuttal.agreementLevel,
          order: messageOrder++,
          createdAt: FieldValue.serverTimestamp(),
          tokenCount: rebuttal.tokenCount,
        });
        
        // 발언 간 약간의 딜레이 (자연스러운 토론 느낌)
        await delay(500);
      }
    }

    await sessionRef.update({ progress: 85 });

    // ─── Phase 5: Final Verdicts ───
    await sessionRef.update({ currentPhase: '최종 의견 수렴 중...' });
    
    const verdicts = await Promise.all(
      AGENT_IDS.map(async (agentId) => {
        const verdict = await generateFinalVerdict(agentId, sessionId);
        
        await db.collection(`analyses/${sessionId}/messages`).add({
          agentId,
          phase: 'final_verdict',
          content: verdict.content,
          structuredEval: verdict.structured,
          order: messageOrder++,
          createdAt: FieldValue.serverTimestamp(),
        });
        
        return { agentId, verdict };
      })
    );

    await sessionRef.update({ progress: 92 });

    // ─── Phase 6: Synthesis ───
    await sessionRef.update({ 
      status: 'synthesizing', 
      currentPhase: '종합 리포트 생성 중...' 
    });
    
    const report = await synthesizeReport(
      company, enrichedData, independentAnalyses, conflicts, verdicts
    );

    // ─── 완료 ───
    await sessionRef.update({
      status: 'completed',
      currentPhase: '분석 완료',
      progress: 100,
      report,
      completedAt: FieldValue.serverTimestamp(),
    });

  } catch (error) {
    await sessionRef.update({
      status: 'failed',
      currentPhase: `오류: ${error.message}`,
    });
    throw error;
  }
}
```

### 5.3 에이전트 프롬프트 구조 (예시: 종양내과)

```typescript
// src/lib/agents/prompts/oncologist.ts

export function buildOncologistPrompt(
  company: CompanyInfo,
  enrichedData: EnrichedData,
  phase: AnalysisPhase
): string {
  
  const baseContext = `
당신은 김서연 박사입니다. 
서울대 의대 졸업, 미국 MD Anderson Cancer Center에서 
종양내과 펠로우십을 마치고 국립암센터 임상시험센터에서 
10년간 Phase I-III 임상시험을 총괄했습니다.
현재는 바이오 투자자문을 겸하고 있습니다.

[성격과 스타일]
- 데이터에 기반한 냉철한 판단. 감정적 과대평가를 경계
- 임상적으로 의미있는 차이(clinically meaningful difference)에 집착
- 통계적 유의성과 임상적 유의성을 엄격히 구분
- "p < 0.05이지만 OS 차이가 2개월이면 그게 환자에게 무슨 의미가 있나?"
- 부작용 관리 가능성을 실무적 관점에서 평가
- 학회 발표를 많이 다녀서 KOL 네트워크의 분위기를 읽을 줄 앎

[절대 하지 않는 것]
- 전임상 데이터만으로 임상 성공을 예단하지 않음
- Surrogate endpoint(대리 지표)를 최종 결과처럼 해석하지 않음
- 단일 임상시험 결과를 과대해석하지 않음
`;

  if (phase === 'independent_analysis') {
    return `
${baseContext}

[분석 대상]
회사: ${company.name} (${company.ticker || 'N/A'})
분야: ${company.sector}

[제공된 데이터]
${formatClinicalTrials(enrichedData.clinicalTrials)}
${formatPapers(enrichedData.recentPapers)}
${formatCompetitors(enrichedData.competitors)}

[분석 지시]
김서연 박사로서 이 회사를 임상적 관점에서 분석해주세요.

반드시 다음 구조로 답변하세요:

1. 핵심 임상 자산 평가
   - 각 파이프라인의 임상적 의미를 구체적으로
   - 임상시험 디자인의 적절성 (endpoint 선택, 대조군 등)
   - 기존 SoC 대비 실제 우위가 있는지

2. 부작용 프로파일 분석
   - 임상에서 관리 가능한 수준인지
   - 경쟁약 대비 안전성 프로파일 비교

3. 처방 전환 가능성
   - 실제 임상의로서 이 약을 처방할 것인지
   - 처방 전환의 허들은 무엇인지

4. 정량 평가
   - 임상적 가치 (0-100점)
   - 임상 성공 확률 (Phase별)
   - 핵심 리스크 3가지
   - 핵심 기회 3가지

5. 한줄 요약
   - 이 회사를 한 문장으로 평가한다면

솔직하고 날카롭게 평가하세요. 좋은 점도 나쁜 점도 숨기지 마세요.
`;
  }
  
  // ... rebuttal, final_verdict 등 phase별 프롬프트
}
```

---

## 6. 핵심 API 엔드포인트

### 6.1 Next.js API Routes (Vercel)

```typescript
// src/app/api/analysis/start/route.ts
// 역할: 인증 확인 → Cloud Function 트리거 → sessionId 반환

export async function POST(req: Request) {
  // 1. Firebase Auth 토큰 검증
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const decoded = await adminAuth.verifyIdToken(token);
  
  // 2. Rate limiting (남용 방지 — 무료지만 기본 제한)
  const user = await getUser(decoded.uid);
  if (user.dailyUsage >= 10) {
    return Response.json({ error: '일일 분석 한도 초과 (10회/일)' }, { status: 429 });
  }
  
  // 3. 분석 세션 생성
  const { company } = await req.json();
  const sessionId = crypto.randomUUID();
  
  await adminDb.doc(`analyses/${sessionId}`).set({
    id: sessionId,
    userId: decoded.uid,
    company,
    status: 'enriching',
    progress: 0,
    createdAt: FieldValue.serverTimestamp(),
    totalTokensUsed: 0,
    estimatedCost: 0,
  });
  
  // 4. Cloud Function 트리거 (비동기)
  await triggerOrchestration(sessionId, company);
  
  // 5. sessionId 즉시 반환 (프론트에서 Firestore 구독 시작)
  return Response.json({ sessionId });
}
```

### 6.2 Cloud Functions (Firebase)

```typescript
// functions/src/index.ts

import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// 분석 문서 생성 시 자동 트리거
export const onAnalysisCreated = onDocumentCreated(
  {
    document: 'analyses/{sessionId}',
    timeoutSeconds: 540,     // 9분 타임아웃
    memory: '1GiB',
    region: 'asia-northeast3', // 서울 리전
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    
    await orchestrateAnalysis(event.params.sessionId, data.company);
  }
);

// ⭐ 상담 요청 생성 시 전문가에게 이메일 알림
export const onConsultRequestCreated = onDocumentCreated(
  {
    document: 'consultRequests/{requestId}',
    region: 'asia-northeast3',
  },
  async (event) => {
    const request = event.data?.data() as ConsultRequestDoc;
    if (!request) return;
    
    // 전문가 정보 조회
    const expertSnap = await getFirestore()
      .doc(`experts/${request.expertId}`).get();
    const expert = expertSnap.data() as ExpertDoc;
    
    // 이메일 발송 (Resend)
    await sendConsultNotification({
      to: expert.email,
      expertName: expert.name,
      userName: request.userName,
      subject: request.subject,
      message: request.message,
      linkedCompany: request.linkedCompany,
      aiReportSummary: request.aiReportSummary,
      preferredMethod: request.preferredMethod,
    });
    
    // 상태 업데이트
    await event.data?.ref.update({
      status: 'notified',
      notifiedAt: FieldValue.serverTimestamp(),
    });
  }
);
```

---

## 7. 프론트엔드 핵심 컴포넌트

### 7.1 실시간 토론 뷰 (핵심 UX)

```typescript
// src/hooks/useDebateStream.ts

export function useDebateStream(sessionId: string) {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>('enriching');
  const [progress, setProgress] = useState(0);
  const [conflicts, setConflicts] = useState<ConflictDoc[]>([]);
  
  useEffect(() => {
    // 세션 상태 구독
    const unsubSession = onSnapshot(
      doc(db, 'analyses', sessionId),
      (snap) => {
        const data = snap.data();
        setStatus(data.status);
        setProgress(data.progress);
      }
    );
    
    // 메시지 실시간 구독 (발언 순서대로)
    const unsubMessages = onSnapshot(
      query(
        collection(db, `analyses/${sessionId}/messages`),
        orderBy('order', 'asc')
      ),
      (snap) => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs);
      }
    );
    
    // 충돌 구독
    const unsubConflicts = onSnapshot(
      collection(db, `analyses/${sessionId}/conflicts`),
      (snap) => {
        setConflicts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );
    
    return () => {
      unsubSession();
      unsubMessages();
      unsubConflicts();
    };
  }, [sessionId]);
  
  return { messages, status, progress, conflicts };
}
```

### 7.2 화면 구성 와이어프레임

**토론 뷰**
```
┌─────────────────────────────────────────────────────────────┐
│  BioPanel AI      [Dashboard]  [내 분석]  [전문가] [Profile] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  에이전트     │  📊 삼성바이오로직스 분석                      │
│  패널        │  ━━━━━━━━━━━━━━━━━━━━━━━ 67%                │
│              │  현재: 교차 검증 및 토론 중...                  │
│  ┌────────┐  │                                              │
│  │ 🔴     │  │  ┌─────────────────────────────────────────┐ │
│  │ 김서연  │  │  │ Phase 1: 독립 분석                       │ │
│  │ 종양내과│  │  │                                         │ │
│  │ 발언중..│  │  │  🔴 김서연 (종양내과)                     │ │
│  └────────┘  │  │  "바이오시밀러 포트폴리오는 검증된 기술력  │ │
│              │  │   기반이나, 신약 파이프라인의 임상적        │ │
│  ┌────────┐  │  │   차별화가 부족합니다. 특히..."            │ │
│  │ 🟢     │  │  │  📊 임상적 가치: 72/100                   │ │
│  │ 박준호  │  │  │                                         │ │
│  │ 약물경제│  │  │  🟢 박준호 (약물경제학)                    │ │
│  │ 완료 ✓ │  │  │  "바이오시밀러의 ICER는 오리지널 대비      │ │
│  └────────┘  │  │   확실한 비용 우위가 있으나, 각국         │ │
│              │  │   약가 정책에 따른 변동성이..."             │ │
│  ┌────────┐  │  │  📊 경제성: 81/100                        │ │
│  │ 🔵     │  │  │                                         │ │
│  │ 이현우  │  │  ├─────────────────────────────────────────┤ │
│  │ 애널리스│  │  │ ⚡ 의견 충돌 감지                         │ │
│  │ 완료 ✓ │  │  │ "시장 규모 추정" — 이현우 vs 박준호       │ │
│  └────────┘  │  ├─────────────────────────────────────────┤ │
│              │  │ Phase 2: 교차 검증                        │ │
│  ┌────────┐  │  │                                         │ │
│  │ 🟡     │  │  │  🔵 이현우 → 🟢 박준호에게:               │ │
│  │ 정미래  │  │  │  "박준호 박사님의 급여 가능성 분석에는    │ │
│  │ 규제    │  │  │   동의하지만, 미국 자비부담 시장을         │ │
│  │ 대기중  │  │  │   과소평가하셨습니다..."                  │ │
│  └────────┘  │  │                                         │ │
│              │  │  🟢 박준호 → 🔵 이현우에게:                │ │
│  ┌────────┐  │  │  "이현우 애널리스트의 peak sales 추정     │ │
│  │ 🟣     │  │  │   $3.2B는 biosimilar erosion을            │ │
│  │ 최은지  │  │  │   충분히 반영하지 않았습니다..."           │ │
│  │ 면역학  │  │  │                                         │ │
│  │ 대기중  │  │  └─────────────────────────────────────────┘ │
│  └────────┘  │                                              │
│              │  [리포트 보기] (분석 완료 후 활성화)            │
├──────────────┴──────────────────────────────────────────────┤
│  Powered by BioPanel AI · 무료 서비스                        │
└─────────────────────────────────────────────────────────────┘
```

**리포트 뷰 (하단 — 전문가 연결 CTA)**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ─── 종합 리포트 ─── 점수 ─── 히트맵 ─── (생략) ───         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💡 AI 분석을 넘어, 실제 전문가의 의견이 필요하신가요?        │
│                                                             │
│  이 분석과 관련된 전문가를 추천해드립니다:                     │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐               │
│  │ 👨‍⚕️ 한정수 교수     │  │ 👩‍🔬 윤소영 박사     │               │
│  │ 종양내과 전문의    │  │ 바이오시밀러 전문  │               │
│  │ ★ 4.9 (23건)      │  │ ★ 4.8 (17건)      │               │
│  │                   │  │                   │               │
│  │ "이 분석의 임상    │  │ "바이오시밀러 시장 │               │
│  │  endpoint 해석에   │  │  진입 전략에 대해  │               │
│  │  심층 자문 가능"   │  │  자문 가능"        │               │
│  │                   │  │                   │               │
│  │ 초기상담 30만원    │  │ 초기상담 25만원    │               │
│  │ [프로필 보기]      │  │ [프로필 보기]      │               │
│  │ [📩 상담 요청]     │  │ [📩 상담 요청]     │               │
│  └───────────────────┘  └───────────────────┘               │
│                                                             │
│  [전체 전문가 보기 →]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**전문가 프로필 페이지**
```
┌─────────────────────────────────────────────────────────────┐
│  BioPanel AI      [Dashboard]  [내 분석]  [전문가] [Profile] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────┐  한정수 교수                                       │
│  │ 사진  │  종양내과 전문의 · 서울대학교병원                    │
│  │      │  ★ 4.9 (23건 상담 완료) · 보통 24시간 내 응답       │
│  └──────┘                                                   │
│                                                             │
│  ─── 전문 분야 ───                                           │
│  [폐암] [면역항암제] [ADC] [임상시험 디자인]                   │
│                                                             │
│  ─── 경력 ───                                                │
│  · 서울대 의대 졸업, MD Anderson 펠로우                       │
│  · 국립암센터 임상시험센터 10년                               │
│  · Phase I-III 임상시험 50건+ 총괄                           │
│                                                             │
│  ─── 자문 가능 영역 ───                                      │
│  · 항암제 파이프라인 임상적 가치 평가                         │
│  · 임상시험 디자인 및 endpoint 자문                          │
│  · 적응증 확장 전략                                          │
│                                                             │
│  ─── 상담 방식 & 비용 ───                                    │
│  · 초기 상담 (30분): 30만원                                  │
│  · 심층 자문 (시간당): 50만원                                │
│  · 방식: 화상통화 / 전화 / 이메일                            │
│  · 💬 "30분 무료 사전 통화 가능"                             │
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │         [📩 상담 요청하기]               │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**상담 요청 폼**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📩 한정수 교수님께 상담 요청                                 │
│                                                             │
│  상담 주제 *                                                 │
│  ┌─────────────────────────────────────────┐                │
│  │ 삼성바이오로직스 신약 파이프라인 임상...   │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  상세 내용 *                                                 │
│  ┌─────────────────────────────────────────┐                │
│  │ AI 분석 결과 임상 endpoint 해석에        │                │
│  │ 대한 전문가 의견이 필요합니다.            │                │
│  │ 특히 Phase 2 결과의 OS 전환 가능성에     │                │
│  │ 대해...                                 │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  📎 AI 분석 리포트 첨부                                      │
│  ✅ 삼성바이오로직스 분석 리포트 (2025.02.10)                 │
│     (전문가에게 AI 분석 맥락이 함께 전달됩니다)               │
│                                                             │
│  희망 상담 방식 *                                            │
│  (●) 화상통화  ( ) 전화  ( ) 이메일                          │
│                                                             │
│  희망 일정                                                   │
│  ┌─────────────────────────────────────────┐                │
│  │ 평일 오후 2-5시 희망                      │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  연락처 *                                                    │
│  이메일: michael@example.com (자동입력)                      │
│  전화번호: ┌──────────────────────┐ (선택)                   │
│           │                      │                          │
│           └──────────────────────┘                          │
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │           [상담 요청 보내기]              │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  * 요청 접수 후 전문가에게 이메일로 알림이 전송됩니다.         │
│  * 전문가가 수락하면 일정 조율 안내를 보내드립니다.            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 환경변수

```env
# .env.local

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (서버 사이드)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# 외부 데이터 API
NCBI_API_KEY=              # PubMed E-utilities
SEC_EDGAR_USER_AGENT=      # SEC EDGAR (이메일 형식)

# Vercel
VERCEL_URL=

# 이메일 알림 (전문가 상담 요청 알림용)
RESEND_API_KEY=                # Resend (또는 SENDGRID_API_KEY)
NOTIFICATION_FROM_EMAIL=       # noreply@biopanel.ai
```

---

## 9. 개발 로드맵

### Phase 0: 프로젝트 세팅 (1일)
- [x] Next.js + TypeScript + Tailwind 초기화
- [x] Firebase 프로젝트 생성 및 연동
- [x] Vercel 배포 설정
- [x] ESLint, Prettier 설정
- [x] 환경변수 세팅

### Phase 1: 인증 + 기본 레이아웃 (2일)
- [ ] Firebase Auth (Google 로그인) 구현
- [ ] 메인 레이아웃 (Header, Sidebar)
- [ ] Dashboard 페이지 (빈 상태)
- [ ] 보호 라우트 설정

### Phase 2: 단일 에이전트 파이프라인 (3일)
- [ ] 기업명 입력 UI
- [ ] 데이터 수집 모듈 (ClinicalTrials.gov, PubMed)
- [ ] 종양내과 에이전트 1명만으로 분석 파이프라인 구축
- [ ] Firestore에 결과 저장 + 실시간 표시
- [ ] **이 단계에서 end-to-end 작동 확인**

### Phase 3: 멀티에이전트 + 토론 (4일)
- [ ] 나머지 4명 에이전트 프롬프트 작성
- [ ] 병렬 독립 분석 구현
- [ ] 의견 충돌 감지 로직
- [ ] 교차 검증 / 반박 라운드
- [ ] 토론 타임라인 UI

### Phase 4: 리포트 생성 (3일)
- [ ] 종합 리포트 생성 로직
- [ ] 리포트 뷰 UI (점수, 히트맵, 매트릭스)
- [ ] PDF 내보내기
- [ ] 분석 이력 목록 / 대시보드

### Phase 5: 전문가 연결 시스템 (3일) ⭐ NEW
- [ ] 전문가 프로필 DB 구축 (Firestore experts 컬렉션)
- [ ] 전문가 목록/검색 페이지 (분야별 필터)
- [ ] 전문가 상세 프로필 페이지
- [ ] 상담 요청 폼 + Firestore 저장
- [ ] 상담 요청 시 전문가에게 이메일 알림 (Resend)
- [ ] AI 분석 리포트와 상담 요청 연동 (맥락 자동 전달)
- [ ] 리포트 하단 "추천 전문가" CTA 컴포넌트

### Phase 6: 폴리싱 + 런칭 (2일)
- [ ] 에러 핸들링 강화
- [ ] 로딩 상태 UX 개선
- [ ] 랜딩 페이지
- [ ] 프로덕션 배포

**총 예상 기간: 약 18일 (2.5주 + α)**

---

## 10. 비용 구조 & 수익 모델

### 운영 비용 (예상)

| 항목 | 월 100회 분석 기준 | 비고 |
|------|-------------------|------|
| Claude API | $100-200 | 세션당 ~15 호출, Sonnet 4 기준 |
| Firebase Firestore | $5-10 | 읽기/쓰기 기준 |
| Firebase Functions | $0-5 | 무료 티어 충분 |
| Vercel | $0-20 | Hobby: 무료, Pro: $20/월 |
| Resend (이메일) | $0 | 월 3,000건 무료 |
| 도메인 | $12/년 | |
| **총 월 비용** | **$110-240** | 초기 MVP 기준 |

### 서비스 모델: AI 분석 무료 + 전문가 연결 수익화

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   🆓 무료 레이어 (AI 분석)                       │
│   ─────────────────────────                     │
│   · AI 멀티에이전트 기업 분석: 완전 무료          │
│   · 실시간 토론 스트리밍: 무료                    │
│   · 종합 리포트 + PDF 내보내기: 무료              │
│   · 분석 이력 저장: 무료                          │
│                                                 │
│   → 목적: 사용자 유입 + 분석 품질로 신뢰 구축     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   💰 수익 레이어 (전문가 연결)                    │
│   ─────────────────────────                     │
│   · 전문가 프로필 열람: 무료                      │
│   · 상담 요청 접수: 무료                          │
│   · 실제 상담 성사 시: 중개 수수료               │
│                                                 │
│   수수료 모델 (예시):                             │
│   · 상담 성사 건당 수수료: 상담료의 15-20%        │
│   · 또는 전문가 월정액 리스팅비: 5-10만원/월      │
│   · 또는 하이브리드 (낮은 리스팅비 + 낮은 수수료) │
│                                                 │
│   → 목적: AI가 해결 못하는 영역에서 자연스럽게     │
│     수익 발생. 사용자에게 강제하지 않음             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 왜 이 모델이 좋은가

1. **진입 장벽 제로**: AI 분석이 무료이므로 사용자가 부담 없이 써봄
2. **자연스러운 전환**: AI 분석 → "이 부분은 전문가 확인이 필요" → 전문가 연결
3. **양면 플랫폼**: 사용자가 많아지면 전문가도 자발적으로 등록 (리드 확보 채널)
4. **AI 분석이 전문가의 시간을 절약**: 전문가가 상담 전 AI 리포트를 미리 받으므로, 더 효율적인 상담 가능 → 전문가 만족도 ↑

---

> **시작 포인트**: Phase 0 → Phase 1 → Phase 2 순서로 진행.
> Phase 2에서 에이전트 1명이라도 end-to-end로 돌아가는 것을 먼저 확인한 후
> 멀티에이전트로 확장하는 것이 리스크를 줄이는 핵심입니다.
> 전문가 연결은 Phase 5에서 붙이되, 초기에는 수동으로 전문가 3-5명만 
> 직접 섭외해서 프로필을 등록하는 것으로 시작하세요.
