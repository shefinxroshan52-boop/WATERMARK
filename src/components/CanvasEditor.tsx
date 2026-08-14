import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ToolType, 
  ViewMode, 
  MaskColor, 
  ImageState 
} from '../types';
import { 
  Eye, 
  Split, 
  Columns2, 
  CheckCircle2, 
  Paintbrush, 
  UploadCloud, 
  Move,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface CanvasEditorProps {
  imageState: ImageState | null;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  sourceCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  resultCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  tool: ToolType;
  brushSize: number;
  maskColor: MaskColor;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onMaskChange: () => void;
  onDropImage: (file: File) => void;
  isProcessing: boolean;
  onOpenPresets: () => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  imageState,
  maskCanvasRef,
  sourceCanvasRef,
  resultCanvasRef,
  tool,
  brushSize,
  maskColor,
  viewMode,
  setViewMode,
  zoom,
  setZoom,
  pan,
  setPan,
  onMaskChange,
  onDropImage,
  isProcessing,
  onOpenPresets,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interaction states
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  
  // Split Curtain Slider Position (0 to 1)
  const [splitPos, setSplitPos] = useState(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Rectangle / Box selection state
  const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number } | null>(null);

  // Lasso polygon state
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);

  // Color mapping for mask visual overlay
  const maskColorRgba: Record<MaskColor, string> = {
    red: 'rgba(239, 68, 68, 0.65)',
    green: 'rgba(16, 185, 129, 0.65)',
    cyan: 'rgba(6, 182, 212, 0.65)',
    yellow: 'rgba(245, 158, 11, 0.65)',
    white: 'rgba(255, 255, 255, 0.75)',
  };

  // Convert client viewport coordinates to canvas image coordinates
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !imageState) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    // Offset from container center
    const cx = clientX - rect.left - rect.width / 2 - pan.x;
    const cy = clientY - rect.top - rect.height / 2 - pan.y;

    // Unscale
    const imageX = Math.round(cx / zoom + imageState.width / 2);
    const imageY = Math.round(cy / zoom + imageState.height / 2);

    return { x: imageX, y: imageY };
  }, [imageState, pan, zoom]);

  // Redraw the visual combined display canvas (source + mask overlay or result)
  const renderDisplay = useCallback(() => {
    const disp = displayCanvasRef.current;
    const src = sourceCanvasRef.current;
    const mask = maskCanvasRef.current;
    const res = resultCanvasRef.current;

    if (!disp || !src || !imageState) return;

    const w = imageState.width;
    const h = imageState.height;
    disp.width = w;
    disp.height = h;
    const ctx = disp.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);

    if (viewMode === 'result' && imageState.resultSrc && res && !isComparingOriginal) {
      // Draw result
      ctx.drawImage(res, 0, 0, w, h);
    } else if (viewMode === 'split' && imageState.resultSrc && res && !isComparingOriginal) {
      // Split mode: Left side = Source + Mask; Right side = Inpainted Result
      const splitX = Math.round(w * splitPos);

      // Left portion (Original + Mask overlay)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();
      ctx.drawImage(src, 0, 0, w, h);
      
      // Draw mask overlay on left
      if (mask) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        // Tint mask
        const tintCanvas = document.createElement('canvas');
        tintCanvas.width = w;
        tintCanvas.height = h;
        const tctx = tintCanvas.getContext('2d');
        if (tctx) {
          tctx.drawImage(mask, 0, 0);
          tctx.globalCompositeOperation = 'source-in';
          tctx.fillStyle = maskColorRgba[maskColor];
          tctx.fillRect(0, 0, w, h);
          ctx.drawImage(tintCanvas, 0, 0);
        }
        ctx.restore();
      }
      ctx.restore();

      // Right portion (Result clean image)
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();
      ctx.drawImage(res, 0, 0, w, h);
      ctx.restore();

      // Divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / zoom;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();
    } else {
      // Standard Mask Edit mode or Original view
      ctx.drawImage(src, 0, 0, w, h);

      // Render colored mask overlay
      if (mask && !isComparingOriginal) {
        ctx.save();
        const tintCanvas = document.createElement('canvas');
        tintCanvas.width = w;
        tintCanvas.height = h;
        const tctx = tintCanvas.getContext('2d');
        if (tctx) {
          tctx.drawImage(mask, 0, 0);
          tctx.globalCompositeOperation = 'source-in';
          tctx.fillStyle = maskColorRgba[maskColor];
          tctx.fillRect(0, 0, w, h);
          ctx.drawImage(tintCanvas, 0, 0);
        }
        ctx.restore();
      }

      // Render active box selection preview
      if (boxStart && boxCurrent) {
        const bx = Math.min(boxStart.x, boxCurrent.x);
        const by = Math.min(boxStart.y, boxCurrent.y);
        const bw = Math.abs(boxCurrent.x - boxStart.x);
        const bh = Math.abs(boxCurrent.y - boxStart.y);

        ctx.save();
        ctx.fillStyle = maskColorRgba[maskColor];
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.restore();
      }

      // Render active lasso polygon preview
      if (lassoPoints.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = maskColorRgba[maskColor];
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.beginPath();
        ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
    }
  }, [
    imageState, 
    viewMode, 
    splitPos, 
    maskColor, 
    zoom, 
    boxStart, 
    boxCurrent, 
    lassoPoints, 
    isComparingOriginal, 
    maskColorRgba, 
    maskCanvasRef, 
    sourceCanvasRef, 
    resultCanvasRef
  ]);

  // Re-render when dependencies update
  useEffect(() => {
    renderDisplay();
  }, [renderDisplay]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * zoomFactor)));
  };

  // Pointer Down (Drawing / Panning / Box / Split)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!imageState) return;

    // Check if middle click or spacebar or Pan tool
    if (e.button === 1 || tool === 'pan' || e.spaceKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Only left click

    const coords = getCanvasCoords(e.clientX, e.clientY);

    // Check if clicking near split slider in split mode
    if (viewMode === 'split' && imageState.resultSrc) {
      const splitCanvasX = imageState.width * splitPos;
      const dist = Math.abs(coords.x - splitCanvasX);
      if (dist < 40 / zoom) {
        setIsDraggingSplit(true);
        return;
      }
    }

    if (tool === 'rectangle') {
      setBoxStart(coords);
      setBoxCurrent(coords);
      setIsDrawing(true);
      return;
    }

    if (tool === 'lasso') {
      setLassoPoints([coords]);
      setIsDrawing(true);
      return;
    }

    // Brush or Eraser
    if (tool === 'brush' || tool === 'eraser') {
      setIsDrawing(true);
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      const mctx = maskCanvas.getContext('2d');
      if (!mctx) return;

      mctx.lineJoin = 'round';
      mctx.lineCap = 'round';
      mctx.lineWidth = brushSize;
      mctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
      mctx.strokeStyle = '#ffffff';

      mctx.beginPath();
      mctx.moveTo(coords.x, coords.y);
      mctx.lineTo(coords.x + 0.01, coords.y + 0.01);
      mctx.stroke();

      renderDisplay();
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setCursorPos({ x: e.clientX, y: e.clientY });

    // Panning canvas
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }

    // Dragging split curtain slider
    if (isDraggingSplit && imageState) {
      const clamped = Math.max(0.02, Math.min(0.98, coords.x / imageState.width));
      setSplitPos(clamped);
      renderDisplay();
      return;
    }

    if (!isDrawing || !imageState) return;

    if (tool === 'rectangle') {
      setBoxCurrent(coords);
      renderDisplay();
      return;
    }

    if (tool === 'lasso') {
      setLassoPoints((prev) => [...prev, coords]);
      renderDisplay();
      return;
    }

    if (tool === 'brush' || tool === 'eraser') {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      const mctx = maskCanvas.getContext('2d');
      if (!mctx) return;

      mctx.lineJoin = 'round';
      mctx.lineCap = 'round';
      mctx.lineWidth = brushSize;
      mctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
      mctx.strokeStyle = '#ffffff';

      mctx.lineTo(coords.x, coords.y);
      mctx.stroke();

      renderDisplay();
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDraggingSplit) {
      setIsDraggingSplit(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const mctx = maskCanvas.getContext('2d');
    if (!mctx) return;

    if (tool === 'rectangle' && boxStart && boxCurrent) {
      const bx = Math.min(boxStart.x, boxCurrent.x);
      const by = Math.min(boxStart.y, boxCurrent.y);
      const bw = Math.abs(boxCurrent.x - boxStart.x);
      const bh = Math.abs(boxCurrent.y - boxStart.y);

      if (bw > 2 && bh > 2) {
        mctx.fillStyle = '#ffffff';
        mctx.globalCompositeOperation = 'source-over';
        mctx.fillRect(bx, by, bw, bh);
      }

      setBoxStart(null);
      setBoxCurrent(null);
      onMaskChange();
      renderDisplay();
      return;
    }

    if (tool === 'lasso' && lassoPoints.length > 2) {
      mctx.fillStyle = '#ffffff';
      mctx.globalCompositeOperation = 'source-over';
      mctx.beginPath();
      mctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) {
        mctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      }
      mctx.closePath();
      mctx.fill();

      setLassoPoints([]);
      onMaskChange();
      renderDisplay();
      return;
    }

    if (tool === 'brush' || tool === 'eraser') {
      onMaskChange();
      renderDisplay();
    }
  };

  // Drag and drop image files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onDropImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <main
      ref={containerRef}
      id="canvas-viewport-container"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        setIsDrawing(false);
        setIsPanning(false);
        setIsDraggingSplit(false);
        setCursorPos(null);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 relative bg-[#0a0a0b] overflow-hidden flex items-center justify-center select-none cursor-crosshair bg-[radial-gradient(#1f1f21_1px,transparent_1px)] [background-size:20px_20px]"
      style={{
        cursor:
          isPanning || tool === 'pan'
            ? 'grab'
            : isDraggingSplit
            ? 'ew-resize'
            : tool === 'brush' || tool === 'eraser'
            ? 'none'
            : 'crosshair',
      }}
    >
      {/* Main Canvas Viewport Area */}
      {imageState ? (
        <div
          className="relative transition-transform duration-75 shadow-2xl rounded-xl overflow-visible"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Main Visual Display Canvas */}
          <canvas
            ref={displayCanvasRef}
            id="main-display-canvas"
            className="block max-w-none rounded-xl bg-[#161618] shadow-2xl ring-1 ring-[#2a2a2c]"
          />

          {/* Hidden Offscreen Source & Mask Canvases */}
          <canvas ref={sourceCanvasRef} className="hidden" />
          <canvas ref={maskCanvasRef} className="hidden" />
          <canvas ref={resultCanvasRef} className="hidden" />

          {/* Split Mode Interactive Handle on Canvas */}
          {viewMode === 'split' && imageState.resultSrc && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: `${splitPos * 100}%` }}
            >
              <div className="w-7 h-7 -ml-3.5 top-1/2 -mt-3.5 absolute rounded-full bg-[#1a1a1c] border border-[#3a3a3c] text-white shadow-xl flex items-center justify-center text-[10px] font-bold ring-2 ring-[#6366f1]/40">
                ⟷
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State / Upload Dropzone */
        <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-[#111112] border border-[#2a2a2c] text-center space-y-6 shadow-2xl z-10">
          <div className="w-16 h-16 rounded-xl bg-[#1a1a1c] border border-[#2a2a2c] text-[#6366f1] mx-auto flex items-center justify-center shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Drop an Image to Remove Watermark
            </h2>
            <p className="text-xs text-[#a1a1aa] max-w-xs mx-auto leading-relaxed">
              Drag & drop any photo or document, or pick one of our instant realistic sample presets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="empty-state-upload-btn"
              onClick={() => document.getElementById('file-upload-input')?.click()}
              className="px-5 py-2.5 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-semibold shadow-lg shadow-indigo-500/10 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select File from Device</span>
            </button>

            <button
              id="empty-state-presets-btn"
              onClick={onOpenPresets}
              className="px-5 py-2.5 rounded-lg bg-[#161618] hover:bg-[#1f1f21] text-[#e2e2e4] text-xs font-medium border border-[#2a2a2c] hover:border-[#3a3a3c] transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#6366f1]" />
              <span>Explore Sample Watermarks</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#2a2a2c] text-[11px] text-[#52525b] flex items-center justify-center gap-4">
            <span>✓ High-Res PNG / JPG / WebP</span>
            <span>✓ Local Engine Processing</span>
          </div>
        </div>
      )}

      {/* Real-time Custom Brush Cursor Overlay */}
      {cursorPos && (tool === 'brush' || tool === 'eraser') && imageState && (
        <div
          className="pointer-events-none fixed rounded-full -translate-x-1/2 -translate-y-1/2 border z-50 transition-transform duration-75"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: `${brushSize * zoom}px`,
            height: `${brushSize * zoom}px`,
            borderColor: tool === 'brush' ? '#ef4444' : '#6366f1',
            backgroundColor: tool === 'brush' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
          }}
        />
      )}

      {/* Dragging File Visual Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 bg-[#0a0a0b]/90 border-2 border-dashed border-[#6366f1] backdrop-blur-sm z-40 flex items-center justify-center text-white">
          <div className="text-center space-y-3">
            <UploadCloud className="w-16 h-16 text-[#6366f1] mx-auto animate-bounce" />
            <h3 className="text-xl font-semibold">Release to Load Image</h3>
          </div>
        </div>
      )}

      {/* Floating Top Floating Comparison Bar */}
      {imageState && imageState.resultSrc && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#111112]/90 border border-[#2a2a2c] backdrop-blur-md rounded-lg p-1 flex items-center gap-1 shadow-2xl z-30">
          <button
            id="viewmode-split-btn"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'split'
                ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]'
                : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1a1a1c]'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Before / After Slider</span>
          </button>

          <button
            id="viewmode-result-btn"
            onClick={() => setViewMode('result')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'result'
                ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]'
                : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1a1a1c]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clean Result</span>
          </button>

          <button
            id="viewmode-mask-btn"
            onClick={() => setViewMode('mask-overlay')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'mask-overlay'
                ? 'bg-[#2a2a2c] text-white border border-[#3a3a3c]'
                : 'text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1a1a1c]'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Edit Mask</span>
          </button>

          {/* Hold to compare button */}
          <button
            id="hold-compare-btn"
            onPointerDown={() => setIsComparingOriginal(true)}
            onPointerUp={() => setIsComparingOriginal(false)}
            onPointerLeave={() => setIsComparingOriginal(false)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#161618] hover:bg-[#1f1f21] active:bg-[#2a2a2c] text-[#a1a1aa] hover:text-white border border-[#2a2a2c] transition-colors flex items-center gap-1.5 select-none"
            title="Press and hold to view the original image with watermark"
          >
            <Eye className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Hold to Compare</span>
          </button>
        </div>
      )}

      {/* Floating Keyboard Shortcuts Hint (Bottom Left) */}
      <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-3 bg-[#111112]/90 border border-[#2a2a2c] backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] text-[#71717a] pointer-events-none">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1c] border border-[#2a2a2c] font-mono text-[10px] text-[#a1a1aa]">B</kbd> Brush
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1c] border border-[#2a2a2c] font-mono text-[10px] text-[#a1a1aa]">E</kbd> Eraser
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1c] border border-[#2a2a2c] font-mono text-[10px] text-[#a1a1aa]">R</kbd> Box
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1c] border border-[#2a2a2c] font-mono text-[10px] text-[#a1a1aa]">Space</kbd> Pan
        </span>
      </div>
    </main>
  );
};
