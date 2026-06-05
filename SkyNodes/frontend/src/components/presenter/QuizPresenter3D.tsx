import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { getDialogue } from './presenterDialogues';

export type PresenterState = 'idle' | 'talking' | 'celebrating' | 'thinking' | 'empathy';
export type PresenterSize  = 'large' | 'medium' | 'compact';

interface Props {
  presenterState: PresenterState;
  dialogueKey:    string | null;
  size:           PresenterSize;
}

const MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

// Maps our states to animation clips in RobotExpressive
const CLIP_MAP: Record<PresenterState, string> = {
  idle:        'Idle',
  talking:     'Wave',
  celebrating: 'Dance',
  thinking:    'Pointing',
  empathy:     'No',
};

const SIZES: Record<PresenterSize, { w: number; h: number; fontSize: number; camY: number; camZ: number; fov: number }> = {
  large:   { w: 300, h: 440, fontSize: 13, camY: 0.6, camZ: 5.5, fov: 38 },
  medium:  { w: 190, h: 290, fontSize: 12, camY: 0.6, camZ: 5.8, fov: 38 },
  compact: { w: 120, h: 180, fontSize: 11, camY: 0.6, camZ: 6.0, fov: 38 },
};

export default function QuizPresenter3D({ presenterState, dialogueKey, size }: Props) {
  const mountRef    = useRef<HTMLDivElement>(null);
  const mixerRef    = useRef<THREE.AnimationMixer | null>(null);
  const clipsRef    = useRef<Record<string, THREE.AnimationClip>>({});
  const actionRef   = useRef<THREE.AnimationAction | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef    = useRef<number>(0);

  const [dialogue, setDialogue] = useState('');
  const [showText, setShowText] = useState(false);
  const [loading, setLoading]   = useState(true);

  const { w, h, fontSize, camY, camZ, fov } = SIZES[size];

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100);
    camera.position.set(0, camY, camZ);
    camera.lookAt(0, 0.6, 0);

    // Lighting — dramatic stage feel
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const key     = new THREE.DirectionalLight(0xffd166, 1.8);
    key.position.set(2, 4, 3);
    const fill    = new THREE.DirectionalLight(0x22d3ee, 0.6);
    fill.position.set(-3, 2, 1);
    const rim     = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, 3, -4);
    scene.add(ambient, key, fill, rim);

    // Load RobotExpressive
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      gltf => {
        const model = gltf.scene;
        model.scale.set(0.75, 0.75, 0.75);
        model.position.set(0, -0.85, 0);
        scene.add(model);

        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        gltf.animations.forEach(clip => {
          clipsRef.current[clip.name] = clip;
        });

        // Start idle
        const idleClip = clipsRef.current['Idle'];
        if (idleClip) {
          actionRef.current = mixer.clipAction(idleClip);
          actionRef.current.play();
        }
        setLoading(false);
      },
      undefined,
      () => {
        // Model load failed — silent fallback (procedural sphere)
        setLoading(false);
      },
    );

    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      mixerRef.current?.update(dt);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [w, h, camY, camZ]);

  // Switch animation when state changes
  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;

    const clipName = CLIP_MAP[presenterState];
    const clip = clipsRef.current[clipName];
    if (!clip) return;

    const prev = actionRef.current;
    const next = mixer.clipAction(clip);

    if (prev === next) return;

    next.reset().play();
    if (prev) {
      prev.crossFadeTo(next, 0.3, true);
    }
    actionRef.current = next;

    // Auto-return to idle for non-looping states
    if (['celebrating', 'empathy'].includes(presenterState)) {
      const duration = clip.duration * 1000;
      const timer = setTimeout(() => {
        const idleClip = clipsRef.current['Idle'];
        if (!idleClip) return;
        const idle = mixer.clipAction(idleClip);
        idle.reset().play();
        next.crossFadeTo(idle, 0.5, true);
        actionRef.current = idle;
      }, Math.min(duration, 3000));
      return () => clearTimeout(timer);
    }
  }, [presenterState]);

  // Typewriter dialogue
  useEffect(() => {
    if (!dialogueKey) { setShowText(false); return; }
    const text = getDialogue(dialogueKey);
    setDialogue('');
    setShowText(true);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDialogue(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [dialogueKey]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div ref={mountRef} style={{ width: w, height: h, opacity: loading ? 0.3 : 1, transition: 'opacity 0.5s' }} />

      {showText && dialogue && (
        <div
          className="relative px-4 py-3 max-w-[240px] text-center"
          style={{
            background: 'rgba(13,11,32,0.92)',
            border: '1px solid rgba(255,209,102,0.3)',
            borderRadius: 12,
            fontFamily: "'Sora', sans-serif",
            fontSize,
            color: '#E8DFC8',
            lineHeight: 1.55,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          {/* Speech bubble tail */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
            style={{ background: 'rgba(13,11,32,0.92)', borderLeft: '1px solid rgba(255,209,102,0.3)', borderTop: '1px solid rgba(255,209,102,0.3)' }}
          />
          {dialogue}
          <span
            className="inline-block w-0.5 h-3 ml-0.5 align-middle"
            style={{ background: '#FFD166', animation: 'pulse 1s step-end infinite' }}
          />
        </div>
      )}
    </div>
  );
}
