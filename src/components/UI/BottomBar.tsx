import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3, Info } from 'lucide-react';

const ZoomIndicator = () => {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const updateZoom = () => {
      const canvas = document.querySelector('canvas');
      if (canvas && (window as any).__camera) {
        const camera = (window as any).__camera;
        const distance = Math.sqrt(
          Math.pow(camera.position.x, 2) +
          Math.pow(camera.position.y - 0.5, 2) +
          Math.pow(camera.position.z, 2)
        );
        const normalized = Math.max(0, Math.min(100, ((10 - distance) / 9.5) * 100));
        setZoom(Math.round(normalized));
      }
    };

    updateZoom();
    const interval = setInterval(updateZoom, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <ZoomOut size={14} className="text-slate-400" />
      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-200"
          style={{ width: `${zoom}%` }}
        />
      </div>
      <ZoomIn size={14} className="text-slate-400" />
      <span className="text-slate-400 text-xs w-8">{zoom}%</span>
    </div>
  );
};

export const BottomBar = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    const grid = document.querySelector('.gridHelper') as any;
    if (grid) {
      grid.visible = !showGrid;
    }
  };

  const resetCamera = () => {
    if ((window as any).__applyCameraPreset) {
      (window as any).__applyCameraPreset('default');
    }
  };

  const zoomIn = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new WheelEvent('wheel', {
        deltaY: -100,
        bubbles: true,
      });
      canvas.dispatchEvent(event);
    }
  };

  const zoomOut = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new WheelEvent('wheel', {
        deltaY: 100,
        bubbles: true,
      });
      canvas.dispatchEvent(event);
    }
  };

  return (
    <>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-12 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 flex items-center gap-4 px-4 z-30">
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
            title="缩小"
          >
            <ZoomOut size={16} />
          </button>
          <ZoomIndicator />
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
            title="放大"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700" />

        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all text-sm"
          title="重置视图"
        >
          <RotateCcw size={14} />
          重置
        </button>

        <button
          onClick={toggleGrid}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
            showGrid
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
          title={showGrid ? '隐藏网格' : '显示网格'}
        >
          <Grid3X3 size={14} />
          网格
        </button>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all text-sm"
          title="操作帮助"
        >
          <Info size={14} />
          帮助
        </button>
      </div>

      {showHelp && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 z-40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">操作指南</h4>
            <button
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-300">
              <span>旋转视角</span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">鼠标左键拖拽</kbd>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>平移视角</span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">鼠标右键拖拽</kbd>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>缩放</span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">滚轮</kbd>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>选择器官</span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">点击模型</kbd>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>虚拟解剖</span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">解剖刀 + 拖拽</kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
