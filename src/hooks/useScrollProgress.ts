import { useEffect, useState } from 'react';

export interface HeroScrollState {
  recycleProgress: number; // 0 to 1 while in Hero pinned track
  isRecycleComplete: boolean; // true once 100% recycled
  containerOpacity: number; // 1 while in hero, fades to 0 as user scrolls below
  scrollYOffset: number; // translation offset when scrolling past hero
}

/**
 * Pinned hero scroll controller:
 * Locks progress in the Hero section so the user can see the entire can recycle (0% to 100%)
 * BEFORE the page is allowed to scroll down to the Live Marketplace and subsequent sections.
 */
export function useHeroRecycleScroll(): HeroScrollState {
  const [state, setState] = useState<HeroScrollState>({
    recycleProgress: 0,
    isRecycleComplete: false,
    containerOpacity: 1,
    scrollYOffset: 0,
  });

  useEffect(() => {
    let animFrameId: number;
    let targetProgress = 0;
    let currentProgress = 0;
    let targetOpacity = 1;
    let currentOpacity = 1;
    let targetOffset = 0;
    let currentOffset = 0;

    const updateScrollTargets = () => {
      const scrollY = window.scrollY;
      const heroTrack = document.getElementById('hero-scroll-track');
      const trackHeight = heroTrack ? heroTrack.offsetHeight : window.innerHeight * 2.6;
      // Generous pinned track distance for smooth, silky, un-rushed scroll animation
      const pinnedDistance = Math.max(500, trackHeight - window.innerHeight);

      targetProgress = Math.min(1, Math.max(0, scrollY / pinnedDistance));

      if (scrollY > pinnedDistance) {
        const pastPinned = scrollY - pinnedDistance;
        targetOpacity = Math.max(0, 1 - pastPinned / 320);
        targetOffset = -pastPinned * 0.85;
      } else {
        targetOpacity = 1;
        targetOffset = 0;
      }
    };

    const loop = () => {
      // Smooth lerp for buttery transitions
      const lerpFactor = 0.09;
      currentProgress += (targetProgress - currentProgress) * lerpFactor;
      currentOpacity += (targetOpacity - currentOpacity) * lerpFactor;
      currentOffset += (targetOffset - currentOffset) * lerpFactor;

      // Snap if very close
      if (Math.abs(targetProgress - currentProgress) < 0.001) {
        currentProgress = targetProgress;
      }

      setState({
        recycleProgress: currentProgress,
        isRecycleComplete: targetProgress >= 1,
        containerOpacity: currentOpacity,
        scrollYOffset: currentOffset,
      });

      animFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', updateScrollTargets, { passive: true });
    window.addEventListener('resize', updateScrollTargets, { passive: true });
    updateScrollTargets();
    loop();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('scroll', updateScrollTargets);
      window.removeEventListener('resize', updateScrollTargets);
    };
  }, []);

  return state;
}

export function useScrollProgress() {
  const { recycleProgress } = useHeroRecycleScroll();
  return recycleProgress;
}

