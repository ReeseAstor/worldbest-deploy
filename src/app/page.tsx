import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LandingPage } from '@/components/landing/landing-page';

export default async function HomePage() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      redirect('/dashboard');
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
  
  return <LandingPage />;
}