import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
