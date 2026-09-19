import { Component, Suspense, lazy, type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Recycle, Rotate3D, Sparkles, Sliders } from 'lucide-react';
import { Button } from '../ui/Button';
import { useScrollProgress } from '../../hooks/useScrollProgress';

const HeroScene = lazy(() => import('../HeroScene'));

/** The 3D layer is pure enhancement — any failure renders nothing. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const scrollProgress = useScrollProgress();
  const [manualProgress, setManualProgress] = useState<number | null>(null);

  // Use manual slider override if user plays with it, otherwise follow scroll position
  const activeProgress = manualProgress !== null ? manualProgress : scrollProgress;

  const stageLabel =
    activeProgress < 0.25
      ? 'Raw Post-Consumer Waste (Crumpled Can & Foil)'
      : activeProgress < 0.55
      ? 'Decontamination & Mechanical Sorting'
      : activeProgress < 0.85
      ? 'Flaking & Thermal Smelting'
      : 'Purified Recycled Secondary Stock (100% Circular)';

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36" aria-labelledby="hero-heading">
      {/* backdrop: engineering grid + emerald horizon */}
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-accent-soft to-transparent"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-[-320px] h-[640px] w-[880px] -translate-x-1/2 rounded-full bg-accent-soft blur-[140px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pl-1 pr-3 text-xs text-ink-soft backdrop-blur"
          >
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-void flex items-center gap-1">
              <Recycle size={10} className="animate-spin" style={{ animationDuration: '4s' }} />
              CIRCULAR 3D
            </span>
            <span className="tabular">
              Scroll or drag to see materials recycle in real-time
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="mt-6 font-display text-[clamp(2.5rem,6.2vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.03em]"
          >
            <span className="block text-ink">WASTE ISN'T WASTE.</span>
            <span className="text-shine block">IT'S INVENTORY.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft"
          >
            Turn discarded cans, crushed PET bottles, and polymer packaging into verified industrial commodity stock.
            SmartSort powers transparent spot trading, on-demand logistics, and digital custody.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button size="lg" onClick={() => (window.location.hash = '#/create-listing')} icon={<ArrowRight size={16} />}>
              List Your Waste
            </Button>
            <Button size="lg" variant="outline" onClick={() => (window.location.hash = '#/marketplace')}>
              Explore Marketplace
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6"
          >
            {[
              ['Settlement', 'T+2 days'],
              ['Buyers', 'Verified only'],
              ['Pricing', 'Live index'],
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">{term}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* 3D Interactive Floating Garbage & Recycler Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="relative mx-auto w-full max-w-[540px]"
        >
          <div className="absolute inset-x-8 bottom-6 h-28 rounded-full bg-accent-soft blur-2xl" aria-hidden />

          {/* Card Frame containing the WebGL Canvas */}
          <div className="relative h-[440px] w-full sm:h-[500px] rounded-2xl border border-line bg-surface/40 p-1 backdrop-blur overflow-hidden shadow-2xl">
            {/* Top Bar Indicators */}
            <div className="absolute top-3 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-void/80 px-2.5 py-1 text-[11px] font-mono text-ink-soft backdrop-blur">
                <Rotate3D size={12} className="text-accent" />
                Hover & Drag to rotate
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-void/80 px-2.5 py-1 text-[11px] font-mono text-accent backdrop-blur">
                <Sparkles size={11} />
                {Math.round(activeProgress * 100)}% Recycled
              </span>
            </div>

            {/* 3D WebGL Canvas */}
            <SceneBoundary>
              <Suspense
                fallback={
                  <div className="grid h-full place-items-center font-mono text-xs text-ink-faint">
                    Loading 3D Garbage Simulation...
                  </div>
                }
              >
                <HeroScene recycleProgress={activeProgress} />
              </Suspense>
            </SceneBoundary>

            {/* Bottom Floating Interactive Transformation HUD */}
            <div className="absolute bottom-3 inset-x-3 rounded-xl border border-line bg-surface/90 p-3 backdrop-blur shadow-lg z-10">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-ink truncate">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      activeProgress > 0.7 ? 'bg-accent animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="truncate">{stageLabel}</span>
                </div>
                <button
                  onClick={() => setManualProgress(manualProgress === null ? 0.75 : null)}
                  className="shrink-0 text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  title="Toggle manual slider vs scroll tracker"
                >
                  <Sliders size={11} />
                  {manualProgress !== null ? 'Follow scroll' : 'Scrub'}
                </button>
              </div>

              {/* Progress Bar / Interactive Scrubber */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-ink-faint uppercase">Crushed Can</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={activeProgress}
                  onChange={(e) => setManualProgress(parseFloat(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent focus:outline-none"
                  aria-label="Recycle transformation scrubber"
                />
                <span className="font-mono text-[10px] text-accent uppercase">Pure Ingot</span>
              </div>

              <div className="mt-1.5 flex justify-between text-[10px] text-ink-faint font-mono">
                <span>↓ Scroll down to recycle</span>
                <span>Al / PET / Polymer Matrix</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
