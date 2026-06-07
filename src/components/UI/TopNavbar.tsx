import { Maximize2, Minimize2, HelpCircle, Download, Settings } from 'lucide-react';
import { useState } from 'react';

export const TopNavbar = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `cat-anatomy-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5 text-white"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 22v-4" />
            <path d="M12 6V2" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">猫咪3D解剖教学系统</h1>
          <p className="text-slate-400 text-xs">Interactive Feline Anatomy System</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleScreenshot}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
          title="保存截图"
        >
          <Download size={18} />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
          title={isFullscreen ? '退出全屏' : '全屏显示'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
          title="帮助"
        >
          <HelpCircle size={18} />
        </button>
        <div className="w-px h-6 bg-slate-700 mx-2" />
        <button
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all"
          title="设置"
        >
          <Settings size={18} />
        </button>
      </div>
    </nav>
  );
};
