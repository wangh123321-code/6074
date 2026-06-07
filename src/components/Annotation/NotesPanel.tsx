import { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Search,
  Tag,
  BookOpen,
  MapPin,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Filter,
} from 'lucide-react';
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import { Note, AnnotationPoint } from '../../types/anatomy';
import organsData from '../../data/organs.json';
import { Organ } from '../../types/anatomy';

const organs = organsData as Organ[];
const allTags = ['重要', '易错点', '考试重点', '临床相关', '待复习', '已掌握'];

export const NotesPanel = () => {
  const showNotesPanel = useAnnotationStore((state) => state.showNotesPanel);
  const setShowNotesPanel = useAnnotationStore((state) => state.setShowNotesPanel);
  const notes = useAnnotationStore((state) => state.notes);
  const annotations = useAnnotationStore((state) => state.annotations);
  const addNote = useAnnotationStore((state) => state.addNote);
  const updateNote = useAnnotationStore((state) => state.updateNote);
  const deleteNote = useAnnotationStore((state) => state.deleteNote);
  const selectNote = useAnnotationStore((state) => state.selectNote);
  const selectedNoteId = useAnnotationStore((state) => state.selectedNoteId);
  const noteFilter = useAnnotationStore((state) => state.noteFilter);
  const setNoteFilter = useAnnotationStore((state) => state.setNoteFilter);
  const jumpToAnnotation = useAnnotationStore((state) => state.jumpToAnnotation);
  const selectedOrgan = useAnatomyStore((state) => state.selectedOrgan);

  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (noteFilter.organId && note.organId !== noteFilter.organId) {
        return false;
      }
      if (noteFilter.searchText) {
        const searchLower = noteFilter.searchText.toLowerCase();
        if (
          !note.title.toLowerCase().includes(searchLower) &&
          !note.content.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (noteFilter.tags.length > 0) {
        if (!noteFilter.tags.some((tag) => note.tags.includes(tag))) {
          return false;
        }
      }
      return true;
    });
  }, [notes, noteFilter]);

  const notesByOrgan = useMemo(() => {
    const grouped: Record<string, Note[]> = { unclassified: [] };
    filteredNotes.forEach((note) => {
      const key = note.organId || 'unclassified';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(note);
    });
    return grouped;
  }, [filteredNotes]);

  const handleAddNote = () => {
    setEditingNote({
      title: '',
      content: '',
      organId: selectedOrgan?.id || null,
      tags: [],
      annotationIds: [],
    });
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!editingNote || !editingNote.title) return;

    if (editingNote.id) {
      updateNote(editingNote.id, editingNote);
    } else {
      addNote(editingNote as Omit<Note, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsEditing(false);
    setEditingNote(null);
  };

  const handleToggleTag = (tag: string) => {
    if (!editingNote) return;
    const currentTags = editingNote.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setEditingNote({ ...editingNote, tags: newTags });
  };

  const handleToggleAnnotation = (annotationId: string) => {
    if (!editingNote) return;
    const currentIds = editingNote.annotationIds || [];
    const newIds = currentIds.includes(annotationId)
      ? currentIds.filter((id) => id !== annotationId)
      : [...currentIds, annotationId];
    setEditingNote({ ...editingNote, annotationIds: newIds });
  };

  const toggleFilterTag = (tag: string) => {
    const currentTags = noteFilter.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setNoteFilter({ tags: newTags });
  };

  const getOrganName = (organId: string | null) => {
    if (!organId) return '未分类';
    return organs.find((o) => o.id === organId)?.name || '未知器官';
  };

  const getAnnotation = (id: string): AnnotationPoint | undefined => {
    return annotations.find((a) => a.id === id);
  };

  if (!showNotesPanel) return null;

  return (
    <div className="absolute right-4 top-20 bottom-20 w-96 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden z-30 flex flex-col">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-purple-400" />
          <h3 className="text-white font-bold">学习笔记</h3>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
            {notes.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleAddNote}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="新建笔记"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setShowNotesPanel(false)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-slate-700/50 space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={noteFilter.searchText}
            onChange={(e) => setNoteFilter({ searchText: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 text-sm transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter size={14} />
            <span>筛选</span>
            {noteFilter.tags.length > 0 && (
              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                {noteFilter.tags.length}
              </span>
            )}
          </div>
          {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showFilters && (
          <div className="space-y-3 pt-2">
            <div>
              <p className="text-slate-400 text-xs mb-2">按器官筛选</p>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setNoteFilter({ organId: null })}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    !noteFilter.organId
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  全部
                </button>
                {organs.map((organ) => (
                  <button
                    key={organ.id}
                    onClick={() => setNoteFilter({ organId: organ.id })}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      noteFilter.organId === organ.id
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {organ.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs mb-2">按标签筛选</p>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilterTag(tag)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      noteFilter.tags.includes(tag)
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <Tag size={10} className="inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isEditing && editingNote ? (
          <div className="p-4 space-y-4">
            <h4 className="text-white font-medium text-sm">
              {editingNote.id ? '编辑笔记' : '新建笔记'}
            </h4>

            <div>
              <label className="text-slate-400 text-xs mb-1 block">标题</label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                placeholder="输入笔记标题..."
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1 block">关联器官</label>
              <select
                value={editingNote.organId || ''}
                onChange={(e) => setEditingNote({ ...editingNote, organId: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="">未分类</option>
                {organs.map((organ) => (
                  <option key={organ.id} value={organ.id}>
                    {organ.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1 block">内容</label>
              <textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                placeholder="记录学习心得..."
                className="w-full h-32 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-2 block">标签</label>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      editingNote.tags?.includes(tag)
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <Tag size={10} className="inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-2 block">关联标注点</label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {annotations.length === 0 ? (
                  <p className="text-slate-500 text-xs">暂无标注点</p>
                ) : (
                  annotations.map((ann) => (
                    <label
                      key={ann.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editingNote.annotationIds?.includes(ann.id) || false}
                        onChange={() => handleToggleAnnotation(ann.id)}
                        className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                      />
                      <MapPin size={12} style={{ color: ann.color }} />
                      <span className="text-slate-300 text-xs flex-1 truncate">
                        {ann.text || '无标题标注'}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingNote(null);
                }}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!editingNote.title}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2"
              >
                <Save size={14} />
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {Object.entries(notesByOrgan).map(([organId, organNotes]) => (
              <div key={organId} className="space-y-2">
                <h4 className="text-slate-400 text-xs font-medium px-1 flex items-center gap-2">
                  {organId !== 'unclassified' && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: organs.find((o) => o.id === organId)?.color,
                      }}
                    />
                  )}
                  {getOrganName(organId === 'unclassified' ? null : organId)}
                  <span className="text-slate-500">({organNotes.length})</span>
                </h4>
                {organNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`bg-slate-800/50 rounded-lg border transition-all cursor-pointer ${
                      selectedNoteId === note.id
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-slate-700/50 hover:border-slate-600/50'
                    }`}
                    onClick={() => selectNote(selectedNoteId === note.id ? null : note.id)}
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-white text-sm font-medium flex-1 truncate">
                          {note.title}
                        </h5>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note);
                            }}
                            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-purple-400 transition-colors"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-2">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-slate-700/50 text-slate-400 text-[10px] rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-slate-700/50 text-slate-500 text-[10px] rounded">
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    {selectedNoteId === note.id && note.annotationIds.length > 0 && (
                      <div className="px-3 pb-3 border-t border-slate-700/50 pt-2">
                        <p className="text-slate-400 text-[10px] mb-2">关联标注点：</p>
                        <div className="flex flex-wrap gap-1">
                          {note.annotationIds.map((annId) => {
                            const ann = getAnnotation(annId);
                            if (!ann) return null;
                            return (
                              <button
                                key={annId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  jumpToAnnotation(annId);
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-xs transition-colors group"
                              >
                                <MapPin size={10} style={{ color: ann.color }} />
                                <span className="text-slate-300 group-hover:text-white">
                                  {ann.text || '查看'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">暂无笔记</p>
                <button
                  onClick={handleAddNote}
                  className="mt-3 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors"
                >
                  创建第一条笔记
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
