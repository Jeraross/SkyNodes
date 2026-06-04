import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { getDialogue } from './presenterDialogues';

export type PresenterState = 'idle' | 'talking' | 'celebrating' | 'thinking' | 'empathy';
export type PresenterSize  = 'large' | 'medium' | 'compact';

interface Props {
  presenterState: PresenterState;
  dialogueKey:    string | null;
  size:           PresenterSize;
}

const SIZES: Record<PresenterSize, { w: number; h: number; fontSize: number }> = {
  large:   { w: 280, h: 380, fontSize: 13 },
  medium:  { w: 180, h: 240, fontSize: 12 },
  compact: { w: 100, h: 140, fontSize: 11 },
};

function buildPresenter(): THREE.Group {
  const mat = (color: number) =>
    new THREE.MeshToonMaterial({ color, emissive: color, emissiveIntensity: 0.08 });

  const group = new THREE.Group();

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), mat(0x22d3ee));
  head.position.set(0, 1.55, 0);
  head.name = 'head';

  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.75, 10), mat(0x0891b2));
  body.position.set(0, 0.9, 0);

  // Left arm
  const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8), mat(0x22d3ee));
  lArm.position.set(-0.42, 0.95, 0);
  lArm.rotation.z = 0.3;
  lArm.name = 'lArm';

  // Right arm
  const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8), mat(0x22d3ee));
  rArm.position.set(0.42, 0.95, 0);
  rArm.rotation.z = -0.3;
  rArm.name = 'rArm';

  // Left leg
  const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 8), mat(0x0e7490));
  lLeg.position.set(-0.17, 0.25, 0);

  // Right leg
  const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 8), mat(0x0e7490));
  rLeg.position.set(0.17, 0.25, 0);

  group.add(head, body, lArm, rArm, lLeg, rLeg);
  group.position.set(0, -1.1, 0);
  return group;
}

function applyAnimation(group: THREE.Group, state: PresenterState) {
  const head = group.getObjectByName('head')!;
  const rArm = group.getObjectByName('rArm')!;
  const lArm = group.getObjectByName('lArm')!;

  gsap.killTweensOf([group.position, group.rotation, head.rotation, rArm.rotation, lArm.rotation]);

  if (state === 'idle') {
    gsap.to(group.position, { y: -1.1, duration: 0.5, ease: 'power2.out' });
    gsap.to(group.rotation, { z: 0, duration: 0.5 });
    gsap.to(head.rotation,  { z: 0, duration: 0.5 });
    gsap.to(rArm.rotation,  { z: -0.3, duration: 0.5 });
    gsap.to(lArm.rotation,  { z:  0.3, duration: 0.5 });
  } else if (state === 'talking') {
    gsap.to(head.rotation,  { z: 0.12, yoyo: true, repeat: -1, duration: 0.6 });
    gsap.to(rArm.rotation,  { z: -1.1, duration: 0.4, ease: 'back.out(1.5)' });
  } else if (state === 'celebrating') {
    gsap.to(group.position, { y: -0.5, yoyo: true, repeat: 3, duration: 0.3, ease: 'power1.inOut',
      onComplete: () => gsap.to(group.position, { y: -1.1, duration: 0.4 }) });
    gsap.to(rArm.rotation, { z: -2.2, duration: 0.3 });
    gsap.to(lArm.rotation, { z:  2.2, duration: 0.3 });
  } else if (state === 'thinking') {
    gsap.to(group.rotation, { z: 0.15, duration: 0.4 });
    gsap.to(head.rotation,  { z: -0.2, duration: 0.4 });
    gsap.to(rArm.rotation,  { z: -1.4, duration: 0.4 });
  } else if (state === 'empathy') {
    gsap.to(group.rotation, { z: -0.08, yoyo: true, repeat: 3, duration: 0.4,
      onComplete: () => gsap.to(group.rotation, { z: 0, duration: 0.3 }) });
    gsap.to(rArm.rotation, { z: -0.1, duration: 0.4 });
    gsap.to(lArm.rotation, { z:  0.1, duration: 0.4 });
  }
}

export default function QuizPresenter3D({ presenterState, dialogueKey, size }: Props) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const sceneRef   = useRef<{ renderer: THREE.WebGLRenderer; group: THREE.Group; animId: number } | null>(null);
  const [dialogue, setDialogue] = useState('');
  const [showText, setShowText] = useState(false);
  const { w, h, fontSize } = SIZES[size];

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.2, 4);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const point   = new THREE.PointLight(0x22d3ee, 2, 10);
    point.position.set(2, 3, 3);
    scene.add(ambient, point);

    const group = buildPresenter();
    scene.add(group);

    let animId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = Math.sin(t * 0.5) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { renderer, group, animId };

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [w, h]);

  useEffect(() => {
    if (!sceneRef.current) return;
    applyAnimation(sceneRef.current.group, presenterState);
  }, [presenterState]);

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
    }, 28);
    return () => clearInterval(id);
  }, [dialogueKey]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div ref={mountRef} style={{ width: w, height: h }} />
      {showText && dialogue && (
        <div
          className="rounded-xl px-4 py-3 max-w-xs text-center"
          style={{
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.25)',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize,
            color: '#cbd5e1',
            lineHeight: 1.5,
          }}
        >
          {dialogue}
          <span className="animate-pulse text-cyan-400">|</span>
        </div>
      )}
    </div>
  );
}
