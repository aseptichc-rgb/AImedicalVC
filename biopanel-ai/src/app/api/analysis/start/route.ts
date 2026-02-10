import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await adminAuth.verifyIdToken(token);

    // Rate limiting
    const userRef = adminDb.doc(`users/${decoded.uid}`);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    if (userData && userData.dailyUsage >= 10) {
      return NextResponse.json({ error: '일일 분석 한도 초과 (10회/일)' }, { status: 429 });
    }

    const { company } = await req.json();

    if (!company?.name || !company?.sector) {
      return NextResponse.json({ error: '기업명과 섹터는 필수입니다.' }, { status: 400 });
    }

    // Create analysis session
    const sessionRef = adminDb.collection('analyses').doc();
    const sessionId = sessionRef.id;

    await sessionRef.set({
      id: sessionId,
      userId: decoded.uid,
      company,
      status: 'enriching',
      currentPhase: '데이터 수집 준비 중...',
      progress: 0,
      createdAt: FieldValue.serverTimestamp(),
      totalTokensUsed: 0,
      estimatedCost: 0,
    });

    // Update user usage
    await userRef.update({
      dailyUsage: FieldValue.increment(1),
      analysisCount: FieldValue.increment(1),
      lastActiveAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ sessionId });
  } catch (error: any) {
    console.error('Analysis start error:', error);
    return NextResponse.json({ error: error.message || '분석 시작에 실패했습니다.' }, { status: 500 });
  }
}
