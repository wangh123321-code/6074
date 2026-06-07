import { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  AlertCircle,
  BookOpen,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import diseasesData from '../../data/diseases.json';
import { Disease } from '../../types/anatomy';

const diseases = diseasesData as Disease[];

export const RightPanel = () => {
  const selectedOrgan = useAnatomyStore((state) => state.selectedOrgan);
  const selectOrgan = useAnatomyStore((state) => state.selectOrgan);
  const isPathologyMode = useAnatomyStore((state) => state.isPathologyMode);
  const setPathologyMode = useAnatomyStore((state) => state.setPathologyMode);
  const currentDisease = useAnatomyStore((state) => state.currentDisease);
  const setCurrentDisease = useAnatomyStore((state) => state.setCurrentDisease);

  const [expandedSection, setExpandedSection] = useState<string | null>('info');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const relatedDiseases = selectedOrgan
    ? diseases.filter((d) => d.organId === selectedOrgan.id)
    : [];

  if (!selectedOrgan) {
    return (
      <aside className="absolute right-4 top-20 bottom-20 w-80 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden z-30 flex flex-col items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
            <Activity size={28} className="text-slate-500" />
          </div>
          <h3 className="text-white font-medium mb-2">选择器官查看详情</h3>
          <p className="text-slate-400 text-sm">
            使用选择工具点击模型上的任意器官，查看详细的解剖学信息、生理功能和常见疾病。
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="absolute right-4 top-20 bottom-20 w-80 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden z-30 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedOrgan.color }}
              />
              <h3 className="text-white font-bold text-lg">{selectedOrgan.name}</h3>
            </div>
            <p className="text-slate-400 text-sm italic">{selectedOrgan.latinName}</p>
          </div>
          <button
            onClick={() => selectOrgan(null)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="border-b border-slate-700/50">
          <button
            onClick={() => toggleSection('info')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-white font-medium">
              <BookOpen size={16} className="text-teal-400" />
              <span>生理功能</span>
            </div>
            {expandedSection === 'info' ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {expandedSection === 'info' && (
            <div className="px-4 pb-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedOrgan.physiology}
              </p>
            </div>
          )}
        </div>

        <div className="border-b border-slate-700/50">
          <button
            onClick={() => toggleSection('diseases')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-white font-medium">
              <AlertCircle size={16} className="text-red-400" />
              <span>常见疾病</span>
              {relatedDiseases.length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {relatedDiseases.length}
                </span>
              )}
            </div>
            {expandedSection === 'diseases' ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {expandedSection === 'diseases' && (
            <div className="px-4 pb-4 space-y-2">
              {selectedOrgan.commonDiseases.map((disease, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <span className="text-slate-300 text-sm">{disease}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-slate-700/50">
          <button
            onClick={() => toggleSection('clinical')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-white font-medium">
              <Stethoscope size={16} className="text-cyan-400" />
              <span>临床意义</span>
            </div>
            {expandedSection === 'clinical' ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {expandedSection === 'clinical' && (
            <div className="px-4 pb-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedOrgan.clinicalSignificance}
              </p>
            </div>
          )}
        </div>

        {relatedDiseases.length > 0 && (
          <div className="border-b border-slate-700/50">
            <button
              onClick={() => toggleSection('pathology')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-white font-medium">
                <Heart size={16} className="text-pink-400" />
                <span>病变演示</span>
              </div>
              {expandedSection === 'pathology' ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </button>
            {expandedSection === 'pathology' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">启用病变模式</span>
                  <button
                    onClick={() => setPathologyMode(!isPathologyMode)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      isPathologyMode ? 'bg-pink-500' : 'bg-slate-600'
                    } relative`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        isPathologyMode ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {isPathologyMode && (
                  <div className="space-y-2">
                    <p className="text-slate-400 text-xs">选择疾病查看对比：</p>
                    {relatedDiseases.map((disease) => (
                      <button
                        key={disease.id}
                        onClick={() => setCurrentDisease(currentDisease?.id === disease.id ? null : disease)}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                          currentDisease?.id === disease.id
                            ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        {disease.name}
                      </button>
                    ))}
                  </div>
                )}

                {currentDisease && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-2">
                    <h5 className="text-white font-medium text-sm">
                      {currentDisease.name}
                    </h5>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {currentDisease.description}
                    </p>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">常见症状：</p>
                      <div className="flex flex-wrap gap-1">
                        {currentDisease.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">治疗方案：</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {currentDisease.treatment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
