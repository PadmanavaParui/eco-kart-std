import { useEffect, useState } from 'react';

/**
 * Tracks normalized scroll progress of the window (0 at top, 1 at bottom of page)
 * or relative to a specific element.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // We measure how far we have scrolled in the upper 1200px where the hero & live market live
          // so the user sees the recycling effect smoothly as they scroll down
          const maxTarget = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1000);
          const rawProgress = scrollY / Math.min(maxTarget, 900);
          setProgress(Math.min(1, Math.max(0, rawProgress)));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}
