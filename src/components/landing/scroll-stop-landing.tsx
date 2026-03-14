'use client';

/**
 * Scroll-Stop Landing Page
 *
 * Renders the self-contained scroll-stop HTML page as the home page.
 * Uses an iframe to preserve the standalone page's own styles, scripts
 * (Three.js, canvas frame animation, confetti, starscape) without
 * conflicting with the Next.js layout or global CSS.
 */
export function ScrollStopLanding() {
  return (
    <iframe
      src="/scroll-stop/index.html"
      title="88away — AI-Powered Romantasy Ghostwriting"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        zIndex: 9999,
      }}
      allowFullScreen
    />
  );
}
