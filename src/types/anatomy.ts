export type LayerType = 'skin' | 'muscle' | 'bone' | 'organ' | 'vessel';

export type ToolType = 'select' | 'scalpel' | 'rotate' | 'pan' | 'zoom';

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
