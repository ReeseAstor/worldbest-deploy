import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LandingPage } from '@/components/landing/landing-page';

export default async function HomePage() {
  // Check if user is authenticated using Supabase
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // If authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  // Otherwise show landing page
  return <LandingPage />;
}