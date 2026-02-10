import { AgentId } from './types';
import { callClaude } from '../utils/claude';

export interface DetectedConflict {
  topic: string;
  description: string;
  agentPositions: {
    agentId: AgentId;
    position: string;
    confidence: number;
  }[];
  severity: 'minor' | 'moderate' | 'major';
}

export async function detectConflicts(
  analyses: { agentId: AgentId; analysis: { narrative: string } }[]
): Promise<DetectedConflict[]> {
  const analysisTexts = analyses
    .map((a) => `[${a.agentId}의 분석]\n${a.analysis.narrative}`)
    .join('\n\n---\n\n');

  const { content } = await callClaude(
    `당신은 토론 분석 전문가입니다. 5명의 전문가 분석 결과에서 의견이 충돌하는 지점을 감지해야 합니다.`,
    `다음 5명의 전문가 분석에서 의견이 충돌하거나 크게 다른 부분을 찾아주세요.

${analysisTexts}

반드시 다음 JSON 배열 형태로만 응답하세요:
\`\`\`json
[
  {
    "topic": "충돌 주제",
    "description": "충돌 설명",
    "agentPositions": [
      { "agentId": "에이전트ID", "position": "입장", "confidence": 0.8 }
    ],
    "severity": "minor|moderate|major"
  }
]
\`\`\``
  );

  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(content);
  } catch {
    return [];
  }
}
