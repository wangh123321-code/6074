import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useAnatomyStore } from '../store/useAnatomyStore';
import organsData from '../data/organs.json';
import { Organ } from '../types/anatomy';

export const useOrganPicker = () => {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const selectOrgan = useAnatomyStore((state) => state.selectOrgan);
  const hoverOrgan = useAnatomyStore((state) => state.hoverOrgan);
  const currentTool = useAnatomyStore((state) => state.currentTool);

  const organs = organsData as Organ[];

  const getPickableMeshes = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.organId && child.visible) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [scene]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (currentTool !== 'select') return;

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(getPickableMeshes(), false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const organId = mesh.userData.organId;
        const organ = organs.find((o) => o.id === organId);
        if (organ) {
          hoverOrgan(organ);
          document.body.style.cursor = 'pointer';
        }
      } else {
        hoverOrgan(null);
        document.body.style.cursor = 'default';
      }
    },
    [camera, getPickableMeshes, currentTool, hoverOrgan, organs]
  );

  const handleClick = useCallback(
    (event: PointerEvent) => {
      if (currentTool !== 'select') return;

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(getPickableMeshes(), false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const organId = mesh.userData.organId;
        const organ = organs.find((o) => o.id === organId);
        if (organ) {
          selectOrgan(organ);
        }
      } else {
        selectOrgan(null);
      }
    },
    [camera, getPickableMeshes, currentTool, selectOrgan, organs]
  );

  return { handlePointerMove, handleClick };
};
