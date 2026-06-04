import * as THREE from 'three';

export function createAirplaneObject(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshPhongMaterial({
    color: 0xe0f7fa,
    emissive: 0x00bcd4,
    emissiveIntensity: 0.35,
    shininess: 90,
  });
  const wingMat = new THREE.MeshPhongMaterial({
    color: 0xb3e5fc,
    emissive: 0x0277bd,
    emissiveIntensity: 0.2,
    shininess: 60,
  });

  // Fuselagem (cilindro ao longo do eixo Z — frente é +Z)
  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.020, 0.20, 8),
    bodyMat
  );
  fuselage.rotation.x = Math.PI / 2;
  group.add(fuselage);

  // Nariz (cone apontando +Z)
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.012, 0.07, 8),
    bodyMat
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 0.135;
  group.add(nose);

  // Asas principais
  const wings = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.006, 0.09),
    wingMat
  );
  wings.position.z = -0.01;
  group.add(wings);

  // Cauda vertical
  const vTail = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.065, 0.07),
    wingMat
  );
  vTail.position.set(0, 0.030, -0.09);
  group.add(vTail);

  // Cauda horizontal
  const hTail = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.005, 0.055),
    wingMat
  );
  hTail.position.z = -0.09;
  group.add(hTail);

  group.scale.setScalar(8);
  return group;
}
