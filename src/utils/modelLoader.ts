import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useAnatomyStore } from '../store/useAnatomyStore';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

interface LoadModelOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export const loadGLTFModel = async (
  path: string,
  options: LoadModelOptions = {}
): Promise<THREE.Group> => {
  const { onProgress, onError } = options;

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      path,
      (gltf) => {
        resolve(gltf.scene);
      },
      (progress) => {
        if (progress.total > 0 && onProgress) {
          const percent = (progress.loaded / progress.total) * 100;
          onProgress(percent);
        }
      },
      (error) => {
        if (onError) {
          onError(error as Error);
        }
        reject(error);
      }
    );
  });
};

export const createLODModel = async (
  highPath: string,
  mediumPath: string,
  lowPath: string
): Promise<THREE.LOD> => {
  const lod = new THREE.LOD();
  const setLoadingProgress = useAnatomyStore.getState().setLoadingProgress;

  try {
    let loaded = 0;
    const total = 3;

    const onProgress = () => {
      loaded++;
      setLoadingProgress((loaded / total) * 100);
    };

    const highModel = await loadGLTFModel(highPath, { onProgress });
    const mediumModel = await loadGLTFModel(mediumPath, { onProgress });
    const lowModel = await loadGLTFModel(lowPath, { onProgress });

    lod.addLevel(highModel, 0);
    lod.addLevel(mediumModel, 2);
    lod.addLevel(lowModel, 5);
    lod.addLevel(new THREE.Group(), 15);
  } catch (error) {
    console.warn('Failed to load LOD models, using placeholder', error);
  }

  return lod;
};

export const prepareMesh = (
  mesh: THREE.Mesh,
  options: { organId?: string; layer?: string; muscleLevel?: number } = {}
): void => {
  mesh.userData = {
    ...mesh.userData,
    organId: options.organId,
    layer: options.layer,
    muscleLevel: options.muscleLevel,
  };

  mesh.castShadow = true;
  mesh.receiveShadow = true;
};

export const traverseAndPrepare = (
  object: THREE.Object3D,
  options: { organId?: string; layer?: string; muscleLevel?: number } = {}
): void => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      prepareMesh(child, options);
    }
  });
};
