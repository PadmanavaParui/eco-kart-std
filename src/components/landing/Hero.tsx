import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Recycle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useHeroRecycleScroll } from '../../hooks/useScrollProgress';

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { recycleProgress, isRecycleComplete } = useHeroRecycleScroll();

  const stageLabel =
    recycleProgress < 0.25
      ? 'Raw Post-Consumer Waste (Crumpled Can)'
      : recycleProgress < 0.55
      ? 'Decontamination & Mechanical Sorting'
      : recycleProgress < 0.85
      ? 'Flaking & Thermal Smelting'
      : 'Purified Recycled Secondary Stock (100% Circular)';

  return (
    <section
      id="hero-scroll-track"
      className="relative h-[250vh]"
      aria-labelledby="hero-heading"
    >
      {/* Sticky viewport frame: Locks Hero in place until recycling completes */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
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

        <div className="relative mx-auto grid max-w-6xl w-full items-center gap-8 lg:gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] pt-20 sm:pt-24 pb-6">
          {/* Left Column: Heading, Value Prop, CTAs, Metrics */}
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
                {isRecycleComplete ? 'Material 100% Recycled' : 'Scroll down to watch material recycle in real-time'}
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
              className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-5"
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

          {/* Right Column: Airspace for 3D can + Status Box positioned below with clear clearance */}
          <div className="relative flex flex-col justify-end h-[540px] sm:h-[600px] lg:h-[650px] pointer-events-none pb-0 lg:translate-y-14">
            {/* Ambient emerald backlight behind the 3D can */}
            <div className="absolute inset-x-4 top-20 h-52 rounded-full bg-accent-soft blur-3xl opacity-45" aria-hidden />

            {/* Clear airspace in the upper area so the floating 3D can is completely unobscured */}
            <div className="flex-1 w-full min-h-[340px]" aria-hidden />

            {/* Recycling Status Box - Shifted down below at the lower part of the can */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="relative z-20 mt-auto w-full max-w-md ml-auto rounded-2xl border border-line bg-surface-2/95 p-4 backdrop-blur-md shadow-2xl ring-1 ring-white/10 pointer-events-auto"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-3 w-3 rounded-full shrink-0 transition-colors duration-300 ${
                      isRecycleComplete
                        ? 'bg-accent shadow-[0_0_12px_#34e27a] animate-pulse'
                        : recycleProgress > 0.4
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-medium text-ink text-[13px] truncate">
                    {stageLabel}
                  </span>
                </div>
                <span className="shrink-0 flex items-center gap-1 font-mono text-[11px] font-semibold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/25">
                  {isRecycleComplete ? <CheckCircle2 size={12} /> : <Sparkles size={11} />}
                  {Math.round(recycleProgress * 100)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="mt-3 w-full bg-surface-3 h-2 rounded-full overflow-hidden p-0.5 border border-line">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-accent to-emerald-400 h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(52,226,122,0.45)]"
                  style={{ width: `${Math.max(4, Math.round(recycleProgress * 100))}%` }}
                />
              </div>

              {/* Instructional Context Footer */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                {isRecycleComplete ? (
                  <span className="text-accent flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={12} />
                    Ready — Scroll down to explore live market
                  </span>
                ) : (
                  <span className="text-ink-soft flex items-center gap-1">
                    <span className="animate-bounce">↓</span>
                    Scroll down to recycle ({Math.round(recycleProgress * 100)}% complete)
                  </span>
                )}
                <span className="text-ink-faint">Alloy 99.4% Circular</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
