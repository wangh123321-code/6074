import { useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { LayerType, MuscleLevel } from '../types/anatomy';

export const useLayerControl = () => {
  const { scene } = useThree();
  const layers = useAnatomyStore((state) => state.layers);
  const cutPlanes = useAnatomyStore((state) => state.cutPlanes);
  const animationFrameRef = useRef<number>();

  const findMeshesByLayer = useCallback(
    (layer: LayerType): THREE.Mesh[] => {
      const meshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.layer === layer) {
          meshes.push(child);
        }
      });
      return meshes;
    },
    [scene]
  );

  const findMuscleMeshesByLevel = useCallback(
    (level: MuscleLevel): THREE.Mesh[] => {
      const meshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.userData.layer === 'muscle' &&
          child.userData.muscleLevel !== undefined &&
          child.userData.muscleLevel < level
        ) {
          meshes.push(child);
        }
      });
      return meshes;
    },
    [scene]
  );

  const updateLayerVisibility = useCallback(() => {
    (Object.keys(layers) as LayerType[]).forEach((layer) => {
      const layerState = layers[layer];
      const meshes = findMeshesByLayer(layer);

      meshes.forEach((mesh) => {
        mesh.visible = layerState.visible;

        if (mesh.material instanceof THREE.Material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.opacity = layerState.opacity;

          if (layer === 'skin' && 'translucent' in layerState) {
            mat.transparent = layerState.translucent || layerState.opacity < 1;
            mat.depthWrite = !layerState.translucent;
          } else {
            mat.transparent = layerState.opacity < 1;
            mat.depthWrite = layerState.opacity >= 1;
          }

          mat.needsUpdate = true;
        }
      });
    });

    const muscleMeshes = findMuscleMeshesByLevel(layers.muscle.level);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.layer === 'muscle') {
        if (child.userData.muscleLevel !== undefined) {
          child.visible =
            child.userData.muscleLevel < layers.muscle.level && layers.muscle.visible;
        }
      }
    });

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        const planes = cutPlanes.map(
          (cp) =>
            new THREE.Plane(
              new THREE.Vector3(cp.normal[0], cp.normal[1], cp.normal[2]),
              cp.constant
            )
        );
        child.material.clippingPlanes = planes;
        child.material.needsUpdate = true;
      }
    });
  }, [layers, cutPlanes, findMeshesByLayer, findMuscleMeshesByLevel, scene]);

  useEffect(() => {
    updateLayerVisibility();
  }, [updateLayerVisibility]);

  // 移除无限循环，只在图层状态变化时更新

  return { updateLayerVisibility };
};
