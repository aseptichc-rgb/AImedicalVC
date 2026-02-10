'use client';
import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { signInWithGoogle, signOut } from '@/lib/firebase/auth';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  return {
    user,
    loading,
    login: signInWithGoogle,
    logout: signOut,
  };
}
