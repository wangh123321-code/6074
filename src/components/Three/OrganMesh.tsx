import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { a } from '@react-spring/three';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import { createCatGeometry, createMaterial, createHighlightMaterial } from '../../utils/threeHelpers';
import { Organ } from '../../types/anatomy';

interface OrganMeshProps {
  organ: Organ;
  muscleLevel?: number;
}

export const OrganMesh = ({ organ, muscleLevel = 3 }: OrganMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outlineRef = useRef<THREE.LineSegments>(null);
  const selectedOrgan = useAnatomyStore((state) => state.selectedOrgan);
  const hoveredOrgan = useAnatomyStore((state) => state.hoveredOrgan);
  const layers = useAnatomyStore((state) => state.layers);

  const isSelected = selectedOrgan?.id === organ.id;
  const isHovered = hoveredOrgan?.id === organ.id;

  const geometry = useMemo(() => {
    const lodLevel = 32;
    return createCatGeometry(organ.meshName, lodLevel);
  }, [organ.meshName]);

  const material = useMemo(() => {
    const layerState = layers[organ.layer] || { visible: true, opacity: 1 };
    let translucent: boolean;
    if (organ.layer === 'skin' && 'translucent' in layerState) {
      translucent = layerState.translucent as boolean;
    } else {
      translucent = (layerState.opacity ?? 1) < 1;
    }

    if (isSelected || isHovered) {
      const mat = createHighlightMaterial(isSelected ? '#ed8936' : '#38b2ac');
      mat.opacity = layerState.opacity ?? 1;
      mat.transparent = translucent || (layerState.opacity ?? 1) < 1;
      mat.depthWrite = !translucent;
      return mat;
    }

    return createMaterial(organ.color, translucent, layerState.opacity ?? 1);
  }, [organ, isSelected, isHovered, layers]);

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
  }, [organ]);

  useFrame((_, delta) => {
    if (meshRef.current && (isSelected || isHovered)) {
      const scale = 1 + Math.sin(performance.now() * 0.003) * 0.015;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const muscleVisible =
    organ.layer !== 'muscle' ||
    (organ.meshName === 'muscle_skeletal' && muscleLevel >= 2) ||
    (organ.meshName === 'muscle_deep' && muscleLevel >= 3) ||
    muscleLevel >= 1;

  if (!visible || !muscleVisible) return null;

  return (
    <group>
      <a.mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={organ.position}
        castShadow
        receiveShadow
      />
      {(isSelected || isHovered) && (
        <lineSegments
          ref={outlineRef}
          geometry={new THREE.EdgesGeometry(geometry)}
          material={
            new THREE.LineBasicMaterial({
              color: isSelected ? 0xed8936 : 0x38b2ac,
              transparent: true,
              opacity: 0.9,
              linewidth: 2,
            })
          }
          position={organ.position}
        />
      )}
    </group>
  );
};
