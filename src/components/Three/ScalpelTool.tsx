import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useAnatomyStore } from '../../store/useAnatomyStore';

export const ScalpelTool = () => {
  const { camera, scene, gl } = useThree();
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const lineRef = useRef<THREE.LineSegments>(null);
  const planeHelperRef = useRef<THREE.PlaneHelper>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const addCutPlane = useAnatomyStore((state) => state.addCutPlane);
  const currentTool = useAnatomyStore((state) => state.currentTool);
  const cutPlanes = useAnatomyStore((state) => state.cutPlanes);

  const updateLine = useCallback(() => {
    if (lineRef.current && points.length > 1) {
      const positions = new Float32Array(points.length * 3);
      points.forEach((p, i) => {
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      });
      lineRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      lineRef.current.geometry.computeBoundingSphere();
    }
  }, [points]);

  useEffect(() => {
    updateLine();
  }, [points, updateLine]);

  const getIntersectionPoint = useCallback(
    (event: PointerEvent): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      const skinMeshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.layer === 'skin') {
          skinMeshes.push(child);
        }
      });

      const intersects = raycaster.current.intersectObjects(skinMeshes, false);
      if (intersects.length > 0) {
        return intersects[0].point.clone();
      }

      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1);
      const point = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane, point);
      return point;
    },
    [camera, scene, gl]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (currentTool !== 'scalpel') return;
      event.preventDefault();

      const point = getIntersectionPoint(event);
      if (point) {
        setIsDrawing(true);
        setPoints([point]);
      }
    },
    [currentTool, getIntersectionPoint]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDrawing || currentTool !== 'scalpel') return;
      event.preventDefault();

      const point = getIntersectionPoint(event);
      if (point) {
        setPoints((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (lastPoint && lastPoint.distanceTo(point) > 0.01) {
            return [...prev, point];
          }
          return prev;
        });
      }
    },
    [isDrawing, currentTool, getIntersectionPoint]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || points.length < 2) {
      setIsDrawing(false);
      setPoints([]);
      return;
    }

    const v1 = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    const normal = new THREE.Vector3().crossVectors(v1, cameraDir).normalize();

    const center = points.reduce(
      (acc, p) => acc.add(p),
      new THREE.Vector3()
    ).divideScalar(points.length);
    const constant = -normal.dot(center);

    addCutPlane(
      [normal.x, normal.y, normal.z],
      constant
    );

    if (planeHelperRef.current) {
      scene.remove(planeHelperRef.current);
    }
    const plane = new THREE.Plane(normal, constant);
    const helper = new THREE.PlaneHelper(plane, 2, 0x00ff00);
    planeHelperRef.current = helper;
    scene.add(helper);

    setIsDrawing(false);
    setPoints([]);
  }, [isDrawing, points, camera, addCutPlane, scene]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp]);

  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.visible = currentTool === 'scalpel' && isDrawing;
    }
  });

  return (
    <>
      <lineSegments ref={lineRef} visible={false}>
        <bufferGeometry />
        <lineBasicMaterial color={0xff4444} linewidth={3} transparent opacity={0.8} />
      </lineSegments>
    </>
  );
};
