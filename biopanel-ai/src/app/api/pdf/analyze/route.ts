import { NextRequest, NextResponse } from 'next/server';
import { analyzePDFForInvestment, extractPDFContent } from '@/lib/utils/gemini';

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, companyName, sector, extractOnly } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: 'PDF 데이터가 필요합니다.' }, { status: 400 });
    }

    if (extractOnly) {
      const content = await extractPDFContent(pdfBase64);
      return NextResponse.json({ content });
    }

    if (!companyName || !sector) {
      return NextResponse.json({ error: '기업명과 섹터가 필요합니다.' }, { status: 400 });
    }

    const analysis = await analyzePDFForInvestment(pdfBase64, companyName, sector);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('PDF analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'PDF 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};
