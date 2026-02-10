'use client';
import { useState, useEffect } from 'react';
import { getExperts, getExpert } from '@/lib/firebase/firestore';
import { ExpertDoc, ExpertSpecialty } from '@/types/expert';

export function useExperts(specialty?: ExpertSpecialty) {
  const [experts, setExperts] = useState<ExpertDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getExperts(specialty);
        setExperts(data);
      } catch (error) {
        console.error('Failed to fetch experts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [specialty]);

  return { experts, loading };
}

export function useExpert(expertId: string) {
  const [expert, setExpert] = useState<ExpertDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getExpert(expertId);
        setExpert(data);
      } catch (error) {
        console.error('Failed to fetch expert:', error);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [expertId]);

  return { expert, loading };
}
