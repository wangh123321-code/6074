import { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingStroke, DrawingData, DRAWING_COLORS, DRAWING_LINE_WIDTHS } from '../../types/anatomy';
import { useAnnotationStore } from '../../store/useAnnotationStore';

interface DrawingCanvasProps {
  width: number;
  height: number;
  onDrawingComplete?: (data: DrawingData) => void;
  onCancel?: () => void;
  initialData?: DrawingData | null;
  readOnly?: boolean;
}

export const DrawingCanvas = ({
  width,
  height,
  onDrawingComplete,
  onCancel,
  initialData,
  readOnly = false,
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const drawingColor = useAnnotationStore((state) => state.drawingColor);
  const drawingLineWidth = useAnnotationStore((state) => state.drawingLineWidth);
  const setDrawingColor = useAnnotationStore((state) => state.setDrawingColor);
  const setDrawingLineWidth = useAnnotationStore((state) => state.setDrawingLineWidth);

  useEffect(() => {
    if (initialData) {
      setStrokes(initialData.strokes);
    }
  }, [initialData]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.9;

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length - 1; i++) {
      const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
      const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
    }

    if (stroke.points.length >= 2) {
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
    }

    ctx.stroke();
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    e.preventDefault();

    const point = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentStroke({
      points: [point],
      color: drawingColor,
      lineWidth: drawingLineWidth,
    });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke || readOnly) return;
    e.preventDefault();

    const point = getCanvasCoordinates(e);
    setCurrentStroke((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  };

  const handleEnd = () => {
    if (!isDrawing || !currentStroke || readOnly) return;

    if (currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (onDrawingComplete) {
      onDrawingComplete({
        strokes,
        width,
        height,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {!readOnly && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">颜色：</span>
            <div className="flex gap-1">
              {DRAWING_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setDrawingColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    drawingColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">粗细：</span>
            <div className="flex gap-1">
              {DRAWING_LINE_WIDTHS.map((width) => (
                <button
                  key={width}
                  onClick={() => setDrawingLineWidth(width)}
                  className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                    drawingLineWidth === width
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{ width: width + 2, height: width + 2 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className={`w-full h-auto ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
          style={{ touchAction: 'none' }}
        />
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-lg transition-all text-sm"
            >
              撤销
            </button>
            <button
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-lg transition-all text-sm"
            >
              清除
            </button>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm"
              >
                取消
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all text-sm font-medium"
            >
              保存绘制
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
