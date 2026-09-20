import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHeroRecycleScroll } from '../hooks/useScrollProgress';

/**
 * Creates realistic procedural label and metal bump textures for the soda can,
 * matching real-world crushed soda cans (scratched red lacquer, bold typography,
 * barcode, nutritional facts grid, and bare aluminum top/bottom scoring).
 */
export function createSodaCanTextures() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Base bold aluminum soda red with subtle metallic flakes & horizontal brushed grain
  ctx.fillStyle = '#b31818';
  ctx.fillRect(0, 0, 2048, 2048);

  // Realistic cylindrical studio curvature highlights
  const grad = ctx.createLinearGradient(0, 0, 2048, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0.35)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.22)');
  grad.addColorStop(0.38, 'rgba(255,255,255,0.08)');
  grad.addColorStop(0.65, 'rgba(0,0,0,0.12)');
  grad.addColorStop(0.85, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 2048);

  // Brushed metal micro-lines
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 0; y < 2048; y += 4) {
    ctx.fillRect(0, y, 2048, 1.5);
  }

  // Top & bottom polished bare aluminum necking bands (matching 500ml can specs)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 2048, 140);
  ctx.fillRect(0, 1908, 2048, 140);

  // Silver accent stripe dividers
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 140, 2048, 14);
  ctx.fillRect(0, 1894, 2048, 14);

  // White dynamic curved ribbon wave (Classic soda silhouette)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 720);
  ctx.bezierCurveTo(680, 480, 1360, 1040, 2048, 760);
  ctx.lineTo(2048, 920);
  ctx.bezierCurveTo(1360, 1200, 680, 640, 0, 880);
  ctx.closePath();
  ctx.fill();

  // Emerald eco sub-swoosh
  ctx.fillStyle = '#34e27a';
  ctx.beginPath();
  ctx.moveTo(0, 890);
  ctx.bezierCurveTo(680, 650, 1360, 1210, 2048, 930);
  ctx.lineTo(2048, 960);
  ctx.bezierCurveTo(1360, 1240, 680, 680, 0, 920);
  ctx.closePath();
  ctx.fill();

  // Bold brand lettering - Crisp & Premium
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 190px "Impact", "Arial Black", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('CRUSHED', 320, 880);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 76px "Space Grotesk", sans-serif';
  ctx.fillText('500ml • 100% RECYCLABLE', 320, 1010);

  // Nutritional table & Industrial recycling specs
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(120, 1180, 380, 440);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px monospace';
  ctx.fillText('MATERIAL SPEC / PBR', 140, 1230);
  ctx.font = '26px monospace';
  ctx.fillText('ALLOY: 3104-H19 AL', 140, 1290);
  ctx.fillText('VOLUME: 500 ML / 16.9 OZ', 140, 1350);
  ctx.fillText('WALL: 0.097 MM', 140, 1410);
  ctx.fillText('MELTING PT: 660°C', 140, 1470);
  ctx.fillText('CIRCULAR RATIO: 100%', 140, 1530);
  ctx.fillText('CAN WEIGHT: 14.8 G', 140, 1590);

  // Barcode markings with numeric caption
  ctx.fillStyle = '#ffffff';
  for (let x = 1600; x < 1920; x += 10) {
    const barWidth = Math.sin(x * 12) > 0.1 ? 7 : 3;
    ctx.fillRect(x, 1180, barWidth, 200);
  }
  ctx.font = '24px monospace';
  ctx.fillText('8 437012 940028', 1610, 1410);

  // Weathered scuffs, hairline paint scratches and abrasions (authentic post-consumer wear)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 70; i++) {
    const sx = Math.random() * 2048;
    const sy = Math.random() * 2048;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (Math.random() - 0.5) * 120, sy + (Math.random() - 0.5) * 80);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;

  return texture;
}

/**
 * Realistic Crushed Soda Can 3D Mesh
 * Faithful to the Sketchfab "Crushed Soda Can Collection" topology:
 * - Dented inward body with organic diagonal crumple folds
 * - Pinched waist from physical foot/hand crushing
 * - Realistic recessed top rim, concave pop-can dome bottom, and pull tab
 * - Morphing vertex algorithm that simulates industrial hydraulic baling / recycling recovery
 */
function CrushedCanMesh({
  recycleProgress = 0,
  scrollYProgress: _scrollYProgress = 0,
}: {
  recycleProgress: number;
  scrollYProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const topGroupRef = useRef<THREE.Group>(null);
  const bottomGroupRef = useRef<THREE.Group>(null);
  const pullTabRef = useRef<THREE.Group>(null);

  // Smooth lerped progress internal ref so frame-by-frame updates are buttery
  const smoothProgressRef = useRef(0);

  const { originalPos, canMat, metalMat, rimMat, tabMat } = useMemo(() => {
    // 500ml can aspect ratio: radius ~0.82, height ~2.7 (slender European / tallboy 500ml silhouette)
    const geo = new THREE.CylinderGeometry(0.82, 0.82, 2.7, 64, 64, false);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const pos = posAttr.clone();

    const tex = createSodaCanTextures();

    // High specular, high clearcoat-like reflectance matching physical aluminum beverage cans
    const cMat = new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.55,
      roughness: 0.22,
    });

    // Pristine turned aluminum for chine, neck and lid plate
    const mMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      metalness: 0.82,
      roughness: 0.18,
    });

    // Outer double-seamed rim bead
    const rMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.78,
      roughness: 0.2,
    });

    // Tab material
    const tMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.85,
      roughness: 0.15,
    });

    return { originalPos: pos, canMat: cMat, metalMat: mMat, rimMat: rMat, tabMat: tMat };
  }, []);

  useFrame(({ clock, size }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Smooth lerp frame-by-frame to avoid any stutter
    smoothProgressRef.current += (recycleProgress - smoothProgressRef.current) * 0.12;
    const p = Math.min(1, Math.max(0, smoothProgressRef.current));

    const isMobile = size.width < 768;
    const baseX = isMobile ? 0 : 1.62;
    const targetX = baseX + Math.sin(t * 0.85) * 0.06;
    // Lowered Y center position so the top of the can stays safely inside the viewport below the navbar
    const targetY = (isMobile ? -0.28 : -0.16) + Math.sin(t * 1.1) * 0.06;
    const targetZ = 0.25 + Math.cos(t * 0.75) * 0.06;

    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.07;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.07;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.07;

    // Scale to ensure comfortable margin inside all viewports
    const baseScale = isMobile ? 0.72 : 0.84;
    groupRef.current.scale.set(baseScale, baseScale, baseScale);

    // Continuous floating tumble that stabilizes upright as it completes recycling
    const rotDamping = 1 - p * 0.85;
    groupRef.current.rotation.x = 0.22 + Math.sin(t * 0.7) * 0.16 * rotDamping + p * 0.1;
    groupRef.current.rotation.y += 0.014 + (1 - p) * 0.008;
    groupRef.current.rotation.z = -0.14 + Math.cos(t * 0.8) * 0.12 * rotDamping;

    // Morph vertices: keep top rim (y >= 1.25) and bottom rim (y <= -1.25) strictly intact and connected!
    // Crumple only the middle cylindrical wall (y between -1.25 and 1.25) so it never detaches from the caps.
    if (bodyRef.current) {
      const geo = bodyRef.current.geometry;
      const pos = geo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (pos) {
        const count = pos.count;
        const crushWeight = Math.pow(Math.max(0, 1 - p), 1.2);
        const halfHeight = 1.35;

        for (let i = 0; i < count; i++) {
          const ox = originalPos.getX(i);
          const oy = originalPos.getY(i);
          const oz = originalPos.getZ(i);

          // Boundary blend: 0 at top and bottom rims (oy = ±1.35), 1 in the middle body
          // This guarantees 100% seam continuity with the top neck and bottom chine!
          const distFromEnd = halfHeight - Math.abs(oy);
          const edgeBlend = Math.sin(Math.max(0, Math.min(1, distFromEnd / 0.75)) * (Math.PI / 2));
          const effectiveCrush = crushWeight * edgeBlend;

          // 1. Organic helical compression buckling in the middle wall
          const angle = Math.atan2(oz, ox);
          const spiral = Math.sin(angle * 3.0 + oy * 3.5);
          const diagFold = spiral * 0.25 * effectiveCrush;

          // 2. Heavy lateral stomp indentation on one flank
          const isDentFlank = ox > 0.1 && oz > -0.2;
          const dentRadial = isDentFlank
            ? -Math.exp(-((ox - 0.7) ** 2 * 2.2 + oy ** 2 * 1.8)) * 0.48 * effectiveCrush
            : 0;

          // 3. Central waist necking pinch
          const waistPinch = Math.exp(-oy * oy * 2.2) * 0.26 * effectiveCrush;

          // 4. Subtle aluminum skin crinkles
          const crinkle =
            Math.sin(ox * 16.0 + oy * 14.0) * Math.cos(oz * 14.0) * 0.04 * effectiveCrush;

          const radiusFactor = 1 - waistPinch;
          pos.setXYZ(
            i,
            ox * radiusFactor + diagFold * 0.55 + dentRadial + crinkle,
            oy, // Keep exact Y coordinates to eliminate any Y-axis detachment or gap!
            oz * radiusFactor + diagFold * 0.65 + crinkle
          );
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      }

      // Smooth, radiant material transition:
      canMat.metalness = THREE.MathUtils.lerp(0.55, 0.78, p);
      canMat.roughness = THREE.MathUtils.lerp(0.25, 0.16, p);

      if (p > 0.15) {
        const factor = (p - 0.15) / 0.85;
        canMat.color.setRGB(
          THREE.MathUtils.lerp(1.0, 0.94, factor),
          THREE.MathUtils.lerp(1.0, 1.0, factor),
          THREE.MathUtils.lerp(1.0, 0.96, factor)
        );
        canMat.emissive.setRGB(0.04 * factor, 0.22 * factor, 0.11 * factor);
      } else {
        canMat.color.setRGB(1.0, 1.0, 1.0);
        canMat.emissive.setRGB(0, 0, 0);
      }

      metalMat.metalness = THREE.MathUtils.lerp(0.8, 0.9, p);
      metalMat.roughness = THREE.MathUtils.lerp(0.2, 0.12, p);
      metalMat.color.setRGB(
        THREE.MathUtils.lerp(0.95, 0.98, p),
        THREE.MathUtils.lerp(0.97, 1.0, p),
        THREE.MathUtils.lerp(0.98, 0.99, p)
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Printed Cylindrical Can Body (500ml proportion) */}
      <mesh ref={bodyRef} material={canMat}>
        <cylinderGeometry args={[0.82, 0.82, 2.7, 64, 64, false]} />
      </mesh>

      {/* Top Cap Assembly - Seamlessly welded to the top of the cylinder (y=1.35) */}
      <group ref={topGroupRef} position={[0, 1.35, 0]}>
        {/* Tapered necking chine */}
        <mesh position={[0, 0.06, 0]} material={metalMat}>
          <cylinderGeometry args={[0.72, 0.82, 0.12, 64]} />
        </mesh>

        {/* Recessed Top Lid Plate */}
        <mesh position={[0, 0.12, 0]} material={metalMat}>
          <cylinderGeometry args={[0.71, 0.71, 0.02, 64]} />
        </mesh>

        {/* Outer Double-Seamed Rim Bead */}
        <mesh position={[0, 0.13, 0]} material={rimMat}>
          <torusGeometry args={[0.71, 0.028, 16, 64]} />
        </mesh>

        {/* Authentic Pop-Can Pull Tab: Flat horizontal aluminum tab with opening aperture and rivet */}
        <group ref={pullTabRef} position={[0.16, 0.14, 0.06]} rotation={[-0.08, 0.35, 0]}>
          {/* Main flat tab plate */}
          <mesh material={tabMat}>
            <boxGeometry args={[0.34, 0.015, 0.20]} />
          </mesh>
          {/* Center attachment rivet */}
          <mesh position={[-0.11, 0.01, 0]} material={metalMat}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          </mesh>
          {/* Flat horizontal punched finger hole (lying flat on the tab plate) */}
          <mesh position={[0.08, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMat}>
            <torusGeometry args={[0.055, 0.016, 12, 28]} />
          </mesh>
        </group>
      </group>

      {/* Bottom Cap Assembly - Seamlessly welded to the bottom of the cylinder (y=-1.35) */}
      <group ref={bottomGroupRef} position={[0, -1.35, 0]}>
        {/* Bottom Chine bevel */}
        <mesh position={[0, -0.06, 0]} material={metalMat}>
          <cylinderGeometry args={[0.82, 0.74, 0.12, 64]} />
        </mesh>
        {/* Inward concave dome */}
        <mesh position={[0, -0.11, 0]} material={metalMat}>
          <sphereGeometry args={[0.72, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        </mesh>
      </group>

      {/* Clean Industrial Circular Scan Rings (emerge as can completes recycling) */}
      {recycleProgress > 0.15 && (
        <group>
          <mesh position={[0, Math.sin(smoothProgressRef.current * 4) * 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.08, 1.15, 64]} />
            <meshBasicMaterial
              color="#34e27a"
              transparent
              opacity={Math.min(0.85, (recycleProgress - 0.15) * 1.1)}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -Math.sin(smoothProgressRef.current * 4) * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.02, 1.07, 64]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={Math.min(0.7, (recycleProgress - 0.15) * 0.9)}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Full Floating Background 3D Canvas
 * Present in the Hero section (first part of the page) on the right side.
 * Synchronized with the pinned hero scroll: as the user scrolls, the can recycles from 0% to 100%.
 * The page stays in the hero until the can is 100% recycled; then as user scrolls down to Live Market,
 * the 3D canvas fades out and scrolls away cleanly.
 */
export function BackgroundRecycledCanScene() {
  const { recycleProgress, containerOpacity, scrollYOffset } = useHeroRecycleScroll();

  if (containerOpacity <= 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden will-change-transform"
      style={{
        opacity: containerOpacity * 0.98,
        transform: `translate3d(0, ${scrollYOffset}px, 0)`,
      }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 36 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* Generous bright 3-point studio lighting */}
        <ambientLight intensity={1.8} color="#ffffff" />

        {/* Primary bright key light directly illuminating the front face of the can */}
        <directionalLight position={[3, 4, 5]} intensity={2.8} color="#ffffff" />

        {/* Crisp emerald top/back rim backlight for metallic contour sheen */}
        <directionalLight position={[-4, 5, -2]} intensity={2.2} color="#34e27a" />

        {/* Soft fill light from left so no angles go dark */}
        <directionalLight position={[-4, -1, 4]} intensity={1.6} color="#e0f2fe" />

        {/* Bottom accent point light */}
        <pointLight position={[2, -2.5, 3]} intensity={1.4} color="#38bdf8" />

        <CrushedCanMesh
          recycleProgress={recycleProgress}
          scrollYProgress={recycleProgress}
        />
      </Canvas>
    </div>
  );
}
