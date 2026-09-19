import { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Eye, RotateCw, Sparkles, Layers, ShieldCheck, Flame, Scale, Zap } from 'lucide-react';
import type { Material } from '../types';
import { formatPricePerKg } from '../lib/format';
import { MATERIAL_SPECS } from '../types';

interface MaterialVisualProps {
  material: Material;
  wireframe: boolean;
  autoRotate: boolean;
}

function SpecimenMesh({ material, wireframe, autoRotate }: MaterialVisualProps) {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Subtle floating particles
  const particleCount = 48;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      if (autoRotate) {
        meshRef.current.rotation.y = t * 0.45;
        meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
      }
      meshRef.current.position.y = Math.sin(t * 1.2) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.3;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group>
      {/* Holographic orbital energy ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -0.9, 0]}>
        <ringGeometry args={[1.5, 1.55, 64]} />
        <meshBasicMaterial color="#34e27a" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Orbiting particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#34e27a" transparent opacity={0.6} />
      </points>

      {/* Main specimen model */}
      <group ref={meshRef}>
        {material === 'plastic' && (
          <group>
            {/* Compressed high-density PET/HDPE bale */}
            <mesh>
              <boxGeometry args={[1.3, 1.0, 1.1]} />
              <meshPhysicalMaterial
                color="#34e27a"
                roughness={wireframe ? 0.9 : 0.18}
                metalness={0.1}
                transmission={wireframe ? 0 : 0.6}
                thickness={1.2}
                wireframe={wireframe}
                emissive="#0d3f22"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Strapping bands */}
            {!wireframe && (
              <>
                <mesh position={[0, 0.28, 0]}>
                  <boxGeometry args={[1.32, 0.04, 1.12]} />
                  <meshStandardMaterial color="#1a1d1c" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.28, 0]}>
                  <boxGeometry args={[1.32, 0.04, 1.12]} />
                  <meshStandardMaterial color="#1a1d1c" metalness={0.8} roughness={0.3} />
                </mesh>
              </>
            )}
          </group>
        )}

        {material === 'metal' && (
          <group>
            {/* Industrial extruded Aluminium / Copper ingot */}
            <mesh>
              <cylinderGeometry args={[0.62, 0.78, 1.35, 6]} />
              <meshStandardMaterial
                color="#d0d7de"
                metalness={0.92}
                roughness={wireframe ? 0.8 : 0.2}
                wireframe={wireframe}
              />
            </mesh>
            {!wireframe && (
              <mesh position={[0, 0, 0.52]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.08, 0.7, 0.02]} />
                <meshBasicMaterial color="#34e27a" />
              </mesh>
            )}
          </group>
        )}

        {material === 'cardboard' && (
          <group>
            {/* Baled corrugated fiber OCC */}
            <mesh>
              <boxGeometry args={[1.35, 0.95, 1.15]} />
              <meshStandardMaterial
                color="#c4a572"
                roughness={0.88}
                metalness={0.05}
                wireframe={wireframe}
              />
            </mesh>
            {!wireframe && (
              <>
                <mesh position={[-0.35, 0, 0]}>
                  <boxGeometry args={[0.05, 0.97, 1.17]} />
                  <meshStandardMaterial color="#333836" metalness={0.85} roughness={0.2} />
                </mesh>
                <mesh position={[0.35, 0, 0]}>
                  <boxGeometry args={[0.05, 0.97, 1.17]} />
                  <meshStandardMaterial color="#333836" metalness={0.85} roughness={0.2} />
                </mesh>
              </>
            )}
          </group>
        )}

        {material === 'glass' && (
          <group>
            {/* Faceted crystalline glass cullet */}
            <mesh>
              <octahedronGeometry args={[0.9, 0]} />
              <meshPhysicalMaterial
                color="#6ee7b7"
                transmission={wireframe ? 0 : 0.85}
                thickness={1.5}
                roughness={wireframe ? 0.8 : 0.05}
                ior={1.52}
                wireframe={wireframe}
                emissive="#0d3f22"
                emissiveIntensity={0.25}
              />
            </mesh>
          </group>
        )}

        {material === 'e-waste' && (
          <group>
            {/* Circuit motherboard composite with neon traces */}
            <mesh>
              <boxGeometry args={[1.25, 0.22, 1.25]} />
              <meshStandardMaterial
                color="#0f2b1d"
                roughness={0.4}
                metalness={0.65}
                wireframe={wireframe}
              />
            </mesh>
            {!wireframe && (
              <>
                <mesh position={[0, 0.13, 0]}>
                  <boxGeometry args={[0.35, 0.06, 0.35]} />
                  <meshStandardMaterial color="#1f2422" metalness={0.9} roughness={0.15} />
                </mesh>
                <mesh position={[-0.32, 0.12, 0.28]}>
                  <boxGeometry args={[0.18, 0.04, 0.18]} />
                  <meshBasicMaterial color="#34e27a" />
                </mesh>
                <mesh position={[0.3, 0.12, -0.25]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.14, 16]} />
                  <meshStandardMaterial color="#34e27a" metalness={0.7} roughness={0.2} />
                </mesh>
              </>
            )}
          </group>
        )}
      </group>
    </group>
  );
}

export interface Material3DViewerProps {
  initialMaterial?: Material;
  className?: string;
  showSelector?: boolean;
  interactive?: boolean;
  height?: string;
}

export function Material3DViewer({
  initialMaterial = 'plastic',
  className = '',
  showSelector = true,
  height = 'h-60 sm:h-72',
}: Material3DViewerProps) {
  const [material, setMaterial] = useState<Material>(initialMaterial);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const specs = MATERIAL_SPECS[material];

  const materialMeta: Record<Material, { purity: string; meltingPoint: string; co2PerKg: string; code: string }> = {
    plastic: { purity: '99.2% Pure Grade A', meltingPoint: '260°C (PET)', co2PerKg: '1.45 kg CO₂e', code: 'POLY-PET' },
    cardboard: { purity: 'OCC Kraft <2% Moisture', meltingPoint: '180°C Pulper', co2PerKg: '0.85 kg CO₂e', code: 'FIBER-OCC' },
    paper: { purity: 'Sorted White/Newsprint > 96%', meltingPoint: 'De-inking pulp 65°C', co2PerKg: '0.92 kg CO₂e', code: 'PULP-PAP' },
    metal: { purity: '99.7% Clean Ingot', meltingPoint: '660°C (Al)', co2PerKg: '8.92 kg CO₂e', code: 'MET-AL60' },
    glass: { purity: 'Optical Clear Cullet', meltingPoint: '1,450°C', co2PerKg: '0.38 kg CO₂e', code: 'SIL-CULLET' },
    'e-waste': { purity: 'FR4 Multi-layer PCB', meltingPoint: 'Hydrometallurgy', co2PerKg: '14.2 kg CO₂e', code: 'PCB-GOLD' },
  };

  const currentMeta = materialMeta[material];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-line-strong bg-gradient-to-b from-surface-2 to-surface p-4 shadow-2xl ${className}`}>
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      {/* Header controls & live status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-accent-line bg-accent-soft text-accent">
            <Sparkles size={14} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold capitalize text-ink">{material} Specimen</h3>
              <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
                {currentMeta.code}
              </span>
            </div>
            <p className="font-mono text-[11px] text-ink-faint">Interactive WebGL Material Inspector</p>
          </div>
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWireframe((v) => !v)}
            title={wireframe ? 'Solid mode' : 'Wireframe inspection'}
            className={`flex h-7 items-center gap-1 rounded border px-2 text-xs font-medium transition-colors ${
              wireframe
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-surface-3 text-ink-soft hover:text-ink'
            }`}
          >
            <Layers size={13} />
            <span className="hidden sm:inline">X-Ray</span>
          </button>
          <button
            onClick={() => setAutoRotate((v) => !v)}
            title={autoRotate ? 'Pause spin' : 'Resume spin'}
            className={`grid h-7 w-7 place-items-center rounded border transition-colors ${
              autoRotate
                ? 'border-accent-line bg-accent-soft text-accent'
                : 'border-line bg-surface-3 text-ink-soft hover:text-ink'
            }`}
          >
            <RotateCw size={13} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
          </button>
        </div>
      </div>

      {/* Material Tab Selector */}
      {showSelector && (
        <div className="relative z-10 mt-3 flex overflow-x-auto border-b border-line/60 pb-2.5 scrollbar-none gap-1.5">
          {(['plastic', 'metal', 'cardboard', 'glass', 'e-waste'] as Material[]).map((m) => {
            const active = m === material;
            return (
              <button
                key={m}
                onClick={() => setMaterial(m)}
                className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                  active
                    ? 'border border-accent-line bg-accent-soft font-semibold text-accent shadow-[0_0_12px_rgba(52,226,122,0.2)]'
                    : 'border border-transparent text-ink-soft hover:border-line hover:bg-white/5 hover:text-ink'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {/* 3D WebGL Canvas Stage */}
      <div className={`relative w-full ${height}`}>
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <span className="flex items-center gap-2 text-xs font-mono text-ink-soft">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Initializing WebGL Shader…
              </span>
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0, 3.4], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            className="cursor-grab active:cursor-grabbing"
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 5, 4]} intensity={1.8} />
            <pointLight position={[-3, -2, -2]} intensity={1.2} color="#34e27a" />
            <pointLight position={[3, -2, 2]} intensity={0.9} color="#7fd0e0" />

            <SpecimenMesh material={material} wireframe={wireframe} autoRotate={autoRotate} />
          </Canvas>
        </Suspense>

        {/* Floating live inspection badge */}
        <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full border border-line bg-surface/85 px-2.5 py-1 font-mono text-[10px] text-ink-faint backdrop-blur">
          <Eye size={11} className="text-accent" />
          <span>Drag to rotate · WebGL PBR</span>
        </div>

        <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full border border-accent-line bg-accent-soft/90 px-2.5 py-1 font-mono text-[10.5px] font-semibold text-accent backdrop-blur">
          <span>Index: {formatPricePerKg(specs.avgPrice)}</span>
        </div>
      </div>

      {/* Specimen Telemetry Matrix */}
      <div className="relative z-10 grid grid-cols-2 gap-2 border-t border-line/70 pt-3 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-surface/60 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-ink-faint">
            <ShieldCheck size={12} className="text-accent" /> Purity Grade
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-ink">{currentMeta.purity}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface/60 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Flame size={12} className="text-warn" /> Process Temp
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-ink">{currentMeta.meltingPoint}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface/60 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Scale size={12} className="text-accent" /> Carbon Offset
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-accent">{currentMeta.co2PerKg} / kg</p>
        </div>
        <div className="rounded-lg border border-line bg-surface/60 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Zap size={12} className="text-accent" /> Circular Yield
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-ink">97.8% Recovery</p>
        </div>
      </div>
    </div>
  );
}
