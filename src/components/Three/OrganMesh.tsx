import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { a } from '@react-spring/three';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import { createCatGeometry, createMaterial, createHighlightMaterial } from '../../utils/threeHelpers';
import { Organ } from '../../types/anatomy';

interface OrganMeshProps {
  organ: Organ;
  muscleLevel?: number;
}

const createLODGeometries = (meshName: string) => {
  return {
    high: createCatGeometry(meshName, 32),
    medium: createCatGeometry(meshName, 16),
    low: createCatGeometry(meshName, 8),
  };
};

export const OrganMesh = ({ organ, muscleLevel = 3 }: OrganMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mediumMeshRef = useRef<THREE.Mesh>(null);
  const lowMeshRef = useRef<THREE.Mesh>(null);
  const outlineRef = useRef<THREE.LineSegments>(null);
  const selectedOrgan = useAnatomyStore((state) => state.selectedOrgan);
  const hoveredOrgan = useAnatomyStore((state) => state.hoveredOrgan);
  const layers = useAnatomyStore((state) => state.layers);
  const isPathologyMode = useAnatomyStore((state) => state.isPathologyMode);
  const currentDisease = useAnatomyStore((state) => state.currentDisease);
  const { camera } = useThree();
  const [currentLOD, setCurrentLOD] = useState(0);

  const isSelected = selectedOrgan?.id === organ.id;
  const isHovered = hoveredOrgan?.id === organ.id;
  const isAffectedByDisease = isPathologyMode && currentDisease && currentDisease.organId === organ.id;

  const geometries = useMemo(() => createLODGeometries(organ.meshName), [organ.meshName]);

  const material = useMemo(() => {
    const layerState = layers[organ.layer] || { visible: true, opacity: 1 };
    let translucent: boolean;
    if (organ.layer === 'skin' && 'translucent' in layerState) {
      translucent = layerState.translucent as boolean;
    } else {
      translucent = (layerState.opacity ?? 1) < 1;
    }

    let baseColor = organ.color;
    let emissiveColor = '#000000';
    let emissiveIntensity = 0;

    if (isAffectedByDisease) {
      baseColor = '#8b0000';
      emissiveColor = '#ff4444';
      emissiveIntensity = 0.4;
    }

    if (isSelected || isHovered) {
      const mat = createHighlightMaterial(isAffectedByDisease ? '#ff4444' : (isSelected ? '#ed8936' : '#38b2ac'));
      mat.opacity = layerState.opacity ?? 1;
      mat.transparent = translucent || (layerState.opacity ?? 1) < 1;
      mat.depthWrite = !translucent;
      if (isAffectedByDisease) {
        mat.emissive = new THREE.Color('#ff0000');
        mat.emissiveIntensity = 0.8;
        mat.color = new THREE.Color('#8b0000');
      }
      return mat;
    }

    const mat = createMaterial(baseColor, translucent, layerState.opacity ?? 1);
    if (isAffectedByDisease) {
      mat.emissive = new THREE.Color(emissiveColor);
      mat.emissiveIntensity = emissiveIntensity;
    }
    return mat;
  }, [organ, isSelected, isHovered, layers, isAffectedByDisease]);

  const layerState = layers[organ.layer] || { visible: true, opacity: 1 };
  const visible = layerState.visible;

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.organId = organ.id;
      meshRef.current.userData.layer = organ.layer;
      if (organ.layer === 'muscle') {
        meshRef.current.userData.muscleLevel =
          organ.meshName === 'muscle_deep' ? 1 : 2;
      }
    }
    if (mediumMeshRef.current) {
      mediumMeshRef.current.userData.organId = organ.id;
      mediumMeshRef.current.userData.layer = organ.layer;
    }
    if (lowMeshRef.current) {
      lowMeshRef.current.userData.organId = organ.id;
      lowMeshRef.current.userData.layer = organ.layer;
    }
  }, [organ]);

  useFrame(() => {
    if (meshRef.current && (isSelected || isHovered)) {
      const scale = 1 + Math.sin(performance.now() * 0.003) * 0.015;
      meshRef.current.scale.setScalar(scale);
      if (mediumMeshRef.current) mediumMeshRef.current.scale.setScalar(scale);
      if (lowMeshRef.current) lowMeshRef.current.scale.setScalar(scale);
    }

    if (meshRef.current && isAffectedByDisease) {
      const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.03;
      meshRef.current.scale.setScalar(pulse);
      if (mediumMeshRef.current) mediumMeshRef.current.scale.setScalar(pulse);
      if (lowMeshRef.current) lowMeshRef.current.scale.setScalar(pulse);
    }

    if (meshRef.current) {
      const distance = camera.position.distanceTo(
        new THREE.Vector3(
          organ.position[0],
          organ.position[1],
          organ.position[2]
        )
      );

      let newLOD = 0;
      if (distance > 5) newLOD = 2;
      else if (distance > 2.5) newLOD = 1;

      if (newLOD !== currentLOD) {
        setCurrentLOD(newLOD);
      }

      if (meshRef.current) meshRef.current.visible = newLOD === 0;
      if (mediumMeshRef.current) mediumMeshRef.current.visible = newLOD === 1;
      if (lowMeshRef.current) lowMeshRef.current.visible = newLOD === 2;
    }
  });

  const muscleVisible =
    organ.layer !== 'muscle' ||
    (organ.meshName === 'muscle_skeletal' && muscleLevel >= 2) ||
    (organ.meshName === 'muscle_deep' && muscleLevel >= 3) ||
    muscleLevel >= 1;

  if (!visible || !muscleVisible) return null;

  const currentGeometry = currentLOD === 0 ? geometries.high : currentLOD === 1 ? geometries.medium : geometries.low;

  return (
    <group position={organ.position}>
      <a.mesh
        ref={meshRef}
        geometry={geometries.high}
        material={material}
        castShadow
        receiveShadow
        visible={currentLOD === 0}
      />
      <mesh
        ref={mediumMeshRef}
        geometry={geometries.medium}
        material={material}
        castShadow
        receiveShadow
        visible={currentLOD === 1}
      />
      <mesh
        ref={lowMeshRef}
        geometry={geometries.low}
        material={material}
        castShadow
        receiveShadow
        visible={currentLOD === 2}
      />
      {(isSelected || isHovered || isAffectedByDisease) && (
        <lineSegments
          ref={outlineRef}
          geometry={new THREE.EdgesGeometry(currentGeometry)}
          material={
            new THREE.LineBasicMaterial({
              color: isAffectedByDisease ? 0xff0000 : isSelected ? 0xed8936 : 0x38b2ac,
              transparent: true,
              opacity: 1.0,
              linewidth: 3,
            })
          }
        />
      )}
      {isAffectedByDisease && (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.15, 0.15, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#ff4444" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-0.1, 0.25, 0.1]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#ff6666" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.05, -0.1, 0.15]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#ff2222" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
};
