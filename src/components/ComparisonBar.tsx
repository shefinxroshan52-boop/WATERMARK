import React from 'react';
import { 
  Zap, 
  Sparkles, 
  Layers, 
  Maximize, 
  Split, 
  CheckCircle2, 
  Paintbrush, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { ImageState, ProcessingStats, ViewMode } from '../types';

interface ComparisonBarProps {
  imageState: ImageState | null;
  stats: ProcessingStats | null;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  zoom: number;
  onFitScreen: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  imageState,
  stats,
  viewMode,
  setViewMode,
  zoom,
  onFitScreen,
}) => {
  if (!imageState) return null;

  return (
    <footer className="h-10 border-t border-[#2a2a2c] bg-[#111112] px-4 flex items-center justify-between text-xs text-[#a1a1aa] select-none z-20 shrink-0">
      {/* Left: Image specs & stats */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-[11px] text-[#a1a1aa] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#6366f1]" />
          <span>
            {imageState.width} × {imageState.height} px
          </span>
        </span>

        {stats && (
          <span className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <Zap className="w-3.5 h-3.5" />
            <span>
              Inpainted in {stats.timeMs}ms ({stats.method})
            </span>
          </span>
        )}
      </div>

      {/* Center: View mode quick buttons */}
      {imageState.resultSrc && (
        <div className="flex items-center gap-1 bg-[#161618] p-0.5 rounded-lg border border-[#2a2a2c]">
          <button
            id="statusbar-split-btn"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              viewMode === 'split' ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]' : 'text-[#71717a] hover:text-[#e2e2e4]'
            }`}
          >
            <Split className="w-3 h-3" />
            <span>Split Curtain</span>
          </button>
          <button
            id="statusbar-result-btn"
            onClick={() => setViewMode('result')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              viewMode === 'result' ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]' : 'text-[#71717a] hover:text-[#e2e2e4]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Clean Result</span>
          </button>
          <button
            id="statusbar-mask-btn"
            onClick={() => setViewMode('mask-overlay')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              viewMode === 'mask-overlay' ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]' : 'text-[#71717a] hover:text-[#e2e2e4]'
            }`}
          >
            <Paintbrush className="w-3 h-3" />
            <span>Mask Editor</span>
          </button>
        </div>
      )}

      {/* Right: Zoom indicator */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-[#71717a]">
          Zoom: {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onFitScreen}
          className="p-1 text-[#71717a] hover:text-white hover:bg-[#1f1f21] rounded transition-colors"
          title="Fit to Screen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
