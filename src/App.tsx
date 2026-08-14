import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ToolType, 
  InpaintMethod, 
  ViewMode, 
  MaskColor, 
  ImageState, 
  ProcessingStats, 
  SamplePreset 
} from './types';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { CanvasEditor } from './components/CanvasEditor';
import { ComparisonBar } from './components/ComparisonBar';
import { PresetModal } from './components/PresetModal';
import { ExportModal } from './components/ExportModal';
import { 
  loadOpenCV, 
  isOpenCVReady, 
  runOpenCVInpaint, 
  detectPotentialWatermarks 
} from './services/opencvService';
import { requestAIInpaint } from './services/geminiService';
import { SAMPLE_PRESETS } from './utils/sampleImages';

export default function App() {
  // Canvases
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core State
  const [imageState, setImageState] = useState<ImageState | null>(null);
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasMaskStrokes, setHasMaskStrokes] = useState(false);
  const [stats, setStats] = useState<ProcessingStats | null>(null);

  // Tool & Settings
  const [tool, setTool] = useState<ToolType>('brush');
  const [brushSize, setBrushSize] = useState<number>(34);
  const [inpaintRadius, setInpaintRadius] = useState<number>(4);
  const [maskDilation, setMaskDilation] = useState<number>(2);
  const [maskColor, setMaskColor] = useState<MaskColor>('red');
  const [method, setMethod] = useState<InpaintMethod>('telea');
  const [viewMode, setViewMode] = useState<ViewMode>('mask-overlay');

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Modals
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | undefined>(undefined);

  // Undo / Redo History Stack (stores mask ImageData)
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize OpenCV.js on mount
  useEffect(() => {
    loadOpenCV().then((ready) => {
      setIsOpenCVLoaded(ready);
    });
  }, []);

  // Save current mask state to undo history
  const pushHistory = useCallback(() => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mctx = mask.getContext('2d');
    if (!mctx) return;

    try {
      const data = mctx.getImageData(0, 0, mask.width, mask.height);
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, data];
      });
      setHistoryIndex((prev) => prev + 1);
    } catch (e) {
      console.warn('Failed to snapshot history:', e);
    }
  }, [historyIndex]);

  // Load a new image onto source canvas
  const loadImage = useCallback((img: HTMLImageElement | HTMLCanvasElement, name: string) => {
    const w = img.width;
    const h = img.height;

    // 1. Source canvas
    const srcCanvas = sourceCanvasRef.current || document.createElement('canvas');
    srcCanvas.width = w;
    srcCanvas.height = h;
    const sctx = srcCanvas.getContext('2d')!;
    sctx.clearRect(0, 0, w, h);
    sctx.drawImage(img, 0, 0);

    // 2. Mask canvas
    const mCanvas = maskCanvasRef.current || document.createElement('canvas');
    mCanvas.width = w;
    mCanvas.height = h;
    const mctx = mCanvas.getContext('2d')!;
    mctx.clearRect(0, 0, w, h);

    // 3. Result canvas
    const rCanvas = resultCanvasRef.current || document.createElement('canvas');
    rCanvas.width = w;
    rCanvas.height = h;
    const rctx = rCanvas.getContext('2d')!;
    rctx.clearRect(0, 0, w, h);

    // Calculate fit-to-screen initial zoom
    const containerW = window.innerWidth - 340;
    const containerH = window.innerHeight - 120;
    const fitScale = Math.min(1, (containerW * 0.85) / w, (containerH * 0.85) / h);
    setZoom(Math.max(0.2, fitScale));
    setPan({ x: 0, y: 0 });

    setImageState({
      originalSrc: srcCanvas.toDataURL('image/png'),
      resultSrc: null,
      width: w,
      height: h,
      name,
    });

    setHasMaskStrokes(false);
    setViewMode('mask-overlay');
    setStats(null);

    // Initialize history
    const initialData = mctx.getImageData(0, 0, w, h);
    setHistory([initialData]);
    setHistoryIndex(0);
  }, []);

  // Handle uploaded file
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        const img = new Image();
        img.onload = () => {
          loadImage(img, file.name);
          setActivePresetId(undefined);
        };
        img.src = ev.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // Load Preset
  const handleSelectPreset = (preset: SamplePreset) => {
    setActivePresetId(preset.id);
    const canvas = document.createElement('canvas');
    preset.drawPreset(canvas);
    loadImage(canvas, `${preset.id}.png`);
  };

  // Auto-load first sample preset on start if empty
  useEffect(() => {
    if (!imageState && SAMPLE_PRESETS.length > 0) {
      handleSelectPreset(SAMPLE_PRESETS[0]);
    }
  }, [imageState]);

  // Mask change handler
  const handleMaskChange = () => {
    setHasMaskStrokes(true);
    pushHistory();
  };

  // Clear mask
  const handleClearMask = () => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mctx = mask.getContext('2d');
    if (!mctx) return;
    mctx.clearRect(0, 0, mask.width, mask.height);
    setHasMaskStrokes(false);
    pushHistory();
  };

  // Smart Auto-Detect watermarks and stamps
  const handleAutoDetect = async () => {
    if (!sourceCanvasRef.current || !maskCanvasRef.current) return;
    const detected = await detectPotentialWatermarks(sourceCanvasRef.current);
    const mctx = maskCanvasRef.current.getContext('2d');
    if (!mctx) return;

    mctx.fillStyle = '#ffffff';
    mctx.globalCompositeOperation = 'source-over';

    for (const box of detected) {
      // Add slight padding around detected watermark zone
      const pad = 12;
      mctx.fillRect(box.x - pad, box.y - pad, box.width + pad * 2, box.height + pad * 2);
    }

    setHasMaskStrokes(true);
    pushHistory();
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const nextIdx = historyIndex - 1;
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mctx = mask.getContext('2d');
    if (!mctx) return;

    mctx.putImageData(history[nextIdx], 0, 0);
    setHistoryIndex(nextIdx);
    setHasMaskStrokes(nextIdx > 0);
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mctx = mask.getContext('2d');
    if (!mctx) return;

    mctx.putImageData(history[nextIdx], 0, 0);
    setHistoryIndex(nextIdx);
    setHasMaskStrokes(true);
  };

  // Reset all
  const handleReset = () => {
    if (sourceCanvasRef.current && imageState) {
      const img = new Image();
      img.onload = () => {
        loadImage(img, imageState.name);
      };
      img.src = imageState.originalSrc;
    }
  };

  // Inpainting execution (OpenCV Telea, OpenCV Navier-Stokes, or Gemini AI)
  const handleProcessInpaint = async () => {
    if (!sourceCanvasRef.current || !maskCanvasRef.current || !imageState) return;

    setIsProcessing(true);
    const startTime = performance.now();

    try {
      if (method === 'ai') {
        // AI Inpainting via Gemini
        const imageBase64 = sourceCanvasRef.current.toDataURL('image/png');
        const maskBase64 = maskCanvasRef.current.toDataURL('image/png');

        const res = await requestAIInpaint(imageBase64, maskBase64);

        if (res.success && res.image) {
          const img = new Image();
          img.onload = () => {
            const rCanvas = resultCanvasRef.current;
            if (rCanvas) {
              rCanvas.width = img.width;
              rCanvas.height = img.height;
              const rctx = rCanvas.getContext('2d');
              rctx?.drawImage(img, 0, 0);
            }
            setImageState((prev) => prev ? { ...prev, resultSrc: res.image! } : null);
            setViewMode('split');
            const duration = Math.round(performance.now() - startTime);
            setStats({
              timeMs: duration,
              method: 'Gemini AI Deep Clean',
              timestamp: new Date(),
              dimensions: { width: img.width, height: img.height },
            });
          };
          img.src = res.image;
        } else {
          // Fallback to OpenCV Telea if AI had an issue
          console.warn('AI inpainting returned error, using high-precision OpenCV:', res.error);
          const outCanvas = await runOpenCVInpaint(
            sourceCanvasRef.current,
            maskCanvasRef.current,
            { method: 'telea', radius: inpaintRadius, dilation: maskDilation }
          );

          const rCanvas = resultCanvasRef.current;
          if (rCanvas) {
            rCanvas.width = outCanvas.width;
            rCanvas.height = outCanvas.height;
            const rctx = rCanvas.getContext('2d');
            rctx?.drawImage(outCanvas, 0, 0);
          }
          const resultDataUrl = outCanvas.toDataURL('image/png');
          setImageState((prev) => prev ? { ...prev, resultSrc: resultDataUrl } : null);
          setViewMode('split');
          const duration = Math.round(performance.now() - startTime);
          setStats({
            timeMs: duration,
            method: 'OpenCV Telea (Fallback)',
            timestamp: new Date(),
            dimensions: { width: outCanvas.width, height: outCanvas.height },
          });
        }
      } else {
        // OpenCV Inpaint (Telea or NS)
        const outCanvas = await runOpenCVInpaint(
          sourceCanvasRef.current,
          maskCanvasRef.current,
          { method, radius: inpaintRadius, dilation: maskDilation }
        );

        const rCanvas = resultCanvasRef.current;
        if (rCanvas) {
          rCanvas.width = outCanvas.width;
          rCanvas.height = outCanvas.height;
          const rctx = rCanvas.getContext('2d');
          rctx?.drawImage(outCanvas, 0, 0);
        }

        const resultDataUrl = outCanvas.toDataURL('image/png');
        setImageState((prev) => prev ? { ...prev, resultSrc: resultDataUrl } : null);
        setViewMode('split');

        const duration = Math.round(performance.now() - startTime);
        setStats({
          timeMs: duration,
          method: method === 'ns' ? 'OpenCV Navier-Stokes' : 'OpenCV Telea',
          timestamp: new Date(),
          dimensions: { width: outCanvas.width, height: outCanvas.height },
        });
      }
    } catch (err: any) {
      console.error('Inpaint error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard Shortcuts (B, E, R, L, H, Ctrl+Z, Ctrl+Y, [, ])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'b':
          setTool('brush');
          break;
        case 'e':
          setTool('eraser');
          break;
        case 'r':
          setTool('rectangle');
          break;
        case 'l':
          setTool('lasso');
          break;
        case 'h':
          setTool('pan');
          break;
        case '[':
          setBrushSize((prev) => Math.max(4, prev - 6));
          break;
        case ']':
          setBrushSize((prev) => Math.min(160, prev + 6));
          break;
        case 'enter':
          if (hasMaskStrokes && !isProcessing) {
            handleProcessInpaint();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, hasMaskStrokes, isProcessing]);

  // Zoom helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(5, prev * 1.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.1, prev * 0.8));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleFitScreen = () => {
    if (!imageState) return;
    const containerW = window.innerWidth - 340;
    const containerH = window.innerHeight - 120;
    const fitScale = Math.min(1, (containerW * 0.85) / imageState.width, (containerH * 0.85) / imageState.height);
    setZoom(Math.max(0.2, fitScale));
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        method={method}
        setMethod={setMethod}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitScreen={handleFitScreen}
        onResetZoom={handleResetZoom}
        hasResult={!!imageState?.resultSrc}
        onOpenPresets={() => setIsPresetModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        isOpenCVLoaded={isOpenCVLoaded}
        isProcessing={isProcessing}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
        <Toolbar
          tool={tool}
          setTool={setTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          inpaintRadius={inpaintRadius}
          setInpaintRadius={setInpaintRadius}
          maskDilation={maskDilation}
          setMaskDilation={setMaskDilation}
          maskColor={maskColor}
          setMaskColor={setMaskColor}
          method={method}
          onClearMask={handleClearMask}
          onAutoDetect={handleAutoDetect}
          onProcessInpaint={handleProcessInpaint}
          isProcessing={isProcessing}
          onUploadImage={handleUploadImage}
          hasMaskStrokes={hasMaskStrokes}
          hasImage={!!imageState}
          isOpenCVLoaded={isOpenCVLoaded}
        />

        {/* Center Canvas Viewport */}
        <CanvasEditor
          imageState={imageState}
          maskCanvasRef={maskCanvasRef}
          sourceCanvasRef={sourceCanvasRef}
          resultCanvasRef={resultCanvasRef}
          tool={tool}
          brushSize={brushSize}
          maskColor={maskColor}
          viewMode={viewMode}
          setViewMode={setViewMode}
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          onMaskChange={handleMaskChange}
          onDropImage={handleUploadImage}
          isProcessing={isProcessing}
          onOpenPresets={() => setIsPresetModalOpen(true)}
        />
      </div>

      {/* Bottom Status & Dimension Bar */}
      <ComparisonBar
        imageState={imageState}
        stats={stats}
        viewMode={viewMode}
        setViewMode={setViewMode}
        zoom={zoom}
        onFitScreen={handleFitScreen}
      />

      {/* Presets Modal */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        activePresetId={activePresetId}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        imageState={imageState}
        resultCanvasRef={resultCanvasRef}
        stats={stats}
      />
    </div>
  );
}
