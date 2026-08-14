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
    <footer className="h-10 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between text-xs text-slate-400 select-none z-20 shrink-0">
      {/* Left: Image specs & stats */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-[11px] text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
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
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            id="statusbar-split-btn"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3 h-3" />
            <span>Split Curtain</span>
          </button>
          <button
            id="statusbar-result-btn"
            onClick={() => setViewMode('result')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'result' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Clean Result</span>
          </button>
          <button
            id="statusbar-mask-btn"
            onClick={() => setViewMode('mask-overlay')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'mask-overlay' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Paintbrush className="w-3 h-3" />
            <span>Mask Editor</span>
          </button>
        </div>
      )}

      {/* Right: Zoom indicator */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-slate-400">
          Zoom: {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onFitScreen}
          className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Fit to Screen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
