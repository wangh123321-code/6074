import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Layers,
  MousePointer,
  Scissors,
  Move,
  ZoomIn,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Activity,
  Home,
  User,
  Camera,
} from 'lucide-react';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import { ToolType, LayerType, MuscleLevel } from '../../types/anatomy';

const tools: { id: ToolType; label: string; icon: React.ElementType }[] = [
  { id: 'select', label: '选择', icon: MousePointer },
  { id: 'scalpel', label: '解剖刀', icon: Scissors },
  { id: 'rotate', label: '旋转', icon: RotateCcw },
  { id: 'pan', label: '平移', icon: Move },
  { id: 'zoom', label: '缩放', icon: ZoomIn },
];

const layerConfig: { id: LayerType; label: string; color: string }[] = [
  { id: 'skin', label: '皮肤', color: '#d4a574' },
  { id: 'muscle', label: '肌肉', color: '#b91c1c' },
  { id: 'bone', label: '骨骼', color: '#e8dcc8' },
  { id: 'organ', label: '器官', color: '#c44536' },
  { id: 'vessel', label: '血管', color: '#dc2626' },
];

const viewPresets = [
  { id: 'default', label: '默认视图', icon: Home },
  { id: 'front', label: '前面观', icon: User },
  { id: 'side', label: '侧面观', icon: User },
  { id: 'top', label: '上面观', icon: Camera },
  { id: 'internal', label: '内部观', icon: Activity },
];

export const LeftPanel = () => {
  const currentTool = useAnatomyStore((state) => state.currentTool);
  const setCurrentTool = useAnatomyStore((state) => state.setCurrentTool);
  const layers = useAnatomyStore((state) => state.layers);
  const setLayerVisible = useAnatomyStore((state) => state.setLayerVisible);
  const setLayerOpacity = useAnatomyStore((state) => state.setLayerOpacity);
  const setSkinTranslucent = useAnatomyStore((state) => state.setSkinTranslucent);
  const setMuscleLevel = useAnatomyStore((state) => state.setMuscleLevel);
  const setBoneIsolated = useAnatomyStore((state) => state.setBoneIsolated);
  const resetLayers = useAnatomyStore((state) => state.resetLayers);
  const clearCutPlanes = useAnatomyStore((state) => state.clearCutPlanes);

  const [expandedSection, setExpandedSection] = useState<string | null>('tools');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const applyViewPreset = (presetId: string) => {
    if ((window as any).__applyCameraPreset) {
      (window as any).__applyCameraPreset(presetId);
    }
  };

  const handleReset = () => {
    resetLayers();
    clearCutPlanes();
    applyViewPreset('default');
  };

  return (
    <aside className="absolute left-4 top-20 bottom-20 w-64 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden z-30 flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="border-b border-slate-700/50">
          <button
            onClick={() => toggleSection('tools')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-white font-medium">
              <MousePointer size={16} className="text-teal-400" />
              <span>工具</span>
            </div>
            {expandedSection === 'tools' ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {expandedSection === 'tools' && (
            <div className="px-3 pb-3">
              <div className="grid grid-cols-5 gap-1">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = currentTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setCurrentTool(tool.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                      title={tool.label}
                    >
                      <Icon size={18} />
                      <span className="text-[10px] mt-1">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-slate-700/50">
          <button
            onClick={() => toggleSection('layers')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-white font-medium">
              <Layers size={16} className="text-cyan-400" />
              <span>分层显示</span>
            </div>
            {expandedSection === 'layers' ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {expandedSection === 'layers' && (
            <div className="px-3 pb-3 space-y-3">
              {layerConfig.map((layer) => {
                const layerState = layers[layer.id];
                return (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: layer.color }}
                        />
                        <span className="text-slate-300 text-sm">{layer.label}</span>
                      </div>
                      <button
                        onClick={() => setLayerVisible(layer.id, !layerState.visible)}
                        className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        {layerState.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                    {layerState.visible && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layerState.opacity * 100}
                        onChange={(e) =>
                          setLayerOpacity(layer.id, Number(e.target.value) / 100)
                        }
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    )}
                  </div>
                );
              })}

              <div className="pt-2 border-t border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">皮肤半透明</span>
                  <button
                    onClick={() => setSkinTranslucent(!layers.skin.translucent)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      layers.skin.translucent ? 'bg-teal-500' : 'bg-slate-600'
                    } relative`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        layers.skin.translucent ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">肌肉层次</span>
                    <span className="text-slate-400 text-xs">
                      层级 {layers.muscle.level}/3
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {([0, 1, 2, 3] as MuscleLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setMuscleLevel(level)}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                          layers.muscle.level === level
                            ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {level === 0 ? '全部隐藏' : `第${level}层`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">骨骼单独显示</span>
                  <button
                    onClick={() => setBoneIsolated(!layers.bone.isolated)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      layers.bone.isolated ? 'bg-teal-500' : 'bg-slate-600'
                    } relative`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        layers.bone.isolated ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-slate-700/50">
          <button
            onClick={() => toggleSection('views')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-white font-medium">
              <Camera size={16} className="text-purple-400" />
              <span>视图预设</span>
            </div>
            {expandedSection === 'views' ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {expandedSection === 'views' && (
            <div className="px-3 pb-3 space-y-1">
              {viewPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyViewPreset(preset.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all text-sm"
                  >
                    <Icon size={14} className="text-slate-400" />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm"
        >
          <RotateCcw size={14} />
          重置视图
        </button>
      </div>
    </aside>
  );
};
