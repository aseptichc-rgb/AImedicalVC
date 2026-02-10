export function buildBaseContext(agentName: string, background: string, personality: string[], dontDo: string[]): string {
  return `당신은 ${agentName}입니다.
${background}

[성격과 스타일]
${personality.map(p => `- ${p}`).join('\n')}

[절대 하지 않는 것]
${dontDo.map(d => `- ${d}`).join('\n')}`;
}

export function buildAnalysisInstruction(companyName: string, sector: string, ticker?: string): string {
  return `[분석 대상]
회사: ${companyName} (${ticker || 'N/A'})
분야: ${sector}`;
}

export function buildStructuredOutputInstruction(): string {
  return `반드시 다음 JSON 구조를 응답 마지막에 포함하세요:

\`\`\`json
{
  "scores": {
    "항목1": 점수,
    "항목2": 점수
  },
  "keyFindings": ["발견1", "발견2", "발견3"],
  "risks": ["리스크1", "리스크2", "리스크3"],
  "opportunities": ["기회1", "기회2", "기회3"]
}
\`\`\``;
}
