import { useEffect, useState, useRef } from 'react';

export const FPSMonitor = () => {
  const [fps, setFps] = useState(60);
  const [isVisible, setIsVisible] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 500) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(updateFPS);
    };

    animationFrameRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const getFpsColor = () => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 45) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute top-20 right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50 z-40 font-mono">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs">FPS:</span>
        <span className={`text-sm font-bold ${getFpsColor()}`}>{fps}</span>
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5">
        Ctrl+Shift+F 切换显示
      </div>
    </div>
  );
};
