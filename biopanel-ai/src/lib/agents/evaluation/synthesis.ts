import { callClaude } from '../../utils/claude';
import { FinalReport } from '@/types/report';
import { CompanyInput } from '@/types/company';
import { EnrichedData } from '@/types/analysis';

export async function synthesizeReport(
  company: CompanyInput,
  enrichedData: EnrichedData,
  analyses: any[],
  conflicts: any[],
  verdicts: any[]
): Promise<FinalReport> {
  const prompt = `다음은 ${company.name}에 대한 5명의 전문가 분석, 토론, 최종 의견입니다.
이를 바탕으로 종합 투자 심사 리포트를 생성하세요.

[독립 분석 요약]
${analyses.map((a: any) => `${a.agentId}: ${a.analysis.narrative.substring(0, 500)}...`).join('\n\n')}

[의견 충돌]
${conflicts.map((c: any) => `주제: ${c.topic} - ${c.description}`).join('\n')}

[최종 의견]
${verdicts.map((v: any) => `${v.agentId}: ${v.verdict.content.substring(0, 300)}...`).join('\n\n')}

반드시 다음 JSON 형태로 응답하세요:
\`\`\`json
{
  "executiveSummary": "종합 요약 (3-5문장)",
  "overallScore": 75,
  "dimensionScores": {
    "clinicalValue": 70,
    "regulatoryPath": 65,
    "commercialPotential": 80,
    "competitivePosition": 75,
    "financialHealth": 70,
    "ipStrength": 60
  },
  "pipelineAnalysis": [...],
  "riskMatrix": [...],
  "competitorLandscape": [...],
  "agentVerdicts": [...],
  "consensusPoints": [...],
  "dissensusPoints": [...],
  "openQuestions": [...],
  "recommendedExperts": [...]
}
\`\`\``;

  const { content } = await callClaude(
    '당신은 바이오/헬스케어 투자 심사 리포트 작성 전문가입니다. 여러 전문가의 분석을 종합하여 구조화된 최종 리포트를 생성합니다.',
    prompt
  );

  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as FinalReport;
    }
    return JSON.parse(content) as FinalReport;
  } catch {
    return {
      executiveSummary: content,
      overallScore: 0,
      dimensionScores: { clinicalValue: 0, regulatoryPath: 0, commercialPotential: 0, competitivePosition: 0, financialHealth: 0, ipStrength: 0 },
      pipelineAnalysis: [],
      riskMatrix: [],
      competitorLandscape: [],
      agentVerdicts: [],
      consensusPoints: [],
      dissensusPoints: [],
      openQuestions: [],
      recommendedExperts: [],
    };
  }
}
