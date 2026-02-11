import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
console.log('[Gemini] API Key configured:', apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT SET');

const genAI = new GoogleGenerativeAI(apiKey);

export async function callGemini(systemPrompt: string, userMessage: string) {
  console.log('[Gemini] Calling API...');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();

    console.log('[Gemini] Response received, length:', text.length);

    return {
      content: text,
      usage: {
        input_tokens: response.usageMetadata?.promptTokenCount || 0,
        output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  } catch (error: any) {
    console.error('[Gemini] API Error:', error.message);
    console.error('[Gemini] Full error:', error);
    throw error;
  }
}

export async function callGeminiWithPDF(
  systemPrompt: string,
  userMessage: string,
  pdfBase64: string,
  mimeType: string = 'application/pdf'
) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: pdfBase64,
      },
    },
    { text: userMessage },
  ]);

  const response = result.response;
  const text = response.text();

  return {
    content: text,
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount || 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

export async function extractPDFContent(pdfBase64: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64,
      },
    },
    {
      text: `이 PDF 문서의 내용을 분석하고 다음 정보를 추출해주세요:

1. 회사 개요 (회사명, 설립일, 대표자, 주요 사업 분야)
2. 사업 현황 및 전략
3. 재무 정보 (매출, 영업이익, 순이익 등)
4. 파이프라인 현황 (바이오/제약 회사인 경우)
5. 임상시험 현황
6. 경쟁사 분석
7. 리스크 요인
8. 투자 포인트 및 성장 전망

가능한 한 상세하게 정보를 추출하고, 수치 데이터는 정확하게 기재해주세요.
원문에 없는 정보는 "정보 없음"으로 표시해주세요.`
    },
  ]);

  return result.response.text();
}

export async function analyzePDFForInvestment(
  pdfBase64: string,
  companyName: string,
  sector: string
): Promise<{
  summary: string;
  keyMetrics: Record<string, any>;
  risks: string[];
  opportunities: string[];
  recommendation: string;
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `당신은 바이오/헬스케어 분야 전문 투자 분석가입니다.
IR 자료를 분석하여 투자 관점에서 핵심 정보를 추출하고 평가합니다.`,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64,
      },
    },
    {
      text: `이 IR 자료는 ${companyName} (${sector} 섹터)의 자료입니다.

투자 분석 관점에서 다음 형식으로 분석해주세요:

\`\`\`json
{
  "summary": "3-5문장의 핵심 요약",
  "keyMetrics": {
    "revenue": "매출액",
    "operatingProfit": "영업이익",
    "netIncome": "순이익",
    "pipelineCount": "파이프라인 수",
    "clinicalStage": "임상 단계 현황",
    "marketCap": "시가총액",
    "cashPosition": "현금 보유량"
  },
  "risks": ["리스크1", "리스크2", "리스크3"],
  "opportunities": ["기회1", "기회2", "기회3"],
  "recommendation": "투자 의견 및 근거"
}
\`\`\`

반드시 위 JSON 형식으로 응답해주세요.`
    },
  ]);

  const text = result.response.text();

  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch {
    return {
      summary: text,
      keyMetrics: {},
      risks: [],
      opportunities: [],
      recommendation: '분석 결과를 파싱할 수 없습니다.',
    };
  }
}
