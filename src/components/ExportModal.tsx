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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#111112] border border-[#2a2a2c] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#2a2a2c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1a1a1c] text-emerald-400 border border-[#2a2a2c]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Export Clean Image</h3>
              <p className="text-xs text-[#a1a1aa]">Save your high-resolution watermark-free photo.</p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#1f1f21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Format Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider block">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((f) => (
                <button
                  key={f}
                  id={`export-format-${f}-btn`}
                  onClick={() => setFormat(f)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase transition-colors ${
                    format === f
                      ? 'bg-[#2a2a2c] border-[#6366f1]/50 text-white'
                      : 'bg-[#161618] border-[#2a2a2c] text-[#71717a] hover:text-[#e2e2e4] hover:bg-[#1f1f21]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPG and WebP) */}
          {format !== 'png' && (
            <div className="space-y-2 bg-[#161618] p-3 rounded-xl border border-[#2a2a2c]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#a1a1aa]">Compression Quality</span>
                <span className="font-mono text-[#6366f1] font-bold">{quality}%</span>
              </div>
              <input
                id="export-quality-slider"
                type="range"
                min="50"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-[#6366f1] h-1.5 bg-[#2a2a2c] rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Info Card */}
          <div className="bg-[#161618] rounded-xl p-3.5 border border-[#2a2a2c] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#a1a1aa]">
              <span>Resolution:</span>
              <span className="font-mono font-medium text-[#e2e2e4]">
                {imageState.width} × {imageState.height} px
              </span>
            </div>
            {stats && (
              <div className="flex items-center justify-between text-[#a1a1aa]">
                <span>Inpainting Algorithm:</span>
                <span className="font-medium text-[#6366f1] uppercase">
                  {stats.method} ({stats.timeMs}ms)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-[#2a2a2c] bg-[#161618] flex items-center gap-3">
          <button
            id="export-copy-clipboard-btn"
            onClick={handleCopyToClipboard}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#2a2a2c] hover:bg-[#3a3a3c] text-[#e2e2e4] font-medium text-xs border border-[#3a3a3c] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#a1a1aa]" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            id="export-download-file-btn"
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-xs shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download .{format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
