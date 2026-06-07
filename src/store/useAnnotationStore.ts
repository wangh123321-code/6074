import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AnnotationState,
  AnnotationActions,
  AnnotationPoint,
  Note,
  DRAWING_COLORS,
} from '../types/anatomy';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialState: AnnotationState = {
  annotations: [],
  notes: [],
  selectedAnnotationId: null,
  selectedNoteId: null,
  isAddingAnnotation: false,
  isDrawing: false,
  drawingColor: DRAWING_COLORS[0],
  drawingLineWidth: 2,
  noteFilter: {
    organId: null,
    searchText: '',
    tags: [],
  },
  showNotesPanel: false,
};

export const useAnnotationStore = create<AnnotationState & AnnotationActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addAnnotation: (annotation) => {
        const newAnnotation: AnnotationPoint = {
          ...annotation,
          id: generateId(),
          createdAt: Date.now(),
        };
        set((state) => ({
          annotations: [...state.annotations, newAnnotation],
          isAddingAnnotation: false,
        }));
      },

      updateAnnotation: (id, updates) =>
        set((state) => ({
        annotations: state.annotations.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      })),

      deleteAnnotation: (id) =>
        set((state) => ({
        annotations: state.annotations.filter((a) => a.id !== id),
        selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
      })),

      selectAnnotation: (id) => set({ selectedAnnotationId: id }),

      setIsAddingAnnotation: (adding) => set({ isAddingAnnotation: adding }),

      setIsDrawing: (drawing) => set({ isDrawing: drawing }),

      setDrawingColor: (color) => set({ drawingColor: color }),

      setDrawingLineWidth: (width) => set({ drawingLineWidth: width }),

      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },

      updateNote: (id, updates) =>
        set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
        ),
      })),

      deleteNote: (id) =>
        set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      })),

      selectNote: (id) => set({ selectedNoteId: id }),

      setNoteFilter: (filter) =>
        set((state) => ({
        noteFilter: { ...state.noteFilter, ...filter },
      })),

      setShowNotesPanel: (show) => set({ showNotesPanel: show }),

      jumpToAnnotation: (annotationId) => {
        const annotation = get().annotations.find((a) => a.id === annotationId);
        if (annotation && (window as any).__applyCameraView) {
          (window as any).__applyCameraView(annotation.cameraView);
        }
        set({ selectedAnnotationId: annotationId });
      },
    }),
    {
      name: 'anatomy-annotations',
      partialize: (state) => ({
        annotations: state.annotations,
        notes: state.notes,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).__annotationStore = useAnnotationStore;
}
