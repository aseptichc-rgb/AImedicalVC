import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      analysisCount: 0,
      dailyUsage: 0,
      consultRequestCount: 0,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, { lastActiveAt: serverTimestamp() }, { merge: true });
  }

  return user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
