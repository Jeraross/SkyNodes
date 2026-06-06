import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { X, BookOpen, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

import { STICKERS } from '../../data/stickers';
import { AlbumScene, TOTAL_FLIPS } from './Album3DScene';

const SORA: CSSProperties = { fontFamily: 'Sora, sans-serif' };

type Phase = 'widget' | 'open';

export interface StickerAlbumProps {
  unlockedIds: string[];
  forceOpen?: boolean;
  onForceOpenDone?: () => void;
  hideWidget?: boolean;
}

export default function StickerAlbum({
  unlockedIds,
  forceOpen,
  onForceOpenDone,
  hideWidget,
}: StickerAlbumProps) {
  const [phase,   setPhase]   = useState<Phase>('widget');
  const [flipped, setFlipped] = useState(0);

  const widgetCoverRef = useRef<HTMLDivElement>(null);
  const overlayRef     = useRef<HTMLDivElement>(null);

  // ── Open / close ───────────────────────────────────────────────────────────

  const openAlbum = useCallback(() => {
    setFlipped(0);
    setPhase('open');
    requestAnimationFrame(() => {
      if (!overlayRef.current) return;
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    });
  }, []);

  useEffect(() => {
    if (forceOpen && phase === 'widget') {
      openAlbum();
      onForceOpenDone?.();
    }
  }, [forceOpen, phase, openAlbum, onForceOpenDone]);

  const closeAlbum = useCallback(() => {
    if (!overlayRef.current) return;
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => setPhase('widget'),
    });
  }, []);

  // ── Keyboard ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'open') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')       closeAlbum();
      if (e.key === 'ArrowRight')   setFlipped(f => Math.min(f + 1, TOTAL_FLIPS));
      if (e.key === 'ArrowLeft')    setFlipped(f => Math.max(f - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, closeAlbum]);

  // ── Page label ─────────────────────────────────────────────────────────────

  const pageLabel =
    flipped === 0 ? 'Capa'           :
    flipped === 1 ? 'Págs. 01 — 02' :
                    'Maestria';

  // ── Widget hover ───────────────────────────────────────────────────────────

  const onWidgetEnter = useCallback(() => {
    gsap.to(widgetCoverRef.current, { rotateY: -28, duration: 0.4, ease: 'power2.out' });
  }, []);
  const onWidgetLeave = useCallback(() => {
    gsap.to(widgetCoverRef.current, { rotateY: 0,   duration: 0.4, ease: 'power2.inOut' });
  }, []);

  const COVER_BG = 'linear-gradient(170deg, #F5A623 0%, #E8870A 55%, #C86E08 100%)';

  return (
    <>
      {/* ── Widget ── */}
      {phase === 'widget' && !hideWidget && (
        <div
          className="fixed bottom-4 right-4 z-40 select-none cursor-pointer"
          style={{ width: 80, height: 104, perspective: '500px', rotate: '-5deg' }}
          onMouseEnter={onWidgetEnter}
          onMouseLeave={onWidgetLeave}
          onClick={openAlbum}
        >
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: 12,
              borderRadius: '4px 0 0 4px',
              background: 'linear-gradient(90deg, #7A3F00, #C26A00, #7A3F00)',
              boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.35)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              marginLeft: 12,
              borderRadius: '0 4px 4px 0',
              background: '#F7F2EA',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.28)',
            }}
          />
          <div
            ref={widgetCoverRef}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
              marginLeft: 12,
              borderRadius: '0 4px 4px 0',
              background: COVER_BG,
              transformOrigin: 'left center',
              boxShadow: '2px 2px 10px rgba(0,0,0,0.35)',
            }}
          >
            <BookOpen size={18} style={{ color: 'rgba(255,255,255,0.9)' }} />
            <p style={{ ...SORA, fontSize: 8, fontWeight: 800, color: '#fff', letterSpacing: '0.06em', textAlign: 'center' }}>
              ÁLBUM
            </p>
          </div>
        </div>
      )}

      {/* ── Full-screen overlay ── */}
      {phase === 'open' && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200]"
          style={{
            background: 'linear-gradient(170deg, #2a1008 0%, #180804 55%, #0d0402 100%)',
          }}
        >
          {/* Three.js canvas fills the entire overlay */}
          <Canvas
            shadows
            camera={{ position: [0, 1.6, 6.4], fov: 42 }}
            dpr={[1, 2]}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.65} />
              <directionalLight
                position={[3, 6, 5]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <directionalLight position={[-4, 2, -2]} intensity={0.35} />

              <AlbumScene
                flipped={flipped}
                unlockedIds={unlockedIds}
                stickers={STICKERS}
              />

              <ContactShadows
                position={[0, -2.1, 0]}
                opacity={0.5}
                scale={14}
                blur={2.8}
                far={4}
              />
              <Environment preset="apartment" />
              <OrbitControls
                enablePan={false}
                minDistance={4}
                maxDistance={9}
                minPolarAngle={0.3}
                maxPolarAngle={Math.PI / 2.1}
              />
            </Suspense>
          </Canvas>

          {/* ── HUD: top bar ── */}
          <div
            className="absolute inset-x-0 top-0 flex flex-col items-center gap-1 p-5 pointer-events-none"
            style={{ textAlign: 'center' }}
          >
            <h1 style={{ ...SORA, fontSize: 22, fontWeight: 800, color: '#F3D98B', letterSpacing: '-0.01em' }}>
              Álbum de Figurinhas
            </h1>
            <p style={{ ...SORA, fontSize: 12, color: 'rgba(233,201,201,0.65)' }}>
              Arraste para girar · use os botões para folhear
            </p>
          </div>

          {/* ── HUD: close button ── */}
          <button
            onClick={closeAlbum}
            className="absolute top-4 right-5 flex items-center gap-1.5 cursor-pointer"
            style={{
              ...SORA,
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 8,
              padding: '6px 12px',
              transition: 'color .15s, background .15s',
              zIndex: 10,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255,255,255,0.16)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            <X size={14} strokeWidth={2.5} />
            Fechar
          </button>

          {/* ── HUD: bottom navigation ── */}
          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-5"
            style={{ zIndex: 10 }}
          >
            <button
              onClick={() => setFlipped(f => Math.max(f - 1, 0))}
              disabled={flipped === 0}
              className="flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                ...SORA,
                fontSize: 13,
                fontWeight: 600,
                color: '#F3D98B',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(243,217,139,0.25)',
                borderRadius: 40,
                padding: '8px 20px',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(243,217,139,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <div
              style={{
                ...SORA,
                fontSize: 13,
                fontWeight: 600,
                color: '#F3D98B',
                background: 'rgba(0,0,0,0.45)',
                borderRadius: 40,
                padding: '8px 24px',
                minWidth: 160,
                textAlign: 'center',
                letterSpacing: '0.03em',
              }}
            >
              {pageLabel}
            </div>

            <button
              onClick={() => setFlipped(f => Math.min(f + 1, TOTAL_FLIPS))}
              disabled={flipped === TOTAL_FLIPS}
              className="flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                ...SORA,
                fontSize: 13,
                fontWeight: 600,
                color: '#F3D98B',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(243,217,139,0.25)',
                borderRadius: 40,
                padding: '8px 20px',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(243,217,139,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
            >
              Próxima <ChevronRight size={16} />
            </button>

            <button
              onClick={reset}
              title="Voltar à capa"
              className="flex items-center justify-center cursor-pointer"
              style={{
                color: 'rgba(243,217,139,0.5)',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(243,217,139,0.15)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                transition: 'color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F3D98B'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(243,217,139,0.5)'; }}
            >
              <RotateCcw size={15} />
            </button>
          </div>

        </div>
      )}
    </>
  );

  function reset() { setFlipped(0); }
}
