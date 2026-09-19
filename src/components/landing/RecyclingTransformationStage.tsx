import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Rotate3D, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

/**
 * Procedural Realistic 3D Aluminum Can:
 * Crushed/dented beverage can with realistic pull-tab, top rim, and deformed creases.
 * As recycleProgress goes 0 -> 1:
 * - Dents un-crease and expand smoothly
 * - Scratched discarded beverage texture polishes into a mirror-finish ultra-pure recycled aluminum cylinder/ingot
 * - Emits glowing green laser sorting & induction melting rings
 */
export function MorphingSodaCan({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0.2, 0.4, -0.2] as [number, number, number],
  scale = 1.3,
  recycleProgress = 0,
  interactive = true,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  recycleProgress: number;
  interactive?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { originalPos, canMat } = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.55, 0.55, 1.45, 36, 32, false);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const pos = posAttr.clone();
    const mat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      metalness: 0.82,
      roughness: 0.38,
    });
    return { originalPos: pos, canMat: mat };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Floating drift + interactive spin
    groupRef.current.position.y = position[1] + Math.sin(t * 1.1) * 0.08;
    groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.7) * 0.08;
    groupRef.current.rotation.y += hovered ? 0.035 : 0.01;
    groupRef.current.rotation.z = rotation[2] + Math.cos(t * 0.8) * 0.06;

    if (meshRef.current) {
      const geo = meshRef.current.geometry;
      const pos = geo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (pos) {
        const count = pos.count;
        // As recycleProgress increases, dents vanish!
        const dentAmt = (1 - recycleProgress) * 0.28;

        for (let i = 0; i < count; i++) {
          const ox = originalPos.getX(i);
          const oy = originalPos.getY(i);
          const oz = originalPos.getZ(i);

          // Realistic asymmetric lateral stomp / buckle crease in middle of can
          const buckle = Math.sin(oy * 5.5 + ox * 4.2) * Math.cos(oz * 4.8) * dentAmt;
          const waistPinch = Math.exp(-Math.abs(oy) * 3.2) * (1 - recycleProgress) * 0.18;

          pos.setXYZ(
            i,
            ox * (1 - waistPinch) + ox * buckle,
            oy * (1 - dentAmt * 0.12),
            oz * (1 - waistPinch) + oz * buckle
          );
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      }

      // Material transition: Discarded red beverage can -> Recycled pure aluminum / eco-emerald sheen
      const p = recycleProgress;
      canMat.color.setRGB(
        THREE.MathUtils.lerp(0.9, 0.2, p),
        THREE.MathUtils.lerp(0.24, 0.88, p),
        THREE.MathUtils.lerp(0.26, 0.5, p)
      );
      canMat.metalness = THREE.MathUtils.lerp(0.72, 0.98, p);
      canMat.roughness = THREE.MathUtils.lerp(0.48, 0.12, p);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale * (hovered ? 1.08 : 1)}
      onPointerOver={() => interactive && setHovered(true)}
      onPointerOut={() => interactive && setHovered(false)}
    >
      <mesh ref={meshRef} material={canMat}>
        <cylinderGeometry args={[0.55, 0.55, 1.45, 36, 32, false]} />
      </mesh>

      {/* Top Rim */}
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.48, 0.53, 0.05, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
      </mesh>
      {/* Pull Tab */}
      <mesh position={[0.1, 0.77, 0]} rotation={[-0.2, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Induction / Laser Sorting Ring (Appears when recycling) */}
      {recycleProgress > 0.3 && (
        <mesh position={[0, Math.sin(Date.now() * 0.003) * 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.78, 32]} />
          <meshBasicMaterial
            color="#34e27a"
            transparent
            opacity={(recycleProgress - 0.3) * 0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Procedural Crinkled Foil Packet / Chips Bag
 */
export function MorphingPacket({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0.3, -0.4, 0.2] as [number, number, number],
  scale = 1.0,
  recycleProgress = 0,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  recycleProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { originalPos, packetMat } = useMemo(() => {
    const geo = new THREE.BoxGeometry(1.1, 1.4, 0.14, 24, 28, 4);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const pos = posAttr.clone();
    const mat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      metalness: 0.85,
      roughness: 0.34,
    });
    return { originalPos: pos, packetMat: mat };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.position.y = position[1] + Math.cos(t * 1.05) * 0.08;
    groupRef.current.rotation.y += hovered ? 0.03 : 0.01;
    groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.7) * 0.06;

    if (meshRef.current) {
      const geo = meshRef.current.geometry;
      const pos = geo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (pos) {
        const crinkleIntensity = (1 - recycleProgress) * 0.18;

        for (let i = 0; i < pos.count; i++) {
          const ox = originalPos.getX(i);
          const oy = originalPos.getY(i);
          const oz = originalPos.getZ(i);

          const crinkle =
            Math.sin(ox * 13.0 + oy * 8.5) * Math.cos(oy * 11.5) * crinkleIntensity;

          pos.setXYZ(
            i,
            ox * (1 + recycleProgress * 0.08),
            oy,
            oz * (1 - recycleProgress * 0.5) + crinkle
          );
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      }

      const p = recycleProgress;
      packetMat.color.setRGB(
        THREE.MathUtils.lerp(0.92, 0.2, p),
        THREE.MathUtils.lerp(0.7, 0.85, p),
        THREE.MathUtils.lerp(0.15, 0.65, p)
      );
      packetMat.roughness = THREE.MathUtils.lerp(0.4, 0.12, p);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale * (hovered ? 1.08 : 1)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={meshRef} material={packetMat}>
        <boxGeometry args={[1.1, 1.4, 0.14, 24, 28, 4]} />
      </mesh>
      {/* Top & Bottom Seal Ridges */}
      <mesh position={[0, 0.71, 0]}>
        <boxGeometry args={[1.15, 0.06, 0.03]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.71, 0]}>
        <boxGeometry args={[1.15, 0.06, 0.03]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Swirling recycling particles
 */
function RecyclingVortex({ progress }: { progress: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const emerald = new THREE.Color('#34e27a');
    const gold = new THREE.Color('#fbbf24');
    const sky = new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const radius = 1.2 + Math.random() * 2.0;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.2;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const c = i % 3 === 0 ? emerald : i % 3 === 1 ? sky : gold;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime() * (1 + progress * 2.0);
    pointsRef.current.rotation.y = t * 0.25;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.3 + progress * 0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ParallaxContainer({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y += (pointer.x * 0.4 - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-pointer.y * 0.2 - group.current.rotation.x) * 0.05;
  });

  return <group ref={group}>{children}</group>;
}

/**
 * Dedicated Multi-Stage Recycling Transformation Journey Component
 * Places a prominent, full-fidelity 3D inspection & scroll transformation
 * stage right within the product flow.
 */
export function RecyclingTransformationStage() {
  const [scroll01, setScroll01] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<'can' | 'packet'>('can');
  const [manualScrub, setManualScrub] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the container has scrolled through the viewport
      const totalDist = windowHeight + rect.height;
      const scrolledDist = windowHeight - rect.top;
      const raw = scrolledDist / totalDist;
      setScroll01(Math.min(1, Math.max(0, raw)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeProgress = manualScrub !== null ? manualScrub : scroll01;

  interface StageItem {
    min: number;
    max: number;
    name: string;
    status: string;
    color: string;
    desc: string;
  }

  const stageData: StageItem[] = [
    {
      min: 0,
      max: 0.25,
      name: 'Stage 1: Discarded Post-Consumer Waste',
      status: 'Crushed & Deformed',
      color: 'text-rose-400',
      desc: 'Discarded aluminum cans and polymer packaging are collected with deep dents, surface contamination, and structural creases.',
    },
    {
      min: 0.25,
      max: 0.55,
      name: 'Stage 2: Optical Laser Sorting & Cleaning',
      status: 'Decontamination & Un-crimping',
      color: 'text-amber-400',
      desc: 'High-speed near-infrared spectrometry separates alloy types, removes exterior lacquers, and pre-conditions the material.',
    },
    {
      min: 0.55,
      max: 0.85,
      name: 'Stage 3: Thermal Smelting & Ingot Cast',
      status: 'Induction Melting',
      color: 'text-emerald-400',
      desc: 'Induction coils heat the metal to 660°C, burning away impurities and restoring pristine molecular ductility.',
    },
    {
      min: 0.85,
      max: 1.0,
      name: 'Stage 4: 100% Circular Secondary Stock',
      status: 'Certified Commodity Ingot',
      color: 'text-accent',
      desc: 'The crumpled trash is fully reborn into mirror-finish, exchange-certified secondary aluminum with 95% less CO₂ footprint.',
    },
  ];

  const fallbackStage: StageItem = {
    min: 0,
    max: 0.25,
    name: 'Stage 1: Discarded Post-Consumer Waste',
    status: 'Crushed & Deformed',
    color: 'text-rose-400',
    desc: 'Discarded aluminum cans and polymer packaging are collected with deep dents, surface contamination, and structural creases.',
  };

  const foundStage = stageData.find((s) => activeProgress >= s.min && activeProgress <= s.max);
  const currentStage: StageItem = foundStage || fallbackStage;

  return (
    <section
      ref={containerRef}
      className="relative my-16 border-y border-line bg-surface/40 py-16 sm:py-24 overflow-hidden"
      aria-labelledby="recycling-stage-heading"
    >
      <div className="bg-grid absolute inset-0 opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-accent-soft blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
            Scroll-Driven 3D Recycling Lab
          </p>
          <h2
            id="recycling-stage-heading"
            className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-4xl text-ink"
          >
            Watch the Can Recycle as You Scroll
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-soft">
            See the direct physical transformation from raw, crumpled roadside waste into certified secondary industrial commodity stock in interactive real-time 3D.
          </p>
        </div>

        {/* 3D Simulation Showcase Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr] items-center">
          {/* Left: 3D Interactive Stage */}
          <div className="relative h-[440px] sm:h-[500px] w-full rounded-2xl border border-line bg-void/80 backdrop-blur shadow-2xl overflow-hidden">
            {/* Top Control Tabs */}
            <div className="absolute top-4 inset-x-4 z-10 flex items-center justify-between pointer-events-auto">
              <div className="flex gap-1.5 rounded-lg border border-line bg-surface/90 p-1 backdrop-blur">
                <button
                  onClick={() => setSelectedItem('can')}
                  className={`rounded-md px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                    selectedItem === 'can'
                      ? 'bg-accent font-semibold text-void'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Aluminum Can
                </button>
                <button
                  onClick={() => setSelectedItem('packet')}
                  className={`rounded-md px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                    selectedItem === 'packet'
                      ? 'bg-accent font-semibold text-void'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Chips / Snack Foil Packet
                </button>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1 font-mono text-xs text-accent backdrop-blur">
                <Sparkles size={13} />
                {Math.round(activeProgress * 100)}% Re-manufactured
              </span>
            </div>

            {/* Three.js Canvas */}
            <Suspense
              fallback={
                <div className="grid h-full place-items-center font-mono text-xs text-ink-faint">
                  Initializing 3D Recycler Shaders...
                </div>
              }
            >
              <Canvas
                camera={{ position: [0, 0, 4.8], fov: 42 }}
                dpr={[1, 1.75]}
                gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
                onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
              >
                <ambientLight intensity={0.8} />
                <directionalLight position={[4, 6, 4]} intensity={1.8} color="#f0fdf4" />
                <directionalLight position={[-5, -2, -3]} intensity={0.9} color="#34e27a" />
                <pointLight position={[0, -2, 2]} intensity={0.8} color="#22c55e" />

                <ParallaxContainer>
                  {selectedItem === 'can' ? (
                    <MorphingSodaCan
                      position={[0, 0, 0]}
                      scale={1.5}
                      recycleProgress={activeProgress}
                    />
                  ) : (
                    <MorphingPacket
                      position={[0, 0, 0]}
                      scale={1.3}
                      recycleProgress={activeProgress}
                    />
                  )}
                  <RecyclingVortex progress={activeProgress} />
                </ParallaxContainer>
              </Canvas>
            </Suspense>

            {/* Rotate prompt badge */}
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-line bg-void/80 px-2.5 py-1 text-[11px] font-mono text-ink-soft backdrop-blur">
              <Rotate3D size={12} className="text-accent" />
              Hover & Drag to rotate item in 3D
            </div>
          </div>

          {/* Right: Live Interactive Lifecycle HUD */}
          <div className="rounded-2xl border border-line bg-surface/80 p-6 backdrop-blur space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">Active Phase</p>
                <h3 className={`mt-1 font-display text-lg font-bold ${currentStage.color}`}>
                  {currentStage.name}
                </h3>
              </div>
              <span className="font-mono text-xs font-medium rounded-full bg-accent-soft px-2.5 py-1 text-accent border border-accent-line">
                {currentStage.status}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-ink-soft">{currentStage.desc}</p>

            {/* Interactive Transformation Scrubber */}
            <div className="rounded-xl border border-line bg-surface-2 p-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-soft">Recycling Progress</span>
                <span className="text-accent font-semibold">{Math.round(activeProgress * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeProgress}
                onChange={(e) => setManualScrub(parseFloat(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent focus:outline-none"
                aria-label="Recycling progress scrubber"
              />
              <div className="mt-2 flex justify-between text-[11px] font-mono text-ink-faint">
                <span>0% (Crumpled Trash)</span>
                <button
                  onClick={() => setManualScrub(manualScrub !== null ? null : 0.8)}
                  className="text-accent hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sliders size={11} />
                  {manualScrub !== null ? 'Reset to Scroll' : 'Scrub manually'}
                </button>
                <span>100% (Pure Ingot)</span>
              </div>
            </div>

            {/* Environmental & Market Abatement Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-line bg-surface p-3">
                <p className="font-mono text-[10.5px] uppercase text-ink-faint">CO₂ Abated</p>
                <p className="mt-1 text-lg font-bold font-mono text-ink">
                  {(activeProgress * 9.2).toFixed(1)} kg / kg
                </p>
              </div>
              <div className="rounded-lg border border-line bg-surface p-3">
                <p className="font-mono text-[10.5px] uppercase text-ink-faint">Market Value</p>
                <p className="mt-1 text-lg font-bold font-mono text-accent">
                  ₹{Math.round(18 + activeProgress * 142)} / kg
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-ink-soft font-mono pt-2">
              <CheckCircle2 size={14} className="text-accent shrink-0" />
              <span>Scroll down this page to see the 3D can continuously recycle!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
