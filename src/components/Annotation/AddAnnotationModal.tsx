import { useState } from 'react';
import { X, Pencil, Type } from 'lucide-react';
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import { CameraView, DrawingData, DRAWING_COLORS } from '../../types/anatomy';
import { DrawingCanvas } from './DrawingCanvas';

interface AddAnnotationModalProps {
  position: [number, number, number];
  organId: string | null;
  cameraView: CameraView;
  onClose: () => void;
}

export const AddAnnotationModal = ({
  position,
  organId,
  cameraView,
  onClose,
}: AddAnnotationModalProps) => {
  const [text, setText] = useState('');
  const [showDrawing, setShowDrawing] = useState(false);
  const [color, setColor] = useState(DRAWING_COLORS[0]);
  const [drawingData, setDrawingData] = useState<DrawingData | null>(null);

  const addAnnotation = useAnnotationStore((state) => state.addAnnotation);
  const selectedOrgan = useAnatomyStore((state) => state.selectedOrgan);

  const handleSave = () => {
    addAnnotation({
      organId,
      position,
      text,
      color,
      cameraView,
      drawingData: drawingData || undefined,
    });
    onClose();
  };

  const handleDrawingComplete = (data: DrawingData) => {
    setDrawingData(data);
    setShowDrawing(false);
  };

  if (showDrawing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 w-[600px] max-w-[90vw]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">手绘标注</h3>
            <button
              onClick={() => setShowDrawing(false)}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <DrawingCanvas
            width={500}
            height={300}
            onDrawingComplete={handleDrawingComplete}
            onCancel={() => setShowDrawing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 w-96 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">添加标注</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {selectedOrgan && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedOrgan.color }}
            />
            <span className="text-teal-300 text-sm">
              关联器官：{selectedOrgan.name}
            </span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">标注颜色</label>
            <div className="flex gap-2">
              {DRAWING_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">
              <div className="flex items-center gap-2">
                <Type size={14} />
                <span>文字备注</span>
              </div>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入标注文字..."
              className="w-full h-24 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {drawingData && (
            <div>
              <label className="text-slate-300 text-sm mb-2 block">手绘内容</label>
              <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <DrawingCanvas
                  width={400}
                  height={200}
                  initialData={drawingData}
                  readOnly
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm"
            >
              取消
            </button>
            <button
              onClick={() => setShowDrawing(true)}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all text-sm flex items-center gap-2"
            >
              <Pencil size={14} />
              {drawingData ? '重新绘制' : '添加手绘'}
            </button>
            <button
              onClick={handleSave}
              disabled={!text && !drawingData}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-medium"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
