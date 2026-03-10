<<<<<<< Local
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated using Supabase
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/');
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
=======
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is now handled by middleware.ts (Supabase session check)
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
>>>>>>> Remote
}