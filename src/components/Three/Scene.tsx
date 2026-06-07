import { useRef, useEffect, useMemo } from 'react';
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
import { useVisibilityChange } from '../../hooks/useVisibilityChange';
import { useOrganPicker } from '../../hooks/useOrganPicker';
import { useLayerControl } from '../../hooks/useLayerControl';
import { CAMERA_PRESETS, CameraPresetKey } from '../../types/anatomy';

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

    (window as any).__applyCameraPreset = applyPreset;

    return () => {
      delete (window as any).__applyCameraPreset;
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
  const { handlePointerMove, handleClick } = useOrganPicker();
  const { gl, scene } = useThree();

  useLayerControl();

  useEffect(() => {
    gl.localClippingEnabled = true;
    scene.background = new THREE.Color(0x0f172a);

    return () => {
      gl.localClippingEnabled = false;
    };
  }, [gl, scene]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl, handlePointerMove, handleClick]);

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
