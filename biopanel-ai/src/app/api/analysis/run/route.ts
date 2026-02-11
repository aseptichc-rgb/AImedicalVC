import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { callGemini } from '@/lib/utils/gemini';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { AgentId } from '@/types/agent';
import { EnrichedData } from '@/types/analysis';

const AGENT_IDS: AgentId[] = ['oncologist', 'pharmacist', 'analyst', 'regulatory', 'immunologist'];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function addMessage(
  sessionId: string,
  agentId: AgentId,
  phase: string,
  content: string,
  order: number,
  metadata?: Record<string, any>
) {
  const agent = AGENT_REGISTRY[agentId];
  await addDoc(collection(db, `analyses/${sessionId}/messages`), {
    agentId,
    agentName: agent.name,
    agentRole: agent.title,
    phase,
    content,
    order,
    structuredEval: metadata?.structuredEval,
    agreementLevel: metadata?.agreementLevel,
    createdAt: serverTimestamp(),
    tokenCount: metadata?.tokenCount || 0,
  });
}

function buildAnalysisPrompt(
  agentId: AgentId,
  company: { name: string; sector: string; description?: string },
  enrichedData: EnrichedData
) {
  const agent = AGENT_REGISTRY[agentId];

  let dataContext = '';
  if (enrichedData.news?.length) {
    dataContext += `\n최근 뉴스:\n${enrichedData.news.slice(0, 3).map(n => `- ${n.title}`).join('\n')}`;
  }
  if (enrichedData.fdaEvents?.length) {
    dataContext += `\n\nFDA 이벤트:\n${enrichedData.fdaEvents.slice(0, 3).map(e => `- ${e.type}: ${e.product || e.applicant}`).join('\n')}`;
  }
  if (enrichedData.financials) {
    dataContext += `\n\n재무 정보:\n- 시가총액: ${enrichedData.financials.marketCap || 'N/A'}\n- 현금보유: ${enrichedData.financials.cashPosition || 'N/A'}`;
  }

  return `당신은 ${agent.name} (${agent.nameEn})입니다. ${agent.title}

분석 대상: ${company.name} (${company.sector})
${company.description ? `추가 정보: ${company.description}` : ''}
${dataContext}

당신의 전문 분야 관점에서 이 기업을 분석해주세요.

평가 축: ${agent.evaluationAxes.join(', ')}

분석 시 다음 형식으로 응답해주세요:
1. 핵심 분석 (2-3 문단)
2. 주요 발견사항 (3-5개)
3. 리스크 요인 (2-3개)
4. 기회 요인 (2-3개)
5. 종합 평가 점수 (0-100)

응답 마지막에 반드시 다음 JSON을 포함하세요:
\`\`\`json
{
  "scores": {
    "overall": 점수
  },
  "keyFindings": ["발견1", "발견2", "발견3"],
  "risks": ["리스크1", "리스크2"],
  "opportunities": ["기회1", "기회2"]
}
\`\`\``;
}

export async function POST(req: NextRequest) {
  let sessionId: string | undefined;

  try {
    const body = await req.json();
    sessionId = body.sessionId;
    const company = body.company;

    if (!sessionId || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[Run] Starting AI analysis for session ${sessionId}`);

    const sessionRef = doc(db, 'analyses', sessionId);

    // Fetch enrichedData from Firestore
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = sessionSnap.data();
    const enrichedData: EnrichedData = sessionData.enrichedData || {
      clinicalTrials: [],
      recentPapers: [],
      competitors: [],
      regulatoryHistory: [],
      news: [],
      fdaEvents: [],
    };

    let messageOrder = 0;

    // Phase 1: Independent Analysis
    await updateDoc(sessionRef, {
      status: 'analyzing',
      currentPhase: 'independent_analysis',
      progress: 25,
      updatedAt: serverTimestamp(),
    });

    for (const agentId of AGENT_IDS) {
      const agent = AGENT_REGISTRY[agentId];
      const systemPrompt = `당신은 ${agent.name} (${agent.nameEn})입니다. ${agent.title}`;
      const userPrompt = buildAnalysisPrompt(agentId, company, enrichedData || {});

      try {
        const result = await callGemini(systemPrompt, userPrompt);
        const response = result.content;

        // Parse structured output
        let structuredEval = {
          scores: {},
          keyFindings: [],
          risks: [],
          opportunities: [],
        };

        try {
          const jsonMatch = response.match(/```json\n?([\s\S]*?)```/);
          if (jsonMatch) {
            structuredEval = JSON.parse(jsonMatch[1]);
          }
        } catch (e) {
          // Use default
        }

        await addMessage(sessionId, agentId, 'independent_analysis', response, messageOrder++, {
          structuredEval,
          tokenCount: result.usage.output_tokens,
        });
      } catch (error) {
        console.error(`Analysis error for ${agentId}:`, error);
        await addMessage(
          sessionId,
          agentId,
          'independent_analysis',
          `${agent.name}의 분석이 진행 중입니다...`,
          messageOrder++
        );
      }

      await delay(1000);

      // Update progress
      const progressValue = 25 + ((messageOrder / AGENT_IDS.length) * 25);
      await updateDoc(sessionRef, {
        progress: Math.round(progressValue),
        updatedAt: serverTimestamp(),
      });
    }

    // Phase 2: Cross-examination (simplified)
    await updateDoc(sessionRef, {
      status: 'debating',
      currentPhase: 'cross_examination',
      progress: 55,
      updatedAt: serverTimestamp(),
    });

    for (const agentId of AGENT_IDS) {
      const agent = AGENT_REGISTRY[agentId];
      const systemPrompt = `당신은 ${agent.name} (${agent.nameEn})입니다. ${agent.title}`;
      const crossExamPrompt = `${company.name}에 대한 다른 전문가들의 분석을 검토하고 동의/반대 의견을 짧게 제시해주세요. (2-3문장)`;

      try {
        const result = await callGemini(systemPrompt, crossExamPrompt);

        await addMessage(sessionId, agentId, 'cross_examination', result.content, messageOrder++, {
          agreementLevel: 'partially_agree',
        });
      } catch (error) {
        console.error(`Cross-exam error for ${agentId}:`, error);
      }

      await delay(800);

      const progressValue = 55 + ((messageOrder - AGENT_IDS.length) / AGENT_IDS.length) * 20;
      await updateDoc(sessionRef, {
        progress: Math.round(progressValue),
        updatedAt: serverTimestamp(),
      });
    }

    // Phase 3: Final Verdict
    await updateDoc(sessionRef, {
      currentPhase: 'final_verdict',
      progress: 80,
      updatedAt: serverTimestamp(),
    });

    for (const agentId of AGENT_IDS) {
      const agent = AGENT_REGISTRY[agentId];
      const systemPrompt = `당신은 ${agent.name} (${agent.nameEn})입니다. ${agent.title}`;
      const verdictPrompt = `${company.name}에 대한 최종 의견을 3문장 이내로 요약해주세요.`;

      try {
        const result = await callGemini(systemPrompt, verdictPrompt);

        await addMessage(sessionId, agentId, 'final_verdict', result.content, messageOrder++);
      } catch (error) {
        console.error(`Verdict error for ${agentId}:`, error);
      }

      await delay(600);
    }

    // Complete the analysis
    await updateDoc(sessionRef, {
      status: 'completed',
      currentPhase: 'completed',
      progress: 100,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Run] Analysis error:', error);

    // Update session with error status
    if (sessionId) {
      try {
        const sessionRef = doc(db, 'analyses', sessionId);
        await updateDoc(sessionRef, {
          status: 'failed',
          error: error.message,
          updatedAt: serverTimestamp(),
        });
      } catch (updateError) {
        console.error('[Run] Failed to update session status:', updateError);
      }
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
