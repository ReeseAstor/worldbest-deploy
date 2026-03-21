import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      redirect('/');
    }
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/');
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
