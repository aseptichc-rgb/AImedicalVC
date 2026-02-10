import { AgentId, AGENT_IDS, AgentAnalysisResult, RebuttalResult, VerdictResult, AnalysisPhase } from './types';
import { AGENT_REGISTRY, getAgent } from './registry';
import { detectConflicts, DetectedConflict } from './conflict-detector';
import { buildOncologistPrompt } from './prompts/oncologist';
import { buildPharmacistPrompt } from './prompts/pharmacist';
import { buildAnalystPrompt } from './prompts/analyst';
import { buildRegulatoryPrompt } from './prompts/regulatory';
import { buildImmunologistPrompt } from './prompts/immunologist';
import { callClaude } from '../utils/claude';
import { aggregateAgentScores, calculateOverallScore } from './evaluation/scoring';
import { synthesizeReport } from './evaluation/synthesis';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CompanyInput {
  name: string;
  ticker?: string;
  sector: string;
  description?: string;
}

export interface EnrichedData {
  clinicalTrials?: any[];
  financials?: any;
  patents?: any[];
  news?: any[];
  publications?: any[];
  competitors?: any[];
  [key: string]: any;
}

export interface OrchestrationProgress {
  phase: string;
  step: number;
  totalSteps: number;
  message: string;
  agentId?: AgentId;
}

export type ProgressCallback = (progress: OrchestrationProgress) => void;

// ---------------------------------------------------------------------------
// Prompt builder dispatcher
// ---------------------------------------------------------------------------

function buildPrompt(agentId: AgentId, company: CompanyInput, enrichedData: EnrichedData, phase: AnalysisPhase): string {
  switch (agentId) {
    case 'oncologist':
      return buildOncologistPrompt(company, enrichedData, phase);
    case 'pharmacist':
      return buildPharmacistPrompt(company, enrichedData, phase);
    case 'analyst':
      return buildAnalystPrompt(company, enrichedData, phase);
    case 'regulatory':
      return buildRegulatoryPrompt(company, enrichedData, phase);
    case 'immunologist':
      return buildImmunologistPrompt(company, enrichedData, phase);
    default:
      throw new Error(`Unknown agent: ${agentId}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseStructuredOutput(narrative: string): AgentAnalysisResult['structured'] {
  const defaultStructured = {
    scores: {},
    keyFindings: [],
    risks: [],
    opportunities: [],
  };

  try {
    const jsonMatch = narrative.match(/```json\n?([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        scores: parsed.scores || {},
        keyFindings: parsed.keyFindings || [],
        risks: parsed.risks || [],
        opportunities: parsed.opportunities || [],
      };
    }
  } catch {
    // Fall through to default
  }

  return defaultStructured;
}

function mapScoresToDimensions(agentId: AgentId, scores: Record<string, number>): Record<string, number> {
  // Normalize agent-specific score keys to standard dimension keys
  const mapped: Record<string, number> = {};
  for (const [key, value] of Object.entries(scores)) {
    const normalized = key
      .replace(/\s/g, '')
      .replace(/[가-힣]/g, '');
    mapped[key] = value;
  }
  return scores;
}

// ---------------------------------------------------------------------------
// Phase 1: Data Enrichment (placeholder — real enrichment handled externally)
// ---------------------------------------------------------------------------

async function enrichData(company: CompanyInput): Promise<EnrichedData> {
  // In the full system, this would call external APIs (SEC/DART, ClinicalTrials.gov, etc.)
  // For now, return a minimal shell that downstream prompts can handle.
  return {
    clinicalTrials: [],
    financials: {},
    patents: [],
    news: [],
    publications: [],
    competitors: [],
  };
}

// ---------------------------------------------------------------------------
// Phase 2: Independent Analysis
// ---------------------------------------------------------------------------

async function runIndependentAnalysis(
  agentId: AgentId,
  company: CompanyInput,
  enrichedData: EnrichedData
): Promise<AgentAnalysisResult> {
  const agent = getAgent(agentId);
  const prompt = buildPrompt(agentId, company, enrichedData, 'independent_analysis');

  const { content, usage } = await callClaude(
    `당신은 ${agent.name} (${agent.nameEn})입니다. ${agent.title}`,
    prompt
  );

  const structured = parseStructuredOutput(content);

  return {
    narrative: content,
    structured,
    tokenCount: usage?.output_tokens || 0,
  };
}

// ---------------------------------------------------------------------------
// Phase 3: Cross-Examination
// ---------------------------------------------------------------------------

async function runCrossExamination(
  agentId: AgentId,
  company: CompanyInput,
  ownAnalysis: AgentAnalysisResult,
  otherAnalyses: { agentId: AgentId; analysis: AgentAnalysisResult }[],
  conflicts: DetectedConflict[]
): Promise<RebuttalResult> {
  const agent = getAgent(agentId);

  const relevantConflicts = conflicts.filter((c) =>
    c.agentPositions.some((p) => p.agentId === agentId)
  );

  const otherSummaries = otherAnalyses
    .map((o) => {
      const otherAgent = getAgent(o.agentId);
      return `[${otherAgent.name} (${otherAgent.nameEn}) - ${otherAgent.title}]\n${o.analysis.narrative.substring(0, 1500)}...`;
    })
    .join('\n\n---\n\n');

  const conflictSection = relevantConflicts.length > 0
    ? `\n[당신과 관련된 의견 충돌]\n${relevantConflicts.map((c) => `- 주제: ${c.topic}\n  설명: ${c.description}\n  심각도: ${c.severity}`).join('\n')}`
    : '';

  const prompt = `당신은 ${agent.name}입니다. 다른 전문가들의 분석을 검토하고, 의견 충돌 지점에 대해 반론을 제기하세요.

[당신의 원래 분석 요약]
${ownAnalysis.narrative.substring(0, 2000)}...

[다른 전문가들의 분석]
${otherSummaries}
${conflictSection}

[지시사항]
1. 다른 전문가들의 분석에서 동의하는 부분과 동의하지 않는 부분을 명확히 구분하세요.
2. 의견 충돌이 있는 주제에 대해 당신의 전문성에 기반한 반론을 제시하세요.
3. 당신의 원래 분석에서 수정이 필요한 부분이 있다면 솔직하게 인정하세요.
4. 새로운 인사이트가 있다면 추가하세요.

응답 마지막에 반드시 다음 JSON을 포함하세요:
\`\`\`json
{
  "agreementLevel": "agree|partially_agree|disagree|strongly_disagree"
}
\`\`\``;

  const { content, usage } = await callClaude(
    `당신은 ${agent.name} (${agent.nameEn})입니다. ${agent.title}. 다른 전문가들과 교차 검토 토론 중입니다.`,
    prompt
  );

  let agreementLevel: RebuttalResult['agreementLevel'] = 'partially_agree';
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      agreementLevel = parsed.agreementLevel || 'partially_agree';
    }
  } catch {
    // Use default
  }

  return {
    content,
    agreementLevel,
    tokenCount: usage?.output_tokens || 0,
  };
}

// ---------------------------------------------------------------------------
// Phase 4: Final Verdict
// ---------------------------------------------------------------------------

async function runFinalVerdict(
  agentId: AgentId,
  company: CompanyInput,
  ownAnalysis: AgentAnalysisResult,
  rebuttal: RebuttalResult
): Promise<VerdictResult> {
  const agent = getAgent(agentId);

  const prompt = `당신은 ${agent.name}입니다. 독립 분석과 교차 검토 토론을 거친 후, 최종 의견을 제시하세요.

[당신의 원래 분석]
${ownAnalysis.narrative.substring(0, 2000)}...

[교차 검토 토론 결과]
${rebuttal.content.substring(0, 1500)}...

[지시사항]
토론을 통해 얻은 새로운 시각을 반영하여 ${company.name}에 대한 최종 의견을 제시하세요.

1. 원래 분석에서 유지하는 입장과 수정한 입장을 명확히 하세요.
2. 토론을 통해 얻은 새로운 인사이트를 반영하세요.
3. 최종 점수를 수정이 필요하면 수정하여 제시하세요.
4. ${company.name}에 대한 핵심 메시지를 3문장 이내로 요약하세요.

응답 마지막에 반드시 다음 JSON을 포함하세요:
\`\`\`json
{
  "scores": {
    "clinicalValue": 점수,
    "regulatoryPath": 점수,
    "commercialPotential": 점수,
    "competitivePosition": 점수,
    "financialHealth": 점수,
    "ipStrength": 점수
  },
  "keyFindings": ["핵심발견1", "핵심발견2", "핵심발견3"],
  "risks": ["리스크1", "리스크2", "리스크3"],
  "opportunities": ["기회1", "기회2", "기회3"]
}
\`\`\``;

  const { content, usage } = await callClaude(
    `당신은 ${agent.name} (${agent.nameEn})입니다. ${agent.title}. 최종 투자 의견을 제시합니다.`,
    prompt
  );

  const structured = parseStructuredOutput(content);

  return {
    content,
    structured,
    tokenCount: usage?.output_tokens || 0,
  };
}

// ---------------------------------------------------------------------------
// Firestore helpers
// ---------------------------------------------------------------------------

async function writeDebateMessage(
  sessionId: string,
  agentId: AgentId,
  phase: string,
  content: string,
  metadata?: Record<string, any>
) {
  const db = getFirestore();
  const agent = getAgent(agentId);

  await db
    .collection('sessions')
    .doc(sessionId)
    .collection('debate')
    .add({
      agentId,
      agentName: agent.name,
      agentColor: agent.color,
      phase,
      content,
      metadata: metadata || {},
      timestamp: FieldValue.serverTimestamp(),
    });
}

async function updateSessionPhase(sessionId: string, phase: string, progress: number) {
  const db = getFirestore();

  await db.collection('sessions').doc(sessionId).update({
    currentPhase: phase,
    progress,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Main Orchestrator
// ---------------------------------------------------------------------------

export async function orchestrate(
  sessionId: string,
  company: CompanyInput,
  externalEnrichedData?: EnrichedData,
  onProgress?: ProgressCallback
): Promise<void> {
  const db = getFirestore();
  const totalSteps = 6;

  try {
    // -----------------------------------------------------------------------
    // Phase 1: Data Enrichment
    // -----------------------------------------------------------------------
    onProgress?.({
      phase: 'enrichment',
      step: 1,
      totalSteps,
      message: `${company.name}에 대한 데이터를 수집하고 있습니다...`,
    });
    await updateSessionPhase(sessionId, 'enrichment', 10);

    const enrichedData = externalEnrichedData || (await enrichData(company));

    await db.collection('sessions').doc(sessionId).update({
      enrichedData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // -----------------------------------------------------------------------
    // Phase 2: Independent Analysis (all 5 agents in parallel)
    // -----------------------------------------------------------------------
    onProgress?.({
      phase: 'independent_analysis',
      step: 2,
      totalSteps,
      message: '5명의 전문가가 독립적으로 분석 중입니다...',
    });
    await updateSessionPhase(sessionId, 'independent_analysis', 20);

    const analysisResults: { agentId: AgentId; analysis: AgentAnalysisResult }[] = [];

    const analysisPromises = AGENT_IDS.map(async (agentId) => {
      onProgress?.({
        phase: 'independent_analysis',
        step: 2,
        totalSteps,
        message: `${getAgent(agentId).name}이(가) 분석 중입니다...`,
        agentId,
      });

      const analysis = await runIndependentAnalysis(agentId, company, enrichedData);

      // Write to Firestore as debate message
      await writeDebateMessage(sessionId, agentId, 'independent_analysis', analysis.narrative, {
        structured: analysis.structured,
        tokenCount: analysis.tokenCount,
      });

      // Small delay between writes for natural feel in the UI
      await delay(500);

      return { agentId, analysis };
    });

    const analyses = await Promise.all(analysisPromises);
    analysisResults.push(...analyses);

    // -----------------------------------------------------------------------
    // Phase 3: Conflict Detection
    // -----------------------------------------------------------------------
    onProgress?.({
      phase: 'conflict_detection',
      step: 3,
      totalSteps,
      message: '전문가 간 의견 충돌을 분석하고 있습니다...',
    });
    await updateSessionPhase(sessionId, 'conflict_detection', 45);

    const conflicts = await detectConflicts(analysisResults);

    await db.collection('sessions').doc(sessionId).update({
      conflicts,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Write conflict summary as a system message
    if (conflicts.length > 0) {
      const conflictSummary = conflicts
        .map((c) => `[${c.severity.toUpperCase()}] ${c.topic}: ${c.description}`)
        .join('\n');

      await db
        .collection('sessions')
        .doc(sessionId)
        .collection('debate')
        .add({
          agentId: null,
          agentName: 'System',
          agentColor: '#95A5A6',
          phase: 'conflict_detection',
          content: `의견 충돌 ${conflicts.length}건이 감지되었습니다:\n\n${conflictSummary}`,
          metadata: { conflicts },
          timestamp: FieldValue.serverTimestamp(),
        });
    }

    // -----------------------------------------------------------------------
    // Phase 4: Cross-Examination
    // -----------------------------------------------------------------------
    onProgress?.({
      phase: 'cross_examination',
      step: 4,
      totalSteps,
      message: '전문가 간 교차 검토 토론이 진행 중입니다...',
    });
    await updateSessionPhase(sessionId, 'cross_examination', 55);

    const rebuttalResults: { agentId: AgentId; rebuttal: RebuttalResult }[] = [];

    // Run cross-examinations sequentially for a more natural debate flow
    for (const agentId of AGENT_IDS) {
      onProgress?.({
        phase: 'cross_examination',
        step: 4,
        totalSteps,
        message: `${getAgent(agentId).name}이(가) 반론을 준비 중입니다...`,
        agentId,
      });

      const ownResult = analysisResults.find((r) => r.agentId === agentId)!;
      const otherResults = analysisResults.filter((r) => r.agentId !== agentId);

      const rebuttal = await runCrossExamination(
        agentId,
        company,
        ownResult.analysis,
        otherResults,
        conflicts
      );

      await writeDebateMessage(sessionId, agentId, 'cross_examination', rebuttal.content, {
        agreementLevel: rebuttal.agreementLevel,
        tokenCount: rebuttal.tokenCount,
      });

      rebuttalResults.push({ agentId, rebuttal });

      // Delay between debate messages for natural feel
      await delay(1000);
    }

    // -----------------------------------------------------------------------
    // Phase 5: Final Verdict
    // -----------------------------------------------------------------------
    onProgress?.({
      phase: 'final_verdict',
      step: 5,
      totalSteps,
      message: '각 전문가가 최종 의견을 정리하고 있습니다...',
    });
    await updateSessionPhase(sessionId, 'final_verdict', 75);

    const verdictResults: { agentId: AgentId; verdict: VerdictResult }[] = [];

    // Run final verdicts in parallel
    const verdictPromises = AGENT_IDS.map(async (agentId) => {
      onProgress?.({
        phase: 'final_verdict',
        step: 5,
        totalSteps,
        message: `${getAgent(agentId).name}이(가) 최종 의견을 제출 중입니다...`,
        agentId,
      });

      const ownResult = analysisResults.find((r) => r.agentId === agentId)!;
      const ownRebuttal = rebuttalResults.find((r) => r.agentId === agentId)!;

      const verdict = await runFinalVerdict(agentId, company, ownResult.analysis, ownRebuttal.rebuttal);

      await writeDebateMessage(sessionId, agentId, 'final_verdict', verdict.content, {
        structured: verdict.structured,
        tokenCount: verdict.tokenCount,
      });

      return { agentId, verdict };
    });

    const verdicts = await Promise.all(verdictPromises);
    verdictResults.push(...verdicts);

    // -----------------------------------------------------------------------
    // Phase 6: Synthesis — Aggregate scores & generate final report
    // -----------------------------------------------------------------------
    onProgress?.({
      phase: 'synthesis',
      step: 6,
      totalSteps,
      message: '종합 리포트를 생성하고 있습니다...',
    });
    await updateSessionPhase(sessionId, 'synthesis', 90);

    // Aggregate dimension scores from all agent verdicts
    const allAgentScores = verdictResults.map((v) => v.verdict.structured.scores);
    const aggregatedScores = aggregateAgentScores(allAgentScores);
    const overallScore = calculateOverallScore(aggregatedScores);

    // Synthesize the final report using Claude
    const finalReport = await synthesizeReport(
      company,
      enrichedData,
      analysisResults,
      conflicts,
      verdictResults
    );

    // Override scores with our calculated aggregated scores
    finalReport.overallScore = overallScore;
    finalReport.dimensionScores = aggregatedScores;

    // Add individual agent verdicts to the report
    finalReport.agentVerdicts = verdictResults.map((v) => ({
      agentId: v.agentId,
      agentName: getAgent(v.agentId).name,
      agentNameEn: getAgent(v.agentId).nameEn,
      content: v.verdict.content,
      scores: v.verdict.structured.scores,
      keyFindings: v.verdict.structured.keyFindings,
      risks: v.verdict.structured.risks,
      opportunities: v.verdict.structured.opportunities,
    }));

    // Write final report to Firestore
    await db.collection('sessions').doc(sessionId).update({
      finalReport,
      overallScore,
      dimensionScores: aggregatedScores,
      status: 'completed',
      currentPhase: 'completed',
      progress: 100,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      totalTokens: [
        ...analysisResults.map((a) => a.analysis.tokenCount),
        ...rebuttalResults.map((r) => r.rebuttal.tokenCount),
        ...verdictResults.map((v) => v.verdict.tokenCount),
      ].reduce((sum, t) => sum + t, 0),
    });

    onProgress?.({
      phase: 'completed',
      step: 6,
      totalSteps,
      message: '분석이 완료되었습니다.',
    });
  } catch (error) {
    // Update session with error status
    await db.collection('sessions').doc(sessionId).update({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      updatedAt: FieldValue.serverTimestamp(),
    });

    throw error;
  }
}
