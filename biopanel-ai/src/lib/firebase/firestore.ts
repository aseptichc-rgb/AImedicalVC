import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { AnalysisDoc } from '@/types/analysis';
import { ExpertDoc } from '@/types/expert';

// Analysis helpers
export async function createAnalysisSession(data: Partial<AnalysisDoc>) {
  const ref = doc(collection(db, 'analyses'));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    totalTokensUsed: 0,
    estimatedCost: 0,
  });
  return ref.id;
}

export async function getUserAnalyses(userId: string) {
  const q = query(
    collection(db, 'analyses'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnalysisDoc));
}

export function subscribeToAnalysis(sessionId: string, callback: (data: AnalysisDoc) => void) {
  return onSnapshot(doc(db, 'analyses', sessionId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as AnalysisDoc);
    }
  });
}

export function subscribeToMessages(sessionId: string, callback: (messages: any[]) => void) {
  const q = query(
    collection(db, `analyses/${sessionId}/messages`),
    orderBy('order', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToConflicts(sessionId: string, callback: (conflicts: any[]) => void) {
  return onSnapshot(collection(db, `analyses/${sessionId}/conflicts`), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Expert helpers
export async function getExperts(specialty?: string) {
  let q;
  if (specialty) {
    q = query(
      collection(db, 'experts'),
      where('isActive', '==', true),
      where('specialty', '==', specialty)
    );
  } else {
    q = query(collection(db, 'experts'), where('isActive', '==', true));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExpertDoc));
}

export async function getExpert(expertId: string) {
  const snap = await getDoc(doc(db, 'experts', expertId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ExpertDoc;
}

export async function createConsultRequest(data: any) {
  const ref = await addDoc(collection(db, 'consultRequests'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function convertTimestamp(timestamp: any): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}
