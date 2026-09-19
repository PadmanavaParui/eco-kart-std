import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * WasteX / SmartSort 3D Hero Scene:
 * Realistic floating 3D waste objects (Crumpled Soda Can, Crinkled Snack Foil Packet,
 * Crushed Water Bottle, Crumpled Kraft Ball) that rotate in space and
 * morph / transform into pristine recycled materials (smooth aluminum ingot,
 * purified polymer sheet, clear resin pellets, clean fiber bale) as the user scrolls down!
 */

// -------------------------------------------------------------
// 1. Procedural 3D Soda Can (Crumpled Can -> Recycled Aluminum Ingot)
// -------------------------------------------------------------
function SodaCan({
  position = [0.1, 0.18, 0.4] as [number, number, number],
  recycleProgress = 0,
}: {
  position?: [number, number, number];
  recycleProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Original undeformed cylinder vertices
  const { originalPos, canMat } = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.58, 0.58, 1.5, 36, 32, false);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const pos = posAttr.clone();
    const mat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      metalness: 0.85,
      roughness: 0.35,
    });
    return { originalPos: pos, canMat: mat };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Floating bobbing and continuous tumbling rotation
    groupRef.current.position.y = position[1] + Math.sin(t * 1.1 + 0.5) * 0.1;
    groupRef.current.rotation.x = 0.25 + Math.sin(t * 0.7) * 0.12;
    groupRef.current.rotation.y += hovered ? 0.04 : 0.012;
    groupRef.current.rotation.z = -0.15 + Math.cos(t * 0.8) * 0.08;

    // Morph the can mesh vertices based on recycle progress
    if (bodyMeshRef.current) {
      const geo = bodyMeshRef.current.geometry;
      const pos = geo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (pos) {
        const count = pos.count;
        const dentAmt = (1 - recycleProgress) * 0.24;

        for (let i = 0; i < count; i++) {
          const ox = originalPos.getX(i);
          const oy = originalPos.getY(i);
          const oz = originalPos.getZ(i);

          // Procedural crushing crease and indent
          const dent = Math.sin(oy * 6.0 + ox * 4.5) * Math.cos(oz * 5.0) * dentAmt;
          const middleCrush = Math.exp(-Math.abs(oy) * 2.8) * (1 - recycleProgress) * 0.15;

          pos.setXYZ(
            i,
            ox * (1 - middleCrush) + ox * dent,
            oy * (1 - dentAmt * 0.15),
            oz * (1 - middleCrush) + oz * dent
          );
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      }

      // Dynamic color shift: weathered scratched beverage red -> brilliant recycled emerald & alloy chrome
      const p = recycleProgress;
      canMat.color.setRGB(
        THREE.MathUtils.lerp(0.88, 0.20, p),
        THREE.MathUtils.lerp(0.22, 0.88, p),
        THREE.MathUtils.lerp(0.25, 0.48, p)
      );
      canMat.metalness = THREE.MathUtils.lerp(0.7, 0.96, p);
      canMat.roughness = THREE.MathUtils.lerp(0.5, 0.12, p);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={hovered ? 1.45 : 1.35}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={bodyMeshRef} material={canMat}>
        <cylinderGeometry args={[0.58, 0.58, 1.5, 36, 32, false]} />
      </mesh>

      {/* Top Rim */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.5, 0.56, 0.05, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
      </mesh>
      {/* Pull Tab */}
      <mesh position={[0.1, 0.79, 0]} rotation={[-0.2, 0.4, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Recycled Energy Halo */}
      {recycleProgress > 0.35 && (
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.84, 32]} />
          <meshBasicMaterial
            color="#34e27a"
            transparent
            opacity={(recycleProgress - 0.35) * 0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 2. Procedural Crinkled Snack / Chips Packet
// -------------------------------------------------------------
function CrinkledPacket({
  position = [-2.05, 0.75, -0.2] as [number, number, number],
  recycleProgress = 0,
}: {
  position?: [number, number, number];
  recycleProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { originalPos, packetMat } = useMemo(() => {
    const geo = new THREE.BoxGeometry(1.15, 1.45, 0.16, 24, 28, 4);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const pos = posAttr.clone();
    const mat = new THREE.MeshStandardMaterial({
      color: '#eab308', // shiny golden yellow metallic pouch
      metalness: 0.88,
      roughness: 0.32,
    });
    return { originalPos: pos, packetMat: mat };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.position.y = position[1] + Math.cos(t * 1.05 + 1.2) * 0.1;
    groupRef.current.rotation.y += hovered ? 0.035 : 0.01;
    groupRef.current.rotation.x = 0.3 + Math.sin(t * 0.7) * 0.08;

    if (meshRef.current) {
      const geo = meshRef.current.geometry;
      const pos = geo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (pos) {
        const crinkleIntensity = (1 - recycleProgress) * 0.16;

        for (let i = 0; i < pos.count; i++) {
          const ox = originalPos.getX(i);
          const oy = originalPos.getY(i);
          const oz = originalPos.getZ(i);

          const crinkle =
            Math.sin(ox * 14.0 + oy * 8.0) * Math.cos(oy * 12.0) * crinkleIntensity;

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
        THREE.MathUtils.lerp(0.92, 0.20, p),
        THREE.MathUtils.lerp(0.70, 0.85, p),
        THREE.MathUtils.lerp(0.15, 0.65, p)
      );
      packetMat.roughness = THREE.MathUtils.lerp(0.4, 0.15, p);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={hovered ? 1.05 : 0.95}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={meshRef} material={packetMat}>
        <boxGeometry args={[1.15, 1.45, 0.16, 24, 28, 4]} />
      </mesh>
      {/* Top & Bottom Seal Ridges */}
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.04]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.74, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.04]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3. Procedural Crushed Plastic Bottle (PET Water Bottle)
// -------------------------------------------------------------
function CrushedBottle({
  position = [2.0, -0.32, 0.2] as [number, number, number],
  recycleProgress = 0,
}: {
  position?: [number, number, number];
  recycleProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { originalPos, bottleMat } = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.42, 0.42, 1.5, 32, 28);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const pos = posAttr.clone();
    const mat = new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      transmission: 0.72,
      opacity: 0.85,
      transparent: true,
      roughness: 0.25,
      ior: 1.54,
      thickness: 0.6,
    });
    return { originalPos: pos, bottleMat: mat };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.position.y = position[1] + Math.sin(t * 0.95 + 2.0) * 0.09;
    groupRef.current.rotation.y += hovered ? 0.03 : 0.01;
    groupRef.current.rotation.z = 0.25 + Math.cos(t * 0.8) * 0.07;

    if (meshRef.current) {
      const geo = meshRef.current.geometry;
      const pos = geo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (pos) {
        const crushIntensity = (1 - recycleProgress) * 0.24;

        for (let i = 0; i < pos.count; i++) {
          const ox = originalPos.getX(i);
          const oy = originalPos.getY(i);
          const oz = originalPos.getZ(i);

          const isNeck = oy > 0.45;
          const radiusScale = isNeck ? 0.55 : 1.0;
          const crease = Math.sin(oy * 5.0 + ox * 6.0) * crushIntensity;

          pos.setXYZ(
            i,
            ox * radiusScale + crease,
            oy * (1 - crushIntensity * 0.3),
            oz * radiusScale - crease * 0.8
          );
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      }

      const p = recycleProgress;
      bottleMat.transmission = THREE.MathUtils.lerp(0.55, 0.94, p);
      bottleMat.roughness = THREE.MathUtils.lerp(0.4, 0.08, p);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={hovered ? 1.05 : 0.95}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={meshRef} material={bottleMat}>
        <cylinderGeometry args={[0.42, 0.42, 1.5, 32, 28]} />
      </mesh>
      {/* Bottle Blue Cap */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.12, 24]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 4. Procedural Crumpled Cardboard / Kraft Bale
// -------------------------------------------------------------
function CrumpledCardboard({
  position = [-1.6, -1.1, -0.4] as [number, number, number],
  recycleProgress = 0,
}: {
  position?: [number, number, number];
  recycleProgress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y += hovered ? 0.03 : 0.008;
    meshRef.current.rotation.x = 0.4 + Math.sin(t * 0.6) * 0.06;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={hovered ? 0.92 : 0.82}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <dodecahedronGeometry args={[0.7, recycleProgress > 0.6 ? 2 : 0]} />
      <meshStandardMaterial
        color={recycleProgress > 0.5 ? '#b4996b' : '#937848'}
        roughness={0.88}
        metalness={0.05}
      />
    </mesh>
  );
}

// -------------------------------------------------------------
// 5. Swirling Recycling Particle Stream
// -------------------------------------------------------------
function ParticleStream({ progress }: { progress: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const ecoEmerald = new THREE.Color('#34e27a');
    const gold = new THREE.Color('#fbbf24');
    const cyan = new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const radius = 1.6 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.5;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const pickColor = i % 3 === 0 ? ecoEmerald : i % 3 === 1 ? cyan : gold;
      col[i * 3] = pickColor.r;
      col[i * 3 + 1] = pickColor.g;
      col[i * 3 + 2] = pickColor.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime() * (1 + progress * 2.2);
    pointsRef.current.rotation.y = t * 0.22;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.3 + progress * 0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// -------------------------------------------------------------
// Parallax Pointer Rig
// -------------------------------------------------------------
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y += (pointer.x * 0.38 - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-pointer.y * 0.2 - group.current.rotation.x) * 0.05;
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ recycleProgress = 0 }: { recycleProgress?: number }) {
  const progress = Math.max(0, Math.min(1, recycleProgress));

  return (
    <div className="h-full w-full" aria-hidden>
      <Canvas
        camera={{ position: [0, 0.2, 5.8], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 4]} intensity={1.6} color="#eafff2" />
        <directionalLight position={[-6, -2, -4]} intensity={0.7} color="#34e27a" />
        <pointLight position={[0, -2, 2]} intensity={0.6} color="#34e27a" />

        <ParallaxRig>
          {/* Crumpled Soda Can -> Clean Recycled Ingot */}
          <SodaCan position={[0.1, 0.18, 0.4]} recycleProgress={progress} />

          {/* Crinkled Chips Packet -> Pure Polymer Flake */}
          <CrinkledPacket position={[-2.05, 0.75, -0.2]} recycleProgress={progress} />

          {/* Crushed PET Water Bottle -> Clear Crystal Pellets */}
          <CrushedBottle position={[2.0, -0.32, 0.2]} recycleProgress={progress} />

          {/* Crumpled Cardboard / Kraft Ball -> Compact Clean Bale */}
          <CrumpledCardboard position={[-1.6, -1.1, -0.4]} recycleProgress={progress} />

          {/* Swirling recycling particle vortex */}
          <ParticleStream progress={progress} />
        </ParallaxRig>
      </Canvas>
    </div>
  );
}
