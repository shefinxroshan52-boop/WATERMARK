import React from 'react';
import { X, Sparkles, ArrowRight, Check } from 'lucide-react';
import { SAMPLE_PRESETS } from '../utils/sampleImages';
import { SamplePreset } from '../types';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: SamplePreset) => void;
  activePresetId?: string;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  activePresetId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Sample Watermarked Images</h3>
              <p className="text-xs text-slate-400">
                Choose a preset to instantly test OpenCV & AI watermark removal algorithms.
              </p>
            </div>
          </div>

          <button
            id="close-presets-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                id={`preset-card-${preset.id}`}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.category}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-800/40">
                      {preset.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {preset.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {preset.watermarkText && (
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-[160px]">
                      "{preset.watermarkText}"
                    </span>
                  )}
                  <span className="font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-auto">
                    <span>Load Preset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>You can also upload your own image files anytime.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
