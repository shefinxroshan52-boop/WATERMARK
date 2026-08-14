import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ImageState, ProcessingStats } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageState: ImageState | null;
  resultCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  stats: ProcessingStats | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageState,
  resultCanvasRef,
  stats,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(92);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageState || !imageState.resultSrc) return null;

  const handleDownload = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const dataUrl = canvas.toDataURL(mimeType, quality / 100);

    const a = document.createElement('a');
    a.href = dataUrl;
    const baseName = imageState.name.replace(/\.[^/.]+$/, '') || 'image';
    a.download = `${baseName}-watermark-removed.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    onClose();
  };

  const handleCopyToClipboard = async () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }, 'image/png');
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Export Clean Image</h3>
              <p className="text-xs text-slate-400">Save your high-resolution watermark-free photo.</p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Format Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((f) => (
                <button
                  key={f}
                  id={`export-format-${f}-btn`}
                  onClick={() => setFormat(f)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                    format === f
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPG and WebP) */}
          {format !== 'png' && (
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Compression Quality</span>
                <span className="font-mono text-indigo-400 font-bold">{quality}%</span>
              </div>
              <input
                id="export-quality-slider"
                type="range"
                min="50"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Info Card */}
          <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Resolution:</span>
              <span className="font-mono font-semibold text-slate-200">
                {imageState.width} × {imageState.height} px
              </span>
            </div>
            {stats && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Inpainting Algorithm:</span>
                <span className="font-semibold text-indigo-400 uppercase">
                  {stats.method} ({stats.timeMs}ms)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
          <button
            id="export-copy-clipboard-btn"
            onClick={handleCopyToClipboard}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            id="export-download-file-btn"
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download .{format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
