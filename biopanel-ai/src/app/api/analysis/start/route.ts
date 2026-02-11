import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { EnrichmentStepData } from '@/types/analysis';

// Timeout wrapper for async operations
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

const initialEnrichmentSteps: EnrichmentStepData[] = [
  {
    id: 'news',
    label: '관련 뉴스 탐색',
    description: '최근 3개월 내 기업 관련 뉴스 검색',
    icon: 'news',
    status: 'pending',
  },
  {
    id: 'clinical',
    label: 'ClinicalTrials.gov 검색',
    description: '진행 중인 임상시험 데이터 수집',
    icon: 'clinical',
    status: 'pending',
  },
  {
    id: 'fda',
    label: 'FDA 자료 수집',
    description: '승인 이력 및 규제 정보 조회',
    icon: 'fda',
    status: 'pending',
  },
  {
    id: 'pubmed',
    label: 'PubMed 논문 검색',
    description: '관련 학술 논문 및 연구 자료',
    icon: 'pubmed',
    status: 'pending',
  },
  {
    id: 'financial',
    label: '재무 데이터 분석',
    description: 'SEC/DART 공시 자료 수집',
    icon: 'financial',
    status: 'pending',
  },
  {
    id: 'competitor',
    label: '경쟁사 분석',
    description: '동일 적응증 파이프라인 비교',
    icon: 'competitor',
    status: 'pending',
  },
];

export async function POST(req: NextRequest) {
  console.log('[API/start] Received request');

  try {
    const body = await req.json();
    console.log('[API/start] Parsed body:', body);

    const { company } = body;

    if (!company?.name || !company?.sector) {
      console.log('[API/start] Validation failed - missing company info');
      return NextResponse.json({ error: '기업명과 섹터는 필수입니다.' }, { status: 400 });
    }

    console.log('[API/start] Creating session for:', company.name);

    // Create analysis session with enrichment steps
    const sessionsRef = collection(db, 'analyses');
    const sessionRef = doc(sessionsRef);
    const sessionId = sessionRef.id;

    console.log('[API/start] Generated sessionId:', sessionId);
    console.log('[API/start] Writing to Firestore...');

    await withTimeout(
      setDoc(sessionRef, {
        id: sessionId,
        userId: 'anonymous',
        company,
        status: 'enriching',
        currentPhase: 'enrichment',
        progress: 0,
        enrichmentSteps: initialEnrichmentSteps,
        createdAt: serverTimestamp(),
        totalTokensUsed: 0,
        estimatedCost: 0,
      }),
      15000 // 15 second timeout
    );

    console.log('[API/start] Firestore write complete');

    // Client will trigger /api/analysis/enrich when page loads
    return NextResponse.json({ sessionId });
  } catch (error: any) {
    console.error('[API/start] Error:', error);
    return NextResponse.json({ error: error.message || '분석 시작에 실패했습니다.' }, { status: 500 });
  }
}
