import React, { useRef } from 'react';
import { 
  Paintbrush, 
  Eraser, 
  Square, 
  Lasso, 
  Hand, 
  Upload, 
  Trash2, 
  Wand2, 
  Sliders, 
  Sparkles,
  Zap,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { ToolType, InpaintMethod, MaskColor } from '../types';

interface ToolbarProps {
  tool: ToolType;
  setTool: (t: ToolType) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  inpaintRadius: number;
  setInpaintRadius: (r: number) => void;
  maskDilation: number;
  setMaskDilation: (d: number) => void;
  maskColor: MaskColor;
  setMaskColor: (c: MaskColor) => void;
  method: InpaintMethod;
  onClearMask: () => void;
  onAutoDetect: () => void;
  onProcessInpaint: () => void;
  isProcessing: boolean;
  onUploadImage: (file: File) => void;
  hasMaskStrokes: boolean;
  hasImage: boolean;
  isOpenCVLoaded: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  inpaintRadius,
  setInpaintRadius,
  maskDilation,
  setMaskDilation,
  maskColor,
  setMaskColor,
  method,
  onClearMask,
  onAutoDetect,
  onProcessInpaint,
  isProcessing,
  onUploadImage,
  hasMaskStrokes,
  hasImage,
  isOpenCVLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  const maskColorMap: Record<MaskColor, { bg: string; border: string; name: string }> = {
    red: { bg: 'bg-rose-500', border: 'border-rose-400', name: 'Ruby Red' },
    green: { bg: 'bg-emerald-500', border: 'border-emerald-400', name: 'Emerald' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-400', name: 'Neon Cyan' },
    yellow: { bg: 'bg-amber-400', border: 'border-amber-300', name: 'Gold' },
    white: { bg: 'bg-white', border: 'border-slate-200', name: 'White' },
  };

  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between p-4 overflow-y-auto select-none shrink-0 z-20">
      <div className="space-y-5">
        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            id="file-upload-input"
            type="file"
            accept="image/png, image/jpeg, image/webp, image/bmp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            id="upload-image-btn"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-semibold text-xs border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99]"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload New Image</span>
          </button>
        </div>

        {/* Mask Drawing Tools */}
        <div>
          <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">
            Masking Selection Tools
          </label>
          <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              id="tool-brush-btn"
              onClick={() => setTool('brush')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                tool === 'brush'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title="Brush Tool (Shortcut: B)"
            >
              <Paintbrush className="w-4 h-4 mb-1" />
              <span>Brush</span>
            </button>

            <button
              id="tool-eraser-btn"
              onClick={() => setTool('eraser')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                tool === 'eraser'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title="Eraser Tool (Shortcut: E)"
            >
              <Eraser className="w-4 h-4 mb-1" />
              <span>Eraser</span>
            </button>

            <button
              id="tool-rectangle-btn"
              onClick={() => setTool('rectangle')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                tool === 'rectangle'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title="Box Selection Tool (Shortcut: R)"
            >
              <Square className="w-4 h-4 mb-1" />
              <span>Box</span>
            </button>

            <button
              id="tool-lasso-btn"
              onClick={() => setTool('lasso')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                tool === 'lasso'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title="Lasso Polygon Tool (Shortcut: L)"
            >
              <Lasso className="w-4 h-4 mb-1" />
              <span>Lasso</span>
            </button>

            <button
              id="tool-pan-btn"
              onClick={() => setTool('pan')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                tool === 'pan'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title="Pan Canvas (Shortcut: H or Hold Space)"
            >
              <Hand className="w-4 h-4 mb-1" />
              <span>Pan</span>
            </button>
          </div>
        </div>

        {/* Brush Size Slider with preview ring */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Brush Diameter</span>
            <span className="font-mono text-indigo-400 font-bold">{brushSize}px</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="brush-size-slider"
              type="range"
              min="4"
              max="160"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            {/* Visual circle dot */}
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <div
                className="rounded-full bg-rose-500"
                style={{
                  width: `${Math.max(3, Math.min(22, (brushSize / 160) * 22))}px`,
                  height: `${Math.max(3, Math.min(22, (brushSize / 160) * 22))}px`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Inpaint Engine Parameters */}
        <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Inpaint Parameters
            </span>
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* Inpaint Radius */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Inpaint Radius</span>
              <span className="font-mono text-indigo-400 font-bold">{inpaintRadius}px</span>
            </div>
            <input
              id="inpaint-radius-slider"
              type="range"
              min="1"
              max="35"
              value={inpaintRadius}
              onChange={(e) => setInpaintRadius(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Radius of neighborhood pixels sampled for inpainting reconstruction.
            </p>
          </div>

          {/* Mask Dilation / Fringe Expansion */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Edge Feather / Dilation</span>
              <span className="font-mono text-indigo-400 font-bold">+{maskDilation}px</span>
            </div>
            <input
              id="mask-dilation-slider"
              type="range"
              min="0"
              max="8"
              value={maskDilation}
              onChange={(e) => setMaskDilation(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Expands mask boundary slightly to eliminate residual watermark glow or edge lines.
            </p>
          </div>
        </div>

        {/* Mask Overlay Color */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Mask Highlight Color
          </label>
          <div className="flex items-center gap-2">
            {(['red', 'green', 'cyan', 'yellow', 'white'] as MaskColor[]).map((c) => (
              <button
                key={c}
                id={`mask-color-${c}-btn`}
                onClick={() => setMaskColor(c)}
                className={`w-6 h-6 rounded-full ${maskColorMap[c].bg} border-2 transition-all ${
                  maskColor === c ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                title={maskColorMap[c].name}
              />
            ))}
          </div>
        </div>

        {/* Mask Helper Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="smart-detect-btn"
            onClick={onAutoDetect}
            disabled={!hasImage || isProcessing}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Automatically detect text watermarks and corner stamps"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto Detect</span>
          </button>

          <button
            id="clear-mask-btn"
            onClick={onClearMask}
            disabled={!hasMaskStrokes || isProcessing}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-200 hover:text-rose-400 text-xs font-semibold border border-slate-700/60 hover:border-rose-800/40 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear all painted mask strokes"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Mask</span>
          </button>
        </div>
      </div>

      {/* Primary Action Button: Remove Watermark */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <button
          id="execute-inpaint-btn"
          onClick={onProcessInpaint}
          disabled={isProcessing || !hasImage || (!hasMaskStrokes && !hasImage)}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            isProcessing
              ? 'bg-slate-800 text-slate-400 cursor-wait'
              : method === 'ai'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/25 active:scale-[0.98]'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Inpainting in progress...</span>
            </>
          ) : method === 'ai' ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Deep Remove</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>Remove Watermark</span>
            </>
          )}
        </button>

        {!hasMaskStrokes && hasImage && (
          <p className="text-[11px] text-amber-400/90 text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>Paint over the watermark to remove</span>
          </p>
        )}
      </div>
    </aside>
  );
};
