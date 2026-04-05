import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/components/landing/landing-page';
import { LandingPageJsonLd } from '@/components/seo/json-ld';

export const revalidate = 3600; // Revalidate landing page every hour

export default async function HomePage() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      redirect('/dashboard');
    }
  } catch (error) {
    // Auth check failed - show landing page
  }

  return (
    <>
      <LandingPageJsonLd />
      <LandingPage />
    </>
  );
}
