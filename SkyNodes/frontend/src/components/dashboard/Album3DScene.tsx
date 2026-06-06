import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Sticker } from '../../data/stickers';

// ── Book constants ─────────────────────────────────────────────────────────────
export const PAGE_W  = 2.6;
export const PAGE_H  = 3.4;
const COVER_D = 0.08;   // hardcover board thickness
const LEAF_D  = 0.010;  // single leaf thickness
const COVER_Z = 0.12;   // pivot z-offset for front / back cover
const GAP     = 0.018;  // clearance between faces to prevent z-clipping

// ─── z position helpers ────────────────────────────────────────────────────────
// i=0 is the FIRST leaf to flip (top of right pile → bottom of left pile).
//
// BUG FIX: previous leftZ ≈ 0 caused pages to land BEHIND the open cover.
// rightZ: just inside the front cover's inner face.
// leftZ:  just outside the open front cover's outer face (closer to viewer).
function leafRightZ(i: number) {
  return COVER_Z - COVER_D / 2 - GAP - LEAF_D / 2 - i * (LEAF_D + GAP);
}
function leafLeftZ(i: number) {
  return COVER_Z + COVER_D / 2 + GAP + LEAF_D / 2 + i * (LEAF_D + GAP);
}

// ── Canvas page texture ────────────────────────────────────────────────────────
// Pre-loads ALL sticker images via Promise.all so the canvas is drawn in one
// synchronous pass — no needsUpdate dance required, and no crossOrigin issues.
function usePageTexture(
  stickers: Sticker[],
  unlockedIds: string[],
  pageLabel: string,
) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // Skip entirely for empty back pages
    if (stickers.length === 0 && !pageLabel) return;

    let live = true;

    const loadImg = (src: string): Promise<HTMLImageElement | null> =>
      new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    Promise.all(stickers.map(s => loadImg(s.img))).then(images => {
      if (!live) return;

      const CW = 512, CH = 668;
      const canvas = document.createElement('canvas');
      canvas.width = CW; canvas.height = CH;
      const ctx = canvas.getContext('2d')!;

      // Paper
      ctx.fillStyle = '#FEFCF7'; ctx.fillRect(0, 0, CW, CH);
      ctx.strokeStyle = '#EDE4CE'; ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, CW - 20, CH - 20);

      // Header band
      const hH = 46;
      const g = ctx.createLinearGradient(0, 0, 0, hH);
      g.addColorStop(0, '#F5A623'); g.addColorStop(1, '#C86E08');
      ctx.fillStyle = g; ctx.fillRect(0, 0, CW, hH);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AERO GAMES', CW / 2, 30);
      if (pageLabel) {
        ctx.fillStyle = 'rgba(255,255,255,0.60)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(pageLabel, CW - 14, 41);
      }

      // 2×2 sticker grid
      const cols = 2, pX = 20, pY = hH + 12, gap = 10;
      const cW = (CW - pX * 2 - gap) / cols;
      const cH = (CH - pY - 20 - gap) / 2;

      stickers.forEach((s, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = pX + col * (cW + gap), y = pY + row * (cH + gap);
        const unlocked = unlockedIds.includes(s.id);
        const img = images[i];

        // Slot
        ctx.fillStyle = unlocked ? '#FFFDF7' : '#F2EAD8';
        ctx.beginPath(); ctx.roundRect(x, y, cW, cH, 8); ctx.fill();
        ctx.strokeStyle = unlocked ? '#F5A623' : '#D6C9B0';
        ctx.lineWidth = unlocked ? 2.5 : 1.5;
        if (!unlocked) ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.roundRect(x, y, cW, cH, 8); ctx.stroke();
        ctx.setLineDash([]);

        // Badge
        ctx.fillStyle = unlocked ? '#B45309' : '#C4B8A0';
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`#${String(i + 1).padStart(2, '0')}`, x + 7, y + 16);

        // Sticker image
        if (img) {
          const r = Math.min((cW * 0.72) / img.width, (cH * 0.62) / img.height);
          const dw = img.width * r, dh = img.height * r;
          if (!unlocked) ctx.filter = 'grayscale(100%) brightness(0.55)';
          ctx.drawImage(img, x + (cW - dw) / 2, y + (cH - dh) / 2 - 8, dw, dh);
          ctx.filter = 'none';
        }

        // Name label
        ctx.fillStyle = unlocked ? '#92400E' : '#B8A898';
        ctx.font = unlocked ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(unlocked ? s.name : '— — —', x + cW / 2, y + cH - 9);
      });

      // Footer
      ctx.fillStyle = '#B09A6B'; ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(pageLabel, CW - 18, CH - 10);

      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(prev => { prev?.dispose(); return t; });
    });

    return () => { live = false; };
  // pageLabel is the stable key; stickers/unlockedIds are captured once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLabel]);

  return tex;
}

// ── Spine binding (sits at the pivot hinge, bridges the two covers) ───────────
// Centred at x=0 (the covers' hinge axis) so it naturally meets both cover
// edges without floating off to the side.  Narrow so it doesn't protrude.
function SpineBinding({ totalDepth }: { totalDepth: number }) {
  const SW = 0.13;
  const H  = PAGE_H + 0.10;

  return (
    <group>
      {/* radius ≈ SW/2 gives near-semicircular top/bottom caps, matching a real spine */}
      <RoundedBox args={[SW, H, totalDepth]} radius={0.062} smoothness={8} castShadow>
        <meshStandardMaterial color="#7A1010" roughness={0.75} metalness={0.01} />
      </RoundedBox>

      {/* Title — outer face, reads bottom-to-top */}
      <Text
        position={[-(SW / 2) - 0.001, 0, 0]}
        rotation={[0, -Math.PI / 2, Math.PI / 2]}
        fontSize={0.078}
        color="#E8C870"
        anchorX="center"
        anchorY="middle"
        maxWidth={H - 0.6}
        textAlign="center"
        outlineWidth={0.003}
        outlineColor="#3A0000"
      >
        ÁLBUM DE FIGURINHAS
      </Text>
    </group>
  );
}

// ── Cover (front and back) ─────────────────────────────────────────────────────
interface CoverProps {
  targetRotation: number;
  zOffset: number;
  isBack?: boolean;
}

export function AlbumCover({ targetRotation, zOffset, isBack = false }: CoverProps) {
  const pivot   = useRef<THREE.Group>(null);

  // Memoize frame edge geometry — never re-create per render (R3F pitfall #2)
  const CW = PAGE_W + 0.10;
  const CH = PAGE_H + 0.10;
  const frameGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(CW - 0.28, CH - 0.28)),
    [CW, CH],
  );

  useFrame((_, delta) => {
    if (!pivot.current) return;
    const damp = 1 - Math.pow(0.001, delta);
    pivot.current.rotation.y = THREE.MathUtils.lerp(
      pivot.current.rotation.y,
      targetRotation,
      damp,
    );
    if (!isBack) {
      const p = THREE.MathUtils.clamp(-pivot.current.rotation.y / Math.PI, 0, 1);
      // Cover arcs high enough to clear all page geometry beneath it.
      pivot.current.position.z = zOffset + Math.sin(p * Math.PI) * 0.38;
    }
  });

  return (
    <group ref={pivot} position={[0, 0, zOffset]}>
      {/* Pivot origin at spine edge; cover body offset to center */}
      <group position={[CW / 2 - 0.05, 0, 0]}>

        {/* Hardcover board — rounded corners via RoundedBox */}
        <RoundedBox args={[CW, CH, COVER_D]} radius={0.045} smoothness={4} castShadow>
          <meshStandardMaterial color="#8B1515" roughness={0.74} metalness={0.01} />
        </RoundedBox>

        {/* Endpaper (inside face — cream; visible when cover is open) */}
        <mesh position={[0, 0, isBack ? COVER_D / 2 - 0.002 : -(COVER_D / 2 - 0.002)]}
              rotation={[0, isBack ? 0 : Math.PI, 0]}>
          <planeGeometry args={[CW - 0.06, CH - 0.06]} />
          <meshStandardMaterial color="#EFE0C0" roughness={0.93} />
        </mesh>

        {/* Front-cover art */}
        {!isBack && (
          <group position={[0, 0, COVER_D / 2 + 0.001]}>
            {/* Golden frame */}
            <lineSegments geometry={frameGeo}>
              <lineBasicMaterial color="#C8952A" />
            </lineSegments>

            {/* Title */}
            <Text
              position={[0, 0.80, 0.01]}
              fontSize={0.26}
              color="#F3D98B"
              anchorX="center"
              anchorY="middle"
              maxWidth={CW - 0.50}
              textAlign="center"
              outlineWidth={0.007}
              outlineColor="#5A0D0D"
            >
              {'ÁLBUM DE\nFIGURINHAS'}
            </Text>

            <Text
              position={[0, -0.08, 0.01]}
              fontSize={0.135}
              color="#F0DDB8"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.06}
            >
              Coleção 2026
            </Text>

            {/* Embossed seal */}
            <mesh position={[0, -0.92, 0.006]}>
              <circleGeometry args={[0.36, 48]} />
              <meshStandardMaterial color="#C49025" roughness={0.32} metalness={0.5} />
            </mesh>
            <mesh position={[0, -0.92, 0.013]}>
              <circleGeometry args={[0.28, 48]} />
              <meshStandardMaterial color="#7A1212" roughness={0.55} />
            </mesh>
            <Text
              position={[0, -0.92, 0.022]}
              fontSize={0.092}
              color="#F3D98B"
              anchorX="center"
              anchorY="middle"
              textAlign="center"
            >
              {'EDIÇÃO\nESPECIAL'}
            </Text>
          </group>
        )}
      </group>
    </group>
  );
}

// ── Leaf / page ────────────────────────────────────────────────────────────────
interface PageProps {
  frontStickers: Sticker[];
  backStickers: Sticker[];
  unlockedIds: string[];
  frontLabel: string;
  backLabel: string;
  targetRotation: number;
  leafIndex: number;
}

export function AlbumPage({
  frontStickers, backStickers, unlockedIds,
  frontLabel, backLabel, targetRotation, leafIndex,
}: PageProps) {
  const pivot    = useRef<THREE.Group>(null);
  // Imperative material refs — we set .map + .needsUpdate directly so that
  // R3F does not need to recompile the shader on the undefined→texture transition.
  const frontMat = useRef<THREE.MeshStandardMaterial>(null);
  const backMat  = useRef<THREE.MeshStandardMaterial>(null);

  const frontTex = usePageTexture(frontStickers, unlockedIds, frontLabel);
  const backTex  = usePageTexture(backStickers,  unlockedIds, backLabel);

  useEffect(() => {
    if (!frontMat.current) return;
    frontMat.current.map = frontTex ?? null;
    frontMat.current.needsUpdate = true;
  }, [frontTex]);

  useEffect(() => {
    if (!backMat.current) return;
    backMat.current.map = backTex ?? null;
    backMat.current.needsUpdate = true;
  }, [backTex]);

  const rZ = leafRightZ(leafIndex);
  const lZ = leafLeftZ(leafIndex);

  useFrame((_, delta) => {
    if (!pivot.current) return;
    const damp = 1 - Math.pow(0.001, delta);
    pivot.current.rotation.y = THREE.MathUtils.lerp(
      pivot.current.rotation.y,
      targetRotation,
      damp,
    );
    const p     = THREE.MathUtils.clamp(-pivot.current.rotation.y / Math.PI, 0, 1);
    const baseZ = THREE.MathUtils.lerp(rZ, lZ, p);
    pivot.current.position.z = baseZ + Math.sin(p * Math.PI) * 0.46;
  });

  return (
    <group ref={pivot} position={[0, 0, rZ]}>
      <group position={[PAGE_W / 2, 0, 0]}>
        {/* Leaf body */}
        <mesh>
          <boxGeometry args={[PAGE_W, PAGE_H, LEAF_D]} />
          <meshStandardMaterial color="#F0E6D0" roughness={0.96} />
        </mesh>

        {/* Front face — material driven imperatively via frontMat ref */}
        <mesh position={[0, 0, LEAF_D / 2 + 0.0005]}>
          <planeGeometry args={[PAGE_W - 0.03, PAGE_H - 0.03]} />
          <meshStandardMaterial ref={frontMat} roughness={0.88} color="#FFFFFF" />
        </mesh>

        {/* Back face */}
        <mesh position={[0, 0, -(LEAF_D / 2 + 0.0005)]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[PAGE_W - 0.03, PAGE_H - 0.03]} />
          <meshStandardMaterial ref={backMat} roughness={0.88} color="#FFFFFF" />
        </mesh>
      </group>
    </group>
  );
}

// ── Scene ──────────────────────────────────────────────────────────────────────
export interface AlbumSceneProps {
  flipped: number;
  unlockedIds: string[];
  stickers: Sticker[];
}

export function AlbumScene({ flipped, unlockedIds, stickers }: AlbumSceneProps) {
  const CLOSED = 0, OPEN = -Math.PI;
  const totalDepth = COVER_Z * 2 + COVER_D;

  // Only the first NAVIGABLE leaves respond to flipped.
  // The remaining leaves stay permanently closed — they exist only to fill the book visually.
  const NAVIGABLE = 2;
  const leaves = useMemo(() => [
    {
      front: stickers.slice(0, 4), back: stickers.slice(4, 8),
      frontLabel: 'Pág. 01', backLabel: 'Pág. 02',
    },
    {
      front: stickers.slice(8), back: [] as Sticker[],
      frontLabel: 'Maestria', backLabel: '',
    },
    // Non-navigable filler leaves — never rotate, only add visual thickness.
    { front: [] as Sticker[], back: [] as Sticker[], frontLabel: '', backLabel: '' },
    { front: [] as Sticker[], back: [] as Sticker[], frontLabel: '', backLabel: '' },
    { front: [] as Sticker[], back: [] as Sticker[], frontLabel: '', backLabel: '' },
  ], [stickers]);

  return (
    // Slight forward tilt for a natural reading-angle view
    <group rotation={[-0.28, 0, 0]} position={[-1.28, 0, 0]}>

      {/* ── Spine binding — single strip at the hinge pivot ── */}
      <SpineBinding totalDepth={totalDepth} />

      {/* ── Back cover — never rotates ── */}
      <AlbumCover targetRotation={CLOSED} zOffset={-COVER_Z} isBack />

      {/* ── Inner leaves ── */}
      {leaves.map((leaf, i) => (
        <AlbumPage
          key={i}
          frontStickers={leaf.front}
          backStickers={leaf.back}
          unlockedIds={unlockedIds}
          frontLabel={leaf.frontLabel}
          backLabel={leaf.backLabel}
          targetRotation={i < NAVIGABLE && flipped - 1 > i ? OPEN : CLOSED}
          leafIndex={i}
        />
      ))}

      {/* ── Front cover — flips when flipped ≥ 1 ── */}
      <AlbumCover
        targetRotation={flipped >= 1 ? OPEN : CLOSED}
        zOffset={COVER_Z}
      />
    </group>
  );
}

// 0=closed  1=cover open  2=maestria visible  (stop here)
export const TOTAL_FLIPS = 2;
