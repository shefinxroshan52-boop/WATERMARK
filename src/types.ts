export type ToolType = 'brush' | 'eraser' | 'rectangle' | 'lasso' | 'pan';

export type InpaintMethod = 'telea' | 'ns' | 'ai';

export type ViewMode = 'split' | 'side-by-side' | 'result' | 'mask-overlay';

export type MaskColor = 'red' | 'green' | 'cyan' | 'yellow' | 'white';

export interface ImageState {
  originalSrc: string;
  resultSrc: string | null;
  width: number;
  height: number;
  name: string;
  fileSize?: number;
}

export interface InpaintOptions {
  method: InpaintMethod;
  radius: number;
  dilation: number; // 0 to 10px mask dilation to prevent fringe
  aiPrompt?: string;
}

export interface ProcessingStats {
  timeMs: number;
  method: string;
  timestamp: Date;
  dimensions: { width: number; height: number };
}

export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  watermarkText?: string;
  drawPreset: (canvas: HTMLCanvasElement) => void;
}
