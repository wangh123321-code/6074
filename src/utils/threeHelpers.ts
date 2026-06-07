import * as THREE from 'three';

export const createCatGeometry = (type: string, detail: number = 32): THREE.BufferGeometry => {
  switch (type) {
    case 'skin':
      return createSkinGeometry(detail);
    case 'skull':
      return createSkullGeometry(detail);
    case 'spine':
      return createSpineGeometry();
    case 'ribs':
      return createRibsGeometry();
    case 'heart':
      return createHeartGeometry(detail);
    case 'lungs':
      return createLungsGeometry(detail);
    case 'liver':
      return createLiverGeometry(detail);
    case 'kidneys':
      return createKidneysGeometry(detail);
    case 'stomach':
      return createStomachGeometry(detail);
    case 'intestines':
      return createIntestinesGeometry(detail);
    case 'spleen':
      return createSpleenGeometry(detail);
    case 'bladder':
      return createBladderGeometry(detail);
    case 'muscle_skeletal':
      return createMuscleSkeletalGeometry(detail);
    case 'muscle_deep':
      return createMuscleDeepGeometry(detail);
    case 'aorta':
      return createAortaGeometry();
    case 'vena_cava':
      return createVenaCavaGeometry();
    default:
      return new THREE.SphereGeometry(0.3, detail, detail);
  }
};

const createSkinGeometry = (detail: number): THREE.BufferGeometry => {
  const group = new THREE.Group();

  const bodyGeometry = new THREE.SphereGeometry(0.6, detail, detail, 0, Math.PI * 2, 0, Math.PI * 0.7);
  bodyGeometry.scale(1, 0.7, 1.8);
  bodyGeometry.translate(0, 0.4, 0);
  group.add(new THREE.Mesh(bodyGeometry));

  const headGeometry = new THREE.SphereGeometry(0.3, detail, detail);
  headGeometry.translate(0, 0.9, 0.7);
  group.add(new THREE.Mesh(headGeometry));

  const earGeometry = new THREE.ConeGeometry(0.12, 0.25, 4);
  const leftEarGeo = earGeometry.clone();
  leftEarGeo.rotateX(Math.PI / 2);
  leftEarGeo.translate(-0.2, 1.05, 0.55);
  group.add(new THREE.Mesh(leftEarGeo));

  const rightEarGeo = earGeometry.clone();
  rightEarGeo.rotateX(Math.PI / 2);
  rightEarGeo.translate(0.2, 1.05, 0.55);
  group.add(new THREE.Mesh(rightEarGeo));

  const legGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.6, 8);
  const positions = [
    [-0.35, 0.1, 0.4],
    [0.35, 0.1, 0.4],
    [-0.3, 0.1, -0.4],
    [0.3, 0.1, -0.4],
  ];
  positions.forEach((pos) => {
    const legGeo = legGeometry.clone();
    legGeo.translate(pos[0], pos[1], pos[2]);
    group.add(new THREE.Mesh(legGeo));
  });

  const tailGeometry = new THREE.CylinderGeometry(0.03, 0.01, 0.8, 6);
  tailGeometry.rotateX(Math.PI / 3);
  tailGeometry.translate(0, 0.3, -0.9);
  group.add(new THREE.Mesh(tailGeometry));

  return mergeGeometries(group);
};

const createSkullGeometry = (detail: number): THREE.BufferGeometry => {
  const geometry = new THREE.SphereGeometry(0.28, detail, detail);
  geometry.scale(1, 0.9, 1.1);
  geometry.translate(0, 0.9, 0.7);
  return geometry;
};

const createSpineGeometry = (): THREE.BufferGeometry => {
  const group = new THREE.Group();
  const vertebraGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);

  for (let i = 0; i < 15; i++) {
    const vertebra = new THREE.Mesh(vertebraGeometry.clone());
    const y = 0.9 - i * 0.06;
    const z = 0.6 - i * 0.08;
    vertebra.position.set(0, y, z);
    group.add(vertebra);
  }

  return mergeGeometries(group);
};

const createRibsGeometry = (): THREE.BufferGeometry => {
  const group = new THREE.Group();

  for (let i = 0; i < 10; i++) {
    const ribGeometry = new THREE.TorusGeometry(0.35 - i * 0.02, 0.015, 8, 32, Math.PI);
    const rib = new THREE.Mesh(ribGeometry);
    rib.rotation.set(0, Math.PI / 2, Math.PI / 2);
    const y = 0.8 - i * 0.06;
    const z = 0.3 - i * 0.04;
    rib.position.set(0, y, z);
    group.add(rib);
  }

  return mergeGeometries(group);
};

const createHeartGeometry = (detail: number): THREE.BufferGeometry => {
  const group = new THREE.Group();

  const mainGeometry = new THREE.SphereGeometry(0.15, detail, detail);
  mainGeometry.scale(0.9, 1.1, 0.85);
  mainGeometry.translate(0, 0.6, 0.3);
  group.add(new THREE.Mesh(mainGeometry));

  const atriumGeometry = new THREE.SphereGeometry(0.08, detail, detail);
  atriumGeometry.scale(1, 0.7, 1);
  atriumGeometry.translate(0, 0.7, 0.25);
  group.add(new THREE.Mesh(atriumGeometry));

  return mergeGeometries(group);
};

const createLungsGeometry = (detail: number): THREE.BufferGeometry => {
  const group = new THREE.Group();

  const leftLung = new THREE.SphereGeometry(0.18, detail, detail);
  leftLung.scale(0.6, 1.2, 0.9);
  leftLung.translate(-0.15, 0.62, 0.28);
  group.add(new THREE.Mesh(leftLung));

  const rightLung = new THREE.SphereGeometry(0.2, detail, detail);
  rightLung.scale(0.6, 1.3, 0.95);
  rightLung.translate(0.18, 0.62, 0.28);
  group.add(new THREE.Mesh(rightLung));

  return mergeGeometries(group);
};

const createLiverGeometry = (detail: number): THREE.BufferGeometry => {
  const geometry = new THREE.SphereGeometry(0.2, detail, detail);
  geometry.scale(1.5, 0.6, 1.2);
  geometry.rotateZ(0.3);
  geometry.translate(0.3, 0.45, 0.2);
  return geometry;
};

const createKidneysGeometry = (detail: number): THREE.BufferGeometry => {
  const group = new THREE.Group();

  const leftKidney = new THREE.SphereGeometry(0.08, detail, detail);
  leftKidney.scale(0.8, 1.3, 0.7);
  leftKidney.translate(-0.18, 0.4, -0.2);
  group.add(new THREE.Mesh(leftKidney));

  const rightKidney = new THREE.SphereGeometry(0.08, detail, detail);
  rightKidney.scale(0.8, 1.3, 0.7);
  rightKidney.translate(0.18, 0.38, -0.22);
  group.add(new THREE.Mesh(rightKidney));

  return mergeGeometries(group);
};

const createStomachGeometry = (detail: number): THREE.BufferGeometry => {
  const geometry = new THREE.SphereGeometry(0.15, detail, detail);
  geometry.scale(1.8, 0.8, 1.1);
  geometry.rotateY(0.3);
  geometry.translate(-0.25, 0.4, 0.15);
  return geometry;
};

const createIntestinesGeometry = (detail: number): THREE.BufferGeometry => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.35, 0.1),
    new THREE.Vector3(0.25, 0.25, 0.05),
    new THREE.Vector3(0.15, 0.2, 0),
    new THREE.Vector3(0, 0.18, -0.05),
    new THREE.Vector3(-0.15, 0.2, 0),
    new THREE.Vector3(-0.25, 0.25, 0.05),
    new THREE.Vector3(-0.3, 0.3, 0.1),
    new THREE.Vector3(-0.25, 0.35, 0.05),
    new THREE.Vector3(-0.1, 0.4, 0),
    new THREE.Vector3(0.05, 0.35, -0.05),
    new THREE.Vector3(0.15, 0.3, -0.1),
    new THREE.Vector3(0.1, 0.25, -0.2),
    new THREE.Vector3(0, 0.2, -0.3),
  ]);

  return new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
};

const createSpleenGeometry = (detail: number): THREE.BufferGeometry => {
  const geometry = new THREE.SphereGeometry(0.08, detail, detail);
  geometry.scale(0.5, 1.2, 2);
  geometry.rotateY(0.4);
  geometry.translate(-0.35, 0.45, 0);
  return geometry;
};

const createBladderGeometry = (detail: number): THREE.BufferGeometry => {
  const geometry = new THREE.SphereGeometry(0.1, detail, detail);
  geometry.scale(1, 0.8, 1);
  geometry.translate(0, 0.2, -0.35);
  return geometry;
};

const createMuscleSkeletalGeometry = (detail: number): THREE.BufferGeometry => {
  const geometry = createSkinGeometry(detail);
  geometry.scale(0.97, 0.96, 0.96);
  return geometry;
};

const createMuscleDeepGeometry = (detail: number): THREE.BufferGeometry => {
  const geometry = createSkinGeometry(detail);
  geometry.scale(0.92, 0.9, 0.9);
  return geometry;
};

const createAortaGeometry = (): THREE.BufferGeometry => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.65, 0.32),
    new THREE.Vector3(0, 0.6, 0.35),
    new THREE.Vector3(0.08, 0.55, 0.3),
    new THREE.Vector3(0.08, 0.45, 0.2),
    new THREE.Vector3(0.08, 0.35, 0.1),
    new THREE.Vector3(0.08, 0.25, 0),
    new THREE.Vector3(0.08, 0.15, -0.1),
  ]);

  return new THREE.TubeGeometry(curve, 32, 0.025, 8, false);
};

const createVenaCavaGeometry = (): THREE.BufferGeometry => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.15, 0.1, -0.2),
    new THREE.Vector3(0.15, 0.2, -0.15),
    new THREE.Vector3(0.15, 0.3, -0.1),
    new THREE.Vector3(0.15, 0.4, -0.05),
    new THREE.Vector3(0.1, 0.5, 0),
    new THREE.Vector3(0.05, 0.55, 0.15),
    new THREE.Vector3(0, 0.58, 0.28),
  ]);

  return new THREE.TubeGeometry(curve, 32, 0.02, 8, false);
};

const mergeGeometries = (group: THREE.Group): THREE.BufferGeometry => {
  const geometries: THREE.BufferGeometry[] = [];
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.updateMatrix();
      const geometry = child.geometry.clone();
      geometry.applyMatrix4(child.matrix);
      geometries.push(geometry);
    } else if (child instanceof THREE.BufferGeometry) {
      geometries.push(child);
    }
  });

  if (geometries.length === 0) {
    return new THREE.BufferGeometry();
  }

  const merged = mergeBufferGeometries(geometries);
  return merged;
};

const mergeBufferGeometries = (geometries: THREE.BufferGeometry[]): THREE.BufferGeometry => {
  const attributes: Record<string, number[]> = {};
  let index: number[] = [];
  let indexOffset = 0;

  geometries.forEach((geo) => {
    const geoAttributes = geo.attributes;
    Object.keys(geoAttributes).forEach((name) => {
      if (!attributes[name]) attributes[name] = [];
      const attr = geoAttributes[name];
      for (let i = 0; i < attr.count; i++) {
        for (let j = 0; j < attr.itemSize; j++) {
          attributes[name].push(attr.array[i * attr.itemSize + j]);
        }
      }
    });

    if (geo.index) {
      for (let i = 0; i < geo.index.count; i++) {
        index.push(geo.index.array[i] + indexOffset);
      }
    } else {
      for (let i = 0; i < geo.attributes.position.count; i++) {
        index.push(i + indexOffset);
      }
    }
    indexOffset += geo.attributes.position.count;
  });

  const mergedGeometry = new THREE.BufferGeometry();
  Object.keys(attributes).forEach((name) => {
    const attr = attributes[name];
    const itemSize = geometries[0].attributes[name].itemSize;
    mergedGeometry.setAttribute(
      name,
      new THREE.Float32BufferAttribute(new Float32Array(attr), itemSize)
    );
  });
  mergedGeometry.setIndex(index);

  return mergedGeometry;
};

export const createMaterial = (
  color: string,
  transparent: boolean = false,
  opacity: number = 1
): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.7,
    transparent,
    opacity,
    side: THREE.DoubleSide,
  });
};

export const createHighlightMaterial = (color: string): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.3,
    roughness: 0.3,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.9,
  });
};

export const createOutlineMesh = (mesh: THREE.Mesh, color: number = 0xffffff): THREE.LineSegments => {
  const edges = new THREE.EdgesGeometry(mesh.geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })
  );
  line.scale.copy(mesh.scale);
  line.position.copy(mesh.position);
  line.rotation.copy(mesh.rotation);
  return line;
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
