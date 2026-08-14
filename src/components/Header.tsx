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
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white">Watermark Remover</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            {isOpenCVLoaded ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OpenCV.js Inpainting Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Loading OpenCV.js Engine...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Center: Method Selector & Samples */}
      <div className="flex items-center gap-2">
        {/* Method Toggle */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
          <button
            id="method-telea-btn"
            onClick={() => setMethod('telea')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              method === 'telea'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Fast Marching Method - Ideal for smooth textures, backgrounds and logos"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>OpenCV Telea</span>
          </button>

          <button
            id="method-ns-btn"
            onClick={() => setMethod('ns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              method === 'ns'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Navier-Stokes Fluid Dynamics - Preserves edges and line structures"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>OpenCV NS</span>
          </button>

          <button
            id="method-ai-btn"
            onClick={() => setMethod('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              method === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Gemini AI Deep Clean - Photorealistic generative inpainting"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Deep Clean</span>
          </button>
        </div>

        {/* Preset Samples Button */}
        <button
          id="open-presets-btn"
          onClick={onOpenPresets}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-all flex items-center gap-1.5"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sample Images</span>
        </button>
      </div>

      {/* Right: History, Zoom & Export */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
          <button
            id="undo-btn"
            onClick={onUndo}
            disabled={!canUndo || isProcessing}
            className={`p-2 rounded-lg transition-colors ${
              canUndo && !isProcessing
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            id="redo-btn"
            onClick={onRedo}
            disabled={!canRedo || isProcessing}
            className={`p-2 rounded-lg transition-colors ${
              canRedo && !isProcessing
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            id="reset-canvas-btn"
            onClick={onReset}
            disabled={isProcessing}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Reset All Strokes & Result"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5 text-xs text-slate-300 font-mono">
          <button
            id="zoom-out-btn"
            onClick={onZoomOut}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            id="zoom-reset-btn"
            onClick={onResetZoom}
            className="px-2 py-1 hover:bg-slate-800 rounded text-[11px] font-semibold"
            title="Click to reset to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            id="zoom-in-btn"
            onClick={onZoomIn}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="zoom-fit-btn"
            onClick={onFitScreen}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
            hasResult && !isProcessing
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Clean Image</span>
        </button>
      </div>
    </header>
  );
};
