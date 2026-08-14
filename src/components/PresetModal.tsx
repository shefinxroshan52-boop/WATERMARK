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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#111112] border border-[#2a2a2c] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2a2a2c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1a1a1c] text-[#6366f1] border border-[#2a2a2c]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Sample Watermarked Images</h3>
              <p className="text-xs text-[#a1a1aa]">
                Choose a preset to instantly test OpenCV & AI watermark removal algorithms.
              </p>
            </div>
          </div>

          <button
            id="close-presets-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#1f1f21] transition-colors"
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
                    ? 'bg-[#1a1a1c] border-[#6366f1] shadow-lg'
                    : 'bg-[#161618] border-[#2a2a2c] hover:border-[#3a3a3c] hover:bg-[#1f1f21]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2a2a2c] text-[#a1a1aa] border border-[#3a3a3c]">
                      {preset.category}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-900/40">
                      {preset.badge}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-[#e2e2e4] group-hover:text-white transition-colors">
                    {preset.title}
                  </h4>

                  <p className="text-xs text-[#a1a1aa] line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#2a2a2c] flex items-center justify-between text-xs">
                  {preset.watermarkText && (
                    <span className="font-mono text-[11px] text-[#71717a] truncate max-w-[160px]">
                      "{preset.watermarkText}"
                    </span>
                  )}
                  <span className="font-medium text-[#6366f1] flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-auto text-xs">
                    <span>Load Preset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a2c] bg-[#161618] flex items-center justify-between text-xs text-[#71717a]">
          <span>You can also upload your own image files anytime.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#2a2a2c] hover:bg-[#3a3a3c] text-[#e2e2e4] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
