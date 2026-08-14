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
    <aside className="w-80 border-r border-[#2a2a2c] bg-[#111112] flex flex-col justify-between p-6 overflow-y-auto select-none shrink-0 z-20">
      <div className="space-y-6">
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
            className="w-full py-2.5 px-4 rounded-xl bg-[#161618] hover:bg-[#1f1f21] text-[#e2e2e4] font-medium text-xs border border-[#2a2a2c] hover:border-[#3a3a3c] transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
          >
            <Upload className="w-4 h-4 text-[#6366f1]" />
            <span>Upload New Image</span>
          </button>
        </div>

        {/* Mask Drawing Tools */}
        <div>
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#71717a] mb-3 block">
            Tool Selection
          </h3>
          <div className="grid grid-cols-5 gap-1.5 bg-[#161618] p-1.5 rounded-xl border border-[#2a2a2c]">
            <button
              id="tool-brush-btn"
              onClick={() => setTool('brush')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                tool === 'brush'
                  ? 'bg-[#2a2a2c] border border-[#6366f1]/50 text-white'
                  : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
              }`}
              title="Brush Tool (Shortcut: B)"
            >
              <Paintbrush className="w-4 h-4 mb-1" />
              <span>Brush</span>
            </button>

            <button
              id="tool-eraser-btn"
              onClick={() => setTool('eraser')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                tool === 'eraser'
                  ? 'bg-[#2a2a2c] border border-[#6366f1]/50 text-white'
                  : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
              }`}
              title="Eraser Tool (Shortcut: E)"
            >
              <Eraser className="w-4 h-4 mb-1" />
              <span>Eraser</span>
            </button>

            <button
              id="tool-rectangle-btn"
              onClick={() => setTool('rectangle')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                tool === 'rectangle'
                  ? 'bg-[#2a2a2c] border border-[#6366f1]/50 text-white'
                  : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
              }`}
              title="Box Selection Tool (Shortcut: R)"
            >
              <Square className="w-4 h-4 mb-1" />
              <span>Box</span>
            </button>

            <button
              id="tool-lasso-btn"
              onClick={() => setTool('lasso')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                tool === 'lasso'
                  ? 'bg-[#2a2a2c] border border-[#6366f1]/50 text-white'
                  : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
              }`}
              title="Lasso Polygon Tool (Shortcut: L)"
            >
              <Lasso className="w-4 h-4 mb-1" />
              <span>Lasso</span>
            </button>

            <button
              id="tool-pan-btn"
              onClick={() => setTool('pan')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                tool === 'pan'
                  ? 'bg-[#2a2a2c] border border-[#6366f1]/50 text-white'
                  : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
              }`}
              title="Pan Canvas (Shortcut: H or Hold Space)"
            >
              <Hand className="w-4 h-4 mb-1" />
              <span>Pan</span>
            </button>
          </div>
        </div>

        {/* Brush Size Slider with preview ring */}
        <div className="bg-[#161618] p-4 rounded-xl border border-[#2a2a2c] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#71717a]">
              Brush Settings
            </h3>
            <span className="text-xs font-mono text-[#a1a1aa]">{brushSize}px</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="brush-size-slider"
              type="range"
              min="4"
              max="160"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="w-full accent-[#6366f1] h-1.5 bg-[#2a2a2c] rounded-lg cursor-pointer"
            />
            {/* Visual circle dot */}
            <div className="w-7 h-7 rounded-lg bg-[#111112] border border-[#2a2a2c] flex items-center justify-center shrink-0">
              <div
                className="rounded-full bg-[#6366f1]"
                style={{
                  width: `${Math.max(3, Math.min(22, (brushSize / 160) * 22))}px`,
                  height: `${Math.max(3, Math.min(22, (brushSize / 160) * 22))}px`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Inpaint Engine Parameters */}
        <div className="space-y-3 bg-[#161618] p-4 rounded-xl border border-[#2a2a2c]">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#71717a]">
              Inpaint Parameters
            </h3>
            <Sliders className="w-3.5 h-3.5 text-[#71717a]" />
          </div>

          {/* Inpaint Radius */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-[#a1a1aa]">Inpaint Radius</span>
              <span className="font-mono text-xs text-[#e2e2e4]">{inpaintRadius}px</span>
            </div>
            <input
              id="inpaint-radius-slider"
              type="range"
              min="1"
              max="35"
              value={inpaintRadius}
              onChange={(e) => setInpaintRadius(parseInt(e.target.value, 10))}
              className="w-full accent-[#6366f1] h-1.5 bg-[#2a2a2c] rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-[#71717a]">
              Radius of neighborhood pixels sampled for inpainting reconstruction.
            </p>
          </div>

          {/* Mask Dilation / Fringe Expansion */}
          <div className="space-y-1.5 pt-2 border-t border-[#2a2a2c]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-[#a1a1aa]">Edge Feather / Dilation</span>
              <span className="font-mono text-xs text-[#e2e2e4]">+{maskDilation}px</span>
            </div>
            <input
              id="mask-dilation-slider"
              type="range"
              min="0"
              max="8"
              value={maskDilation}
              onChange={(e) => setMaskDilation(parseInt(e.target.value, 10))}
              className="w-full accent-[#6366f1] h-1.5 bg-[#2a2a2c] rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-[#71717a]">
              Expands mask boundary slightly to eliminate residual watermark glow.
            </p>
          </div>
        </div>

        {/* Mask Overlay Color */}
        <div className="bg-[#161618] p-4 rounded-xl border border-[#2a2a2c] space-y-2">
          <label className="text-[11px] uppercase tracking-widest font-bold text-[#71717a] block">
            Mask Highlight Color
          </label>
          <div className="flex items-center gap-2">
            {(['red', 'green', 'cyan', 'yellow', 'white'] as MaskColor[]).map((c) => (
              <button
                key={c}
                id={`mask-color-${c}-btn`}
                onClick={() => setMaskColor(c)}
                className={`w-6 h-6 rounded-full ${maskColorMap[c].bg} border-2 transition-all ${
                  maskColor === c ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
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
            className="py-2.5 px-3 rounded-lg bg-[#161618] hover:bg-[#1f1f21] text-[#a1a1aa] hover:text-[#e2e2e4] text-xs font-medium border border-[#2a2a2c] hover:border-[#3a3a3c] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Automatically detect text watermarks and corner stamps"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Auto Detect</span>
          </button>

          <button
            id="clear-mask-btn"
            onClick={onClearMask}
            disabled={!hasMaskStrokes || isProcessing}
            className="py-2.5 px-3 rounded-lg bg-[#161618] hover:bg-rose-950/30 text-[#a1a1aa] hover:text-rose-400 text-xs font-medium border border-[#2a2a2c] hover:border-rose-900/40 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clear all painted mask strokes"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Mask</span>
          </button>
        </div>
      </div>

      {/* Primary Action Button: Remove Watermark */}
      <div className="pt-6 border-t border-[#2a2a2c] space-y-2">
        <button
          id="execute-inpaint-btn"
          onClick={onProcessInpaint}
          disabled={isProcessing || !hasImage || (!hasMaskStrokes && !hasImage)}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            isProcessing
              ? 'bg-[#2a2a2c] text-[#71717a] cursor-wait'
              : method === 'ai'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:opacity-95 text-white shadow-indigo-500/10 active:scale-[0.98]'
              : 'bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-indigo-500/10 active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#6366f1]" />
              <span>Inpainting in progress...</span>
            </>
          ) : method === 'ai' ? (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Process Selection (AI)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-white" />
              <span>Process Selection</span>
            </>
          )}
        </button>

        {!hasMaskStrokes && hasImage && (
          <p className="text-[11px] text-[#a1a1aa] text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0 text-amber-400" />
            <span>Paint over the watermark to remove</span>
          </p>
        )}
      </div>
    </aside>
  );
};
