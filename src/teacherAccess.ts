// Controls the lesson UI only. Supabase/RLS remain responsible for database access.
const learnerEmail = 'ddarya.rr@gmail.com';
export function canUseTeacherMode(user: { email?: string | null } | null | undefined): boolean {
  return user?.email?.trim().toLowerCase() !== learnerEmail;
}
