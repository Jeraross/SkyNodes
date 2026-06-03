import * as THREE from 'three';

// ── Module-level cache ──────────────────────────────────────────────
let cachedGroup: THREE.Group | null = null;
let loadState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
const onLoadCallbacks: Array<() => void> = [];

export function onEiffelModelReady(cb: () => void) {
  if (loadState === 'ready') { cb(); return; }
  onLoadCallbacks.push(cb);
}

export async function loadEiffelTowerModel(url = '/models/scene.gltf'): Promise<void> {
  if (loadState !== 'idle') return;
  loadState = 'loading';

  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();

    const gltf: any = await new Promise((resolve, reject) =>
      loader.load(url, resolve, undefined, reject)
    );

    const scene: THREE.Group = gltf.scene;

    // If Z is the tallest axis the model is Z-up → rotate to Y-up
    const box0 = new THREE.Box3().setFromObject(scene);
    const size0 = box0.getSize(new THREE.Vector3());
    if (size0.z > size0.y * 1.3) {
      scene.rotation.x = -Math.PI / 2;
      scene.updateMatrixWorld(true);
    }

    // Center on XZ plane, base at Y = 0
    const box1 = new THREE.Box3().setFromObject(scene);
    const center = box1.getCenter(new THREE.Vector3());
    scene.position.x -= center.x;
    scene.position.z -= center.z;
    scene.position.y -= box1.min.y;
    scene.updateMatrixWorld(true);

    // Scale: target 4.0 globe-units tall (≈ 4 % of globe radius — same order as the airplane)
    const box2 = new THREE.Box3().setFromObject(scene);
    const height = box2.max.y - box2.min.y;
    scene.scale.setScalar(height > 0 ? 4.0 / height : 1);
    scene.updateMatrixWorld(true);

    const group = new THREE.Group();
    group.add(scene);
    const glow = new THREE.PointLight(0xFFD700, 1.2, 8);
    glow.position.y = 2;
    group.add(glow);

    cachedGroup = group;
    loadState = 'ready';
    onLoadCallbacks.forEach(cb => cb());
    onLoadCallbacks.length = 0;
  } catch (err) {
    console.warn('[EiffelTower] GLTF load failed — using procedural fallback.', err);
    loadState = 'error';
    onLoadCallbacks.forEach(cb => cb());
    onLoadCallbacks.length = 0;
  }
}

export function isEiffelModelReady() {
  return loadState === 'ready' || loadState === 'error';
}

// ── Public factory ──────────────────────────────────────────────────
export function createEiffelTowerObject(): THREE.Group {
  if (cachedGroup) return cachedGroup.clone(true);
  return createProceduralTower();
}

// ── Procedural fallback (shown while model loads or on error) ───────
function mat(color: number, emissive: number) {
  return new THREE.MeshPhongMaterial({ color, emissive, emissiveIntensity: 0.4, shininess: 60 });
}

function createProceduralTower(): THREE.Group {
  const g = new THREE.Group();
  const iron  = mat(0x8B6520, 0x3A2400);
  const shine = mat(0xC49A3C, 0x6A4A00);
  const mk = (geom: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(geom, m);

  const SPREAD = 0.080, CONVG = 0.018, LEG_H = 0.130;
  const dx = SPREAD - CONVG;
  const legLen = Math.sqrt(dx * dx + LEG_H * LEG_H);
  const tilt   = Math.atan2(dx, LEG_H);
  const cx = (SPREAD + CONVG) / 2, cy = LEG_H / 2;
  const legGeom = new THREE.CylinderGeometry(0.009, 0.021, legLen, 6);

  const addLeg = (x: number, y: number, z: number, rz: number, rx: number) => {
    const l = mk(legGeom, iron);
    l.position.set(x, y, z); l.rotation.z = rz; l.rotation.x = rx; g.add(l);
  };
  addLeg( cx, cy,  0, -tilt,  0); addLeg(-cx, cy,  0,  tilt,  0);
  addLeg(  0, cy,  cx,     0,  tilt); addLeg(  0, cy, -cx,     0, -tilt);

  const bGeom = new THREE.CylinderGeometry(0.005, 0.005, SPREAD * 1.55, 5);
  const bX = mk(bGeom, iron); bX.position.y = LEG_H * 0.42; bX.rotation.z = Math.PI / 2; g.add(bX);
  const bZ = mk(bGeom, iron); bZ.position.y = LEG_H * 0.42; bZ.rotation.x = Math.PI / 2; g.add(bZ);

  const p1 = mk(new THREE.CylinderGeometry(0.064, 0.064, 0.014, 8), shine); p1.position.y = LEG_H; g.add(p1);
  const mid = mk(new THREE.CylinderGeometry(0.021, 0.060, 0.095, 8), iron); mid.position.y = LEG_H + 0.047; g.add(mid);
  const p2y = LEG_H + 0.095;
  const p2 = mk(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 8), shine); p2.position.y = p2y + 0.006; g.add(p2);
  const upY = p2y + 0.012;
  const upper = mk(new THREE.CylinderGeometry(0.009, 0.021, 0.100, 8), iron); upper.position.y = upY + 0.050; g.add(upper);
  const spireY = upY + 0.100;
  const spire = mk(new THREE.CylinderGeometry(0.003, 0.009, 0.065, 6), shine); spire.position.y = spireY + 0.032; g.add(spire);
  const ant = mk(new THREE.CylinderGeometry(0.0012, 0.003, 0.042, 4), shine); ant.position.y = spireY + 0.065 + 0.021; g.add(ant);

  const glow = new THREE.PointLight(0xFFD700, 0.9, 2.5); glow.position.y = LEG_H + 0.05; g.add(glow);
  g.scale.setScalar(9);
  return g;
}
