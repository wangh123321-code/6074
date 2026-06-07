import { useSpring, SpringValue } from '@react-spring/three';
import * as THREE from 'three';

interface AnimateVisibilityOptions {
  from?: number;
  to?: number;
  duration?: number;
  delay?: number;
}

export const useAnimateVisibility = (
  isVisible: boolean,
  options: AnimateVisibilityOptions = {}
) => {
  const { from = 0, to = 1, duration = 300, delay = 0 } = options;

  const { opacity } = useSpring({
    opacity: isVisible ? to : from,
    config: {
      duration,
      tension: 280,
      friction: 60,
    },
    delay,
  });

  return opacity;
};

export const useAnimatePosition = (
  targetPosition: [number, number, number],
  options: { duration?: number; delay?: number } = {}
) => {
  const { duration = 500, delay = 0 } = options;

  const { position } = useSpring({
    position: targetPosition,
    config: {
      duration,
      tension: 120,
      friction: 14,
    },
    delay,
  });

  return position as unknown as SpringValue<[number, number, number]>;
};

export const useAnimateScale = (
  targetScale: number | [number, number, number],
  options: { duration?: number; delay?: number } = {}
) => {
  const { duration = 300, delay = 0 } = options;
  const scaleArray = Array.isArray(targetScale) ? targetScale : [targetScale, targetScale, targetScale];

  const { scale } = useSpring({
    scale: scaleArray as [number, number, number],
    config: {
      duration,
      tension: 300,
      friction: 20,
    },
    delay,
  });

  return scale as unknown as SpringValue<[number, number, number]>;
};

export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const easeInCubic = (t: number): number => {
  return t * t * t;
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const lerpVector3 = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  t: number
): THREE.Vector3 => {
  return new THREE.Vector3(
    lerp(start.x, end.x, t),
    lerp(start.y, end.y, t),
    lerp(start.z, end.z, t)
  );
};

export const animateWithRAF = (
  duration: number,
  callback: (progress: number, elapsed: number) => void,
  onComplete?: () => void
): (() => void) => {
  const startTime = performance.now();
  let animationId: number;

  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    callback(easedProgress, elapsed);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  };

  animationId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationId);
  };
};
