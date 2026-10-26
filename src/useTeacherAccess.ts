import { useEffect, useState } from 'react';
import { readSession, supabase } from './supabase';
import { canUseTeacherMode } from './teacherAccess';

export function useTeacherAccess(): boolean {
  const [allowed, setAllowed] = useState(() => canUseTeacherMode(readSession()?.user));
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAllowed(canUseTeacherMode(session?.user));
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return allowed;
}
