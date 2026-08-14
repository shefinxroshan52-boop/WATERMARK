import React from 'react';
import { 
  Sparkles, 
  Zap, 
  Undo2, 
  Redo2, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Image as ImageIcon,
  Check,
  ChevronDown,
  Layers
} from 'lucide-react';
import { InpaintMethod } from '../types';

interface HeaderProps {
  method: InpaintMethod;
  setMethod: (m: InpaintMethod) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onResetZoom: () => void;
  hasResult: boolean;
  onOpenPresets: () => void;
  onOpenExport: () => void;
  isOpenCVLoaded: boolean;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  method,
  setMethod,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onResetZoom,
  hasResult,
  onOpenPresets,
  onOpenExport,
  isOpenCVLoaded,
  isProcessing,
}) => {
  return (
    <header className="h-16 border-b border-[#2a2a2c] bg-[#111112] px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/10">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-white">
              Vanish <span className="text-[#a1a1aa] font-light">AI</span>
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1a1a1c] text-[#a1a1aa] border border-[#2a2a2c]">
              v2.4
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isOpenCVLoaded ? (
              <span className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium tracking-wide">Engine Ready</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-medium tracking-wide">Loading Engine...</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Method Selector & Samples */}
      <div className="flex items-center gap-2">
        {/* Method Toggle */}
        <div className="bg-[#161618] p-1 rounded-lg border border-[#2a2a2c] flex items-center gap-1">
          <button
            id="method-telea-btn"
            onClick={() => setMethod('telea')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              method === 'telea'
                ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]'
                : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
            }`}
            title="Fast Marching Method - Ideal for smooth textures, backgrounds and logos"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>OpenCV Telea</span>
          </button>

          <button
            id="method-ns-btn"
            onClick={() => setMethod('ns')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              method === 'ns'
                ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]'
                : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
            }`}
            title="Navier-Stokes Fluid Dynamics - Preserves edges and line structures"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>OpenCV NS</span>
          </button>

          <button
            id="method-ai-btn"
            onClick={() => setMethod('ai')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              method === 'ai'
                ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]'
                : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
            }`}
            title="Gemini AI Deep Clean - Photorealistic generative inpainting"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>AI Deep Clean</span>
          </button>
        </div>

        {/* Preset Samples Button */}
        <button
          id="open-presets-btn"
          onClick={onOpenPresets}
          className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#161618] hover:bg-[#1f1f21] text-[#a1a1aa] hover:text-white border border-[#2a2a2c] transition-colors flex items-center gap-1.5"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#6366f1]" />
          <span>Sample Images</span>
        </button>
      </div>

      {/* Right: History, Zoom & Export */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#161618] rounded-md border border-[#2a2a2c] p-0.5">
          <button
            id="undo-btn"
            onClick={onUndo}
            disabled={!canUndo || isProcessing}
            className={`p-1.5 rounded transition-colors ${
              canUndo && !isProcessing
                ? 'text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2c]'
                : 'text-[#3a3a3c] cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            id="redo-btn"
            onClick={onRedo}
            disabled={!canRedo || isProcessing}
            className={`p-1.5 rounded transition-colors ${
              canRedo && !isProcessing
                ? 'text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2c]'
                : 'text-[#3a3a3c] cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            id="reset-canvas-btn"
            onClick={onReset}
            disabled={isProcessing}
            className="p-1.5 rounded text-[#71717a] hover:text-amber-400 hover:bg-[#2a2a2c] transition-colors"
            title="Reset All Strokes & Result"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-[#161618] rounded-md border border-[#2a2a2c] p-0.5 text-xs text-[#a1a1aa] font-mono">
          <button
            id="zoom-out-btn"
            onClick={onZoomOut}
            className="p-1.5 rounded hover:bg-[#2a2a2c] text-[#71717a] hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            id="zoom-reset-btn"
            onClick={onResetZoom}
            className="px-2 py-1 hover:bg-[#2a2a2c] rounded text-[11px] font-medium"
            title="Click to reset to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            id="zoom-in-btn"
            onClick={onZoomIn}
            className="p-1.5 rounded hover:bg-[#2a2a2c] text-[#71717a] hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="zoom-fit-btn"
            onClick={onFitScreen}
            className="p-1.5 rounded hover:bg-[#2a2a2c] text-[#71717a] hover:text-white transition-colors"
            title="Fit to Canvas Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Export Button */}
        <button
          id="export-result-btn"
          onClick={onOpenExport}
          disabled={!hasResult || isProcessing}
          className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
            hasResult && !isProcessing
              ? 'bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/10 active:scale-95'
              : 'bg-[#1a1a1c] text-[#52525b] border border-[#2a2a2c] cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Clean Image</span>
        </button>
      </div>
    </header>
  );
};
