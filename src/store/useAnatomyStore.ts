import { create } from 'zustand';
import {
  AnatomyState,
  AnatomyActions,
  DEFAULT_LAYERS,
  LayerType,
  MuscleLevel,
  Organ,
  Disease,
  ToolType,
} from '../types/anatomy';

const initialState: AnatomyState = {
  currentTool: 'select',
  selectedOrgan: null,
  hoveredOrgan: null,
  layers: { ...DEFAULT_LAYERS },
  isPathologyMode: false,
  currentDisease: null,
  isPaused: false,
  isLoading: false,
  loadingProgress: 100,
  cutPlanes: [],
};

export const useAnatomyStore = create<AnatomyState & AnatomyActions>((set) => ({
  ...initialState,

  setCurrentTool: (tool: ToolType) => set({ currentTool: tool }),

  selectOrgan: (organ: Organ | null) => set({ selectedOrgan: organ }),

  hoverOrgan: (organ: Organ | null) => set({ hoveredOrgan: organ }),

  setLayerVisible: (layer: LayerType, visible: boolean) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: { ...state.layers[layer], visible },
      },
    })),

  setLayerOpacity: (layer: LayerType, opacity: number) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: { ...state.layers[layer], opacity },
      },
    })),

  setSkinTranslucent: (translucent: boolean) =>
    set((state) => ({
      layers: {
        ...state.layers,
        skin: { ...state.layers.skin, translucent },
      },
    })),

  setMuscleLevel: (level: MuscleLevel) =>
    set((state) => ({
      layers: {
        ...state.layers,
        muscle: { ...state.layers.muscle, level },
      },
    })),

  setBoneIsolated: (isolated: boolean) =>
    set((state) => ({
      layers: {
        ...state.layers,
        skin: { ...state.layers.skin, visible: !isolated },
        muscle: { ...state.layers.muscle, visible: !isolated },
        organ: { ...state.layers.organ, visible: !isolated },
        vessel: { ...state.layers.vessel, visible: !isolated },
        bone: { ...state.layers.bone, isolated, visible: true },
      },
    })),

  setPathologyMode: (enabled: boolean) => set({ isPathologyMode: enabled }),

  setCurrentDisease: (disease: Disease | null) => set({ currentDisease: disease }),

  setPaused: (paused: boolean) => set({ isPaused: paused }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setLoadingProgress: (progress: number) => set({ loadingProgress: progress }),

  resetLayers: () =>
    set({
      layers: { ...DEFAULT_LAYERS },
      cutPlanes: [],
    }),

  resetView: () =>
    set({
      selectedOrgan: null,
      hoveredOrgan: null,
      cutPlanes: [],
    }),

  addCutPlane: (normal: [number, number, number], constant: number) =>
    set((state) => ({
      cutPlanes: [...state.cutPlanes, { normal, constant }],
    })),

  clearCutPlanes: () => set({ cutPlanes: [] }),
}));

if (typeof window !== 'undefined') {
  (window as any).__anatomyStore = useAnatomyStore;
}
