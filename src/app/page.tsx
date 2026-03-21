import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/components/landing/landing-page';
import { LandingPageJsonLd } from '@/components/seo/json-ld';

export const dynamic = 'force-dynamic';

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

  return (
    <>
      <LandingPageJsonLd />
      <LandingPage />
    </>
  );
}