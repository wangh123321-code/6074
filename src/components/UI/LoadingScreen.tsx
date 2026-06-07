import { useAnatomyStore } from '../../store/useAnatomyStore';

export const LoadingScreen = () => {
  const isLoading = useAnatomyStore((state) => state.isLoading);
  const loadingProgress = useAnatomyStore((state) => state.loadingProgress);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <div className="w-20 h-20 mb-8 relative">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
        <div
          className="absolute inset-0 border-4 border-transparent border-t-teal-500 rounded-full animate-spin"
          style={{ animationDuration: '1s' }}
        />
        <div className="absolute inset-2 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>
      <h2 className="text-white text-xl font-bold mb-2">猫咪3D解剖教学系统</h2>
      <p className="text-slate-400 text-sm mb-6">正在加载3D解剖模型...</p>
      <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      <p className="text-slate-500 text-xs mt-2">{Math.round(loadingProgress)}%</p>
    </div>
  );
};
