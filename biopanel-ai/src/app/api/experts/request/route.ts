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

    const data = await req.json();

    if (!data.expertId || !data.subject || !data.message) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const requestRef = adminDb.collection('consultRequests').doc();

    await requestRef.set({
      id: requestRef.id,
      userId: decoded.uid,
      userName: decoded.name || '',
      userEmail: decoded.email || '',
      ...data,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update user consult request count
    await adminDb.doc(`users/${decoded.uid}`).update({
      consultRequestCount: FieldValue.increment(1),
    });

    return NextResponse.json({ requestId: requestRef.id });
  } catch (error: any) {
    console.error('Consult request error:', error);
    return NextResponse.json({ error: '상담 요청에 실패했습니다.' }, { status: 500 });
  }
}
