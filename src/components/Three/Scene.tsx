import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  ContactShadows,
} from '@react-three/drei';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import { CatModel } from './CatModel';
import { ScalpelTool } from './ScalpelTool';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { useVisibilityChange } from '../../hooks/useVisibilityChange';
import { useOrganPicker } from '../../hooks/useOrganPicker';
import { useLayerControl } from '../../hooks/useLayerControl';
import { CAMERA_PRESETS, CameraPresetKey, CameraView } from '../../types/anatomy';
import { AnnotationMarkers } from '../Annotation/AnnotationMarkers';
import { AddAnnotationModal } from '../Annotation/AddAnnotationModal';

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight args={[0xffffff, 0x444444, 0.5]} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.4} />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        intensity={0.6}
        castShadow
        penumbra={1}
      />
    </>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    (window as any).__camera = camera;
    (window as any).__controls = controlsRef.current;
  }, [camera]);

  useEffect(() => {
    const applyPreset = (presetKey: string) => {
      const preset = CAMERA_PRESETS[presetKey as CameraPresetKey];
      if (preset && controlsRef.current) {
        controlsRef.current.target.set(...preset.target);
        camera.position.set(...preset.position);
        controlsRef.current.update();
      }
    };

    const applyCameraView = (view: CameraView) => {
      if (controlsRef.current) {
        controlsRef.current.target.set(...view.target);
        camera.position.set(...view.position);
        controlsRef.current.update();
      }
    };

    const getCurrentCameraView = (): CameraView => {
      return {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [
          controlsRef.current?.target.x || 0,
          controlsRef.current?.target.y || 0.5,
          controlsRef.current?.target.z || 0,
        ],
      };
    };

    (window as any).__applyCameraPreset = applyPreset;
    (window as any).__applyCameraView = applyCameraView;
    (window as any).__getCurrentCameraView = getCurrentCameraView;

    return () => {
      delete (window as any).__applyCameraPreset;
      delete (window as any).__applyCameraView;
      delete (window as any).__getCurrentCameraView;
    };
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.5}
      maxDistance={10}
      maxPolarAngle={Math.PI * 0.9}
      minPolarAngle={0.1}
      target={[0, 0.5, 0]}
      makeDefault
    />
  );
};

const SceneContent = () => {
  const isPaused = useAnatomyStore((state) => state.isPaused);
  const currentTool = useAnatomyStore((state) => state.currentTool);
  const selectedOrgan = useAnatomyStore((state) => state.selectedOrgan);
  const { handlePointerMove, handleClick } = useOrganPicker();
  const { gl, scene, camera } = useThree();
  const [newAnnotation, setNewAnnotation] = useState<{
    position: [number, number, number];
    organId: string | null;
    cameraView: CameraView;
  } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressingRef = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useLayerControl();

  useEffect(() => {
    gl.localClippingEnabled = true;
    scene.background = new THREE.Color(0x0f172a);

    return () => {
      gl.localClippingEnabled = false;
    };
  }, [gl, scene]);

  const getIntersectedPoint = useCallback((event: PointerEvent): [number, number, number] | null => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.visible) {
        meshes.push(child);
      }
    });

    const intersects = raycaster.current.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      return [point.x, point.y, point.z];
    }
    return null;
  }, [camera, scene]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (currentTool !== 'annotate' && currentTool !== 'draw') return;

    isLongPressingRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressingRef.current = true;
      const position = getIntersectedPoint(event);
      const cameraView = (window as any).__getCurrentCameraView?.();

      if (position && cameraView) {
        setNewAnnotation({
          position,
          organId: selectedOrgan?.id || null,
          cameraView,
        });
      }
    }, 500);
  }, [currentTool, getIntersectedPoint, selectedOrgan]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setTimeout(() => {
      isLongPressingRef.current = false;
    }, 100);
  }, []);

  const handleClickWithLongPress = useCallback((event: PointerEvent) => {
    if (isLongPressingRef.current) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    if (currentTool === 'select') {
      handleClick(event);
    }
  }, [currentTool, handleClick]);

  const handlePointerMoveWithLongPress = useCallback((event: PointerEvent) => {
    if (isLongPressingRef.current) {
      return;
    }
    if (currentTool === 'select') {
      handlePointerMove(event);
    }
  }, [currentTool, handlePointerMove]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMoveWithLongPress);
    canvas.addEventListener('click', handleClickWithLongPress);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMoveWithLongPress);
      canvas.removeEventListener('click', handleClickWithLongPress);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [gl, handlePointerMoveWithLongPress, handleClickWithLongPress, handlePointerDown, handlePointerUp]);

  useFrame(({ clock }) => {
    if (isPaused) return;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.layer === 'vessel') {
        const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.02;
        child.scale.setScalar(pulse);
      }
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 3]} fov={45} near={0.01} far={1000} />
      <CameraController />
      <Lights />
      <CatModel />
      <ScalpelTool />
      <ContactShadows
        position={[0, -0.1, 0]}
        opacity={0.4}
        scale={5}
        blur={2}
        far={4}
      />
      <gridHelper
        args={[10, 10, 0x444444, 0x222222]}
        position={[0, -0.1, 0]}
        name="gridHelper"
      />
      <AnnotationMarkers />
      {newAnnotation && (
        <AddAnnotationModal
          position={newAnnotation.position}
          organId={newAnnotation.organId}
          cameraView={newAnnotation.cameraView}
          onClose={() => setNewAnnotation(null)}
        />
      )}
    </>
  );
};

const Scene3D = () => {
  useVisibilityChange();
  const isPaused = useAnatomyStore((state) => state.isPaused);
  const isLoading = useAnatomyStore((state) => state.isLoading);
  const loadingProgress = useAnatomyStore((state) => state.loadingProgress);

  const dpr = useMemo(() => {
    return Math.min(window.devicePixelRatio, 2);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        dpr={dpr}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          powerPreference: 'high-performance',
        }}
        frameloop="always"
      >
        <SceneContent />
      </Canvas>

      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50">
          <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-slate-300 text-sm">
            加载3D模型中... {Math.round(loadingProgress)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default Scene3D;
