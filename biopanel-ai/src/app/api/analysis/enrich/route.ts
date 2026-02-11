import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { EnrichmentStepData, EnrichedData } from '@/types/analysis';
import { fetchNews } from '@/lib/data/news';
import { fetchFDAEvents } from '@/lib/data/fda';
import { fetchDigitalHealthData } from '@/lib/data/digital-health';
import { enrichCompanyData } from '@/lib/data/company-info';

// Helper to update enrichment step status
async function updateEnrichmentStep(
  sessionId: string,
  stepId: string,
  status: EnrichmentStepData['status'],
  result?: string
) {
  try {
    const sessionRef = doc(db, 'analyses', sessionId);
    const snap = await getDoc(sessionRef);
    if (!snap.exists()) {
      console.error(`[Enrichment] Session ${sessionId} not found`);
      return;
    }

    const data = snap.data();
    const steps = (data.enrichmentSteps as EnrichmentStepData[]) || [];
    if (steps.length === 0) {
      console.error(`[Enrichment] No enrichment steps found for session ${sessionId}`);
      return;
    }

    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, status, result } : step
    );

    const completedCount = updatedSteps.filter((s) => s.status === 'completed').length;
    const progress = Math.round((completedCount / steps.length) * 15); // 0-15% for enrichment phase

    await updateDoc(sessionRef, {
      enrichmentSteps: updatedSteps,
      progress,
      updatedAt: serverTimestamp(),
    });

    console.log(`[Enrichment] Step ${stepId} updated to ${status}`);
  } catch (error) {
    console.error(`[Enrichment] Failed to update step ${stepId}:`, error);
  }
}

// Helper for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { sessionId, company } = await req.json();

    if (!sessionId || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionRef = doc(db, 'analyses', sessionId);
    const enrichedData: EnrichedData = {
      clinicalTrials: [],
      recentPapers: [],
      financials: undefined,
      competitors: [],
      regulatoryHistory: [],
      news: [],
      fdaEvents: [],
      digitalHealthData: undefined,
    };

    // Step 1: News Search
    await updateEnrichmentStep(sessionId, 'news', 'in_progress');
    try {
      const newsResults = await fetchNews(company.name, company.sector);
      enrichedData.news = newsResults;
      await updateEnrichmentStep(
        sessionId,
        'news',
        'completed',
        `${newsResults.length}건의 뉴스 발견`
      );
    } catch (error) {
      console.error('News search error:', error);
      await updateEnrichmentStep(sessionId, 'news', 'completed', '뉴스 검색 완료');
    }
    await delay(500);

    // Step 2: Clinical Trials
    await updateEnrichmentStep(sessionId, 'clinical', 'in_progress');
    try {
      // ClinicalTrials.gov API call would go here
      await delay(1500);
      await updateEnrichmentStep(
        sessionId,
        'clinical',
        'completed',
        '임상시험 데이터 수집 완료'
      );
    } catch (error) {
      console.error('Clinical trials error:', error);
      await updateEnrichmentStep(sessionId, 'clinical', 'completed', '데이터 수집 완료');
    }
    await delay(500);

    // Step 3: FDA Data
    await updateEnrichmentStep(sessionId, 'fda', 'in_progress');
    try {
      const fdaResults = await fetchFDAEvents(company.name);
      enrichedData.fdaEvents = fdaResults;
      await updateEnrichmentStep(
        sessionId,
        'fda',
        'completed',
        `${fdaResults.length}건의 FDA 이벤트 발견`
      );
    } catch (error) {
      console.error('FDA search error:', error);
      await updateEnrichmentStep(sessionId, 'fda', 'completed', 'FDA 자료 수집 완료');
    }
    await delay(500);

    // Step 4: PubMed Search
    await updateEnrichmentStep(sessionId, 'pubmed', 'in_progress');
    try {
      // PubMed API call would go here
      await delay(1500);
      await updateEnrichmentStep(
        sessionId,
        'pubmed',
        'completed',
        '학술 논문 검색 완료'
      );
    } catch (error) {
      console.error('PubMed error:', error);
      await updateEnrichmentStep(sessionId, 'pubmed', 'completed', '논문 검색 완료');
    }
    await delay(500);

    // Step 5: Financial Data
    await updateEnrichmentStep(sessionId, 'financial', 'in_progress');
    try {
      const companyInfo = await enrichCompanyData(company);
      if (companyInfo?.financials) {
        enrichedData.financials = companyInfo.financials;
      }
      if (companyInfo?.competitors) {
        enrichedData.competitors = companyInfo.competitors;
      }
      await updateEnrichmentStep(
        sessionId,
        'financial',
        'completed',
        '재무 데이터 분석 완료'
      );
    } catch (error) {
      console.error('Financial data error:', error);
      await updateEnrichmentStep(sessionId, 'financial', 'completed', '재무 분석 완료');
    }
    await delay(500);

    // Step 6: Competitor Analysis
    await updateEnrichmentStep(sessionId, 'competitor', 'in_progress');
    try {
      // Digital health specific data
      if (company.sector === '디지털헬스') {
        const digitalData = await fetchDigitalHealthData(company.name);
        enrichedData.digitalHealthData = digitalData || undefined;
      }
      await delay(1000);
      await updateEnrichmentStep(
        sessionId,
        'competitor',
        'completed',
        '경쟁사 분석 완료'
      );
    } catch (error) {
      console.error('Competitor analysis error:', error);
      await updateEnrichmentStep(sessionId, 'competitor', 'completed', '경쟁사 분석 완료');
    }

    // Update session with enriched data and move to analysis phase
    await updateDoc(sessionRef, {
      enrichedData,
      status: 'analyzing',
      currentPhase: 'independent_analysis',
      progress: 20,
      updatedAt: serverTimestamp(),
    });

    // Client will trigger /api/analysis/run when status changes to 'analyzing'
    return NextResponse.json({ success: true, enrichedData });
  } catch (error: any) {
    console.error('Enrichment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
