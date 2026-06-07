import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { AnnotationPoint } from '../../types/anatomy';
import { MapPin, Edit3, Trash2 } from 'lucide-react';

interface AnnotationMarkerProps {
  annotation: AnnotationPoint;
  screenPosition: { x: number; y: number } | null;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const AnnotationMarker = ({
  annotation,
  screenPosition,
  isSelected,
  onClick,
  onDelete,
  onEdit,
}: AnnotationMarkerProps) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!screenPosition) return null;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto z-20 will-change-transform"
      style={{
        left: screenPosition.x,
        top: screenPosition.y,
      }}
    >
      <div
        className={`relative cursor-pointer transition-transform duration-150 ${
          isSelected ? 'scale-125' : 'hover:scale-110'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (isSelected) {
            setShowMenu(!showMenu);
          } else {
            onClick();
          }
        }}
      >
        <MapPin
          size={28}
          className={`drop-shadow-lg ${isSelected ? 'animate-pulse' : ''}`}
          style={{ color: annotation.color, filter: `drop-shadow(0 0 8px ${annotation.color}80)` }}
        />
        {annotation.text && !showMenu && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900/90 backdrop-blur-sm rounded text-white text-xs whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-slate-700/50">
            {annotation.text}
          </div>
        )}
      </div>

      {showMenu && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700/50 p-1 flex gap-1 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setShowMenu(false);
            }}
            className="p-1.5 rounded hover:bg-slate-700/50 text-slate-300 hover:text-teal-400 transition-colors"
            title="编辑"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="p-1.5 rounded hover:bg-slate-700/50 text-slate-300 hover:text-red-400 transition-colors"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export const AnnotationMarkers = () => {
  const { camera, scene } = useThree();
  const annotations = useAnnotationStore((state) => state.annotations);
  const selectedAnnotationId = useAnnotationStore((state) => state.selectedAnnotationId);
  const deleteAnnotation = useAnnotationStore((state) => state.deleteAnnotation);
  const [editingAnnotation, setEditingAnnotation] = useState<AnnotationPoint | null>(null);
  const [editText, setEditText] = useState('');

  const screenPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [, forceUpdate] = useState({});
  const vectorRef = useRef(new THREE.Vector3());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    canvasRef.current = document.querySelector('canvas');
  }, []);

  const updateScreenPositions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || annotations.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const vector = vectorRef.current;
    let hasChanges = false;

    annotations.forEach((annotation) => {
      vector.set(...annotation.position);
      vector.project(camera);

      if (vector.z > -1 && vector.z < 1) {
        const x = ((vector.x + 1) / 2) * rect.width;
        const y = ((-vector.y + 1) / 2) * rect.height;
        const current = screenPositionsRef.current.get(annotation.id);

        if (!current || Math.abs(current.x - x) > 1 || Math.abs(current.y - y) > 1) {
          screenPositionsRef.current.set(annotation.id, { x, y });
          hasChanges = true;
        }
      } else {
        if (screenPositionsRef.current.has(annotation.id)) {
          screenPositionsRef.current.delete(annotation.id);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      forceUpdate({});
    }
  }, [camera, annotations]);

  useFrame((_, delta) => {
    lastUpdateRef.current += delta;
    if (lastUpdateRef.current >= 0.033) {
      updateScreenPositions();
      lastUpdateRef.current = 0;
    }
  });

  const handleEdit = useCallback((annotation: AnnotationPoint) => {
    setEditingAnnotation(annotation);
    setEditText(annotation.text);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingAnnotation) {
      useAnnotationStore.getState().updateAnnotation(editingAnnotation.id, { text: editText });
      setEditingAnnotation(null);
    }
  }, [editingAnnotation, editText]);

  const handleJumpTo = useCallback((annotationId: string) => {
    useAnnotationStore.getState().jumpToAnnotation(annotationId);
  }, []);

  const memoizedMarkers = useMemo(() => {
    return annotations.map((annotation) => (
      <AnnotationMarker
        key={annotation.id}
        annotation={annotation}
        screenPosition={screenPositionsRef.current.get(annotation.id) || null}
        isSelected={selectedAnnotationId === annotation.id}
        onClick={() => handleJumpTo(annotation.id)}
        onDelete={() => deleteAnnotation(annotation.id)}
        onEdit={() => handleEdit(annotation)}
      />
    ));
  }, [annotations, selectedAnnotationId, handleJumpTo, deleteAnnotation, handleEdit]);

  return (
    <>
      {memoizedMarkers}

      {editingAnnotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingAnnotation(null)}>
          <div
            className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 w-96 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-4">编辑标注</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="输入标注文字..."
              className="w-full h-24 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-teal-500/50 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingAnnotation(null)}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all text-sm font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
