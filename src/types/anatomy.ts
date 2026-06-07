export type LayerType = 'skin' | 'muscle' | 'bone' | 'organ' | 'vessel';



export type MuscleLevel = 0 | 1 | 2 | 3;

export interface Organ {
  id: string;
  name: string;
  latinName: string;
  layer: LayerType;
  meshName: string;
  position: [number, number, number];
  physiology: string;
  commonDiseases: string[];
  clinicalSignificance: string;
  color: string;
}

export interface Disease {
  id: string;
  name: string;
  organId: string;
  description: string;
  symptoms: string[];
  normalModelPath: string;
  diseasedModelPath: string;
  treatment: string;
}

export interface LayerState {
  skin: { visible: boolean; opacity: number; translucent: boolean };
  muscle: { visible: boolean; opacity: number; level: MuscleLevel };
  bone: { visible: boolean; opacity: number; isolated: boolean };
  organ: { visible: boolean; opacity: number };
  vessel: { visible: boolean; opacity: number };
}

export interface AnatomyState {
  currentTool: ToolType;
  selectedOrgan: Organ | null;
  hoveredOrgan: Organ | null;
  layers: LayerState;
  isPathologyMode: boolean;
  currentDisease: Disease | null;
  isPaused: boolean;
  isLoading: boolean;
  loadingProgress: number;
  cutPlanes: Array<{ normal: [number, number, number]; constant: number }>;
}

export interface AnatomyActions {
  setCurrentTool: (tool: ToolType) => void;
  selectOrgan: (organ: Organ | null) => void;
  hoverOrgan: (organ: Organ | null) => void;
  setLayerVisible: (layer: LayerType, visible: boolean) => void;
  setLayerOpacity: (layer: LayerType, opacity: number) => void;
  setSkinTranslucent: (translucent: boolean) => void;
  setMuscleLevel: (level: MuscleLevel) => void;
  setBoneIsolated: (isolated: boolean) => void;
  setPathologyMode: (enabled: boolean) => void;
  setCurrentDisease: (disease: Disease | null) => void;
  setPaused: (paused: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  resetLayers: () => void;
  resetView: () => void;
  addCutPlane: (normal: [number, number, number], constant: number) => void;
  clearCutPlanes: () => void;
}

export const DEFAULT_LAYERS: LayerState = {
  skin: { visible: true, opacity: 1, translucent: false },
  muscle: { visible: true, opacity: 1, level: 3 },
  bone: { visible: true, opacity: 1, isolated: false },
  organ: { visible: true, opacity: 1 },
  vessel: { visible: false, opacity: 0.8 },
};

export const CAMERA_PRESETS = {
  default: { position: [0, 1.5, 3] as [number, number, number], target: [0, 0.5, 0] as [number, number, number] },
  front: { position: [0, 0.5, 3] as [number, number, number], target: [0, 0.5, 0] as [number, number, number] },
  side: { position: [3, 0.5, 0] as [number, number, number], target: [0, 0.5, 0] as [number, number, number] },
  top: { position: [0, 3, 0.1] as [number, number, number], target: [0, 0.5, 0] as [number, number, number] },
  internal: { position: [0, 0.5, 1.5] as [number, number, number], target: [0, 0.5, 0] as [number, number, number] },
};

export type CameraPresetKey = keyof typeof CAMERA_PRESETS;

export interface CameraView {
  position: [number, number, number];
  target: [number, number, number];
}

export interface AnnotationPoint {
  id: string;
  organId: string | null;
  position: [number, number, number];
  screenPosition?: { x: number; y: number };
  text: string;
  color: string;
  createdAt: number;
  cameraView: CameraView;
  drawingData?: DrawingData;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  lineWidth: number;
}

export interface DrawingData {
  strokes: DrawingStroke[];
  width: number;
  height: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  organId: string | null;
  tags: string[];
  annotationIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type ToolType = 'select' | 'scalpel' | 'rotate' | 'pan' | 'zoom' | 'annotate' | 'draw';

export interface AnnotationState {
  annotations: AnnotationPoint[];
  notes: Note[];
  selectedAnnotationId: string | null;
  selectedNoteId: string | null;
  isAddingAnnotation: boolean;
  isDrawing: boolean;
  drawingColor: string;
  drawingLineWidth: number;
  noteFilter: {
    organId: string | null;
    searchText: string;
    tags: string[];
  };
  showNotesPanel: boolean;
}

export interface AnnotationActions {
  addAnnotation: (annotation: Omit<AnnotationPoint, 'id' | 'createdAt'>) => void;
  updateAnnotation: (id: string, updates: Partial<AnnotationPoint>) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  setIsAddingAnnotation: (adding: boolean) => void;
  setIsDrawing: (drawing: boolean) => void;
  setDrawingColor: (color: string) => void;
  setDrawingLineWidth: (width: number) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  setNoteFilter: (filter: Partial<AnnotationState['noteFilter']>) => void;
  setShowNotesPanel: (show: boolean) => void;
  jumpToAnnotation: (annotationId: string) => void;
}

export const DRAWING_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ffffff',
];

export const DRAWING_LINE_WIDTHS = [1, 2, 3, 4, 6, 8];
