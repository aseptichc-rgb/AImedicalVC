import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');

    let query: any = adminDb.collection('experts').where('isActive', '==', true);

    if (specialty && specialty !== 'all') {
      query = query.where('specialty', '==', specialty);
    }

    const snap = await query.get();
    const experts = snap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ experts });
  } catch (error: any) {
    console.error('Expert list error:', error);
    return NextResponse.json({ error: '전문가 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}
