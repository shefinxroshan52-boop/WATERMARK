import { SamplePreset } from '../types';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'stock-mountains',
    title: 'Stock Photo Watermark',
    category: 'Landscape',
    badge: 'Diagonal Watermark',
    description: 'Scenic mountain lake with semi-transparent tiled stock photo watermark text across the image.',
    watermarkText: 'SHUTTERSTOCK PREVIEW',
    drawPreset: (canvas: HTMLCanvasElement) => {
      const w = 1200;
      const h = 800;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Background gradient sky (sunset)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.3, '#4338ca');
      skyGrad.addColorStop(0.6, '#db2777');
      skyGrad.addColorStop(0.85, '#f59e0b');
      skyGrad.addColorStop(1, '#fed7aa');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Sun glow
      const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.55, 260);
      sunGrad.addColorStop(0, '#fffbeb');
      sunGrad.addColorStop(0.2, '#fde68a');
      sunGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.4)');
      sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.55, 260, 0, Math.PI * 2);
      ctx.fill();

      // Distant mountains (Layer 1)
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.58);
      ctx.lineTo(w * 0.2, h * 0.38);
      ctx.lineTo(w * 0.38, h * 0.48);
      ctx.lineTo(w * 0.52, h * 0.34);
      ctx.lineTo(w * 0.7, h * 0.45);
      ctx.lineTo(w * 0.88, h * 0.32);
      ctx.lineTo(w, h * 0.52);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(0, h * 0.7);
      ctx.closePath();
      ctx.fill();

      // Midground mountains (Layer 2)
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.lineTo(w * 0.15, h * 0.48);
      ctx.lineTo(w * 0.35, h * 0.6);
      ctx.lineTo(w * 0.6, h * 0.42);
      ctx.lineTo(w * 0.8, h * 0.58);
      ctx.lineTo(w, h * 0.48);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(0, h * 0.7);
      ctx.closePath();
      ctx.fill();

      // Foreground Lake with reflection
      const lakeGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
      lakeGrad.addColorStop(0, '#172554');
      lakeGrad.addColorStop(0.3, '#1e3a8a');
      lakeGrad.addColorStop(0.7, '#1e293b');
      lakeGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, h * 0.65, w, h * 0.35);

      // Lake ripples / reflections
      ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
      for (let i = 0; i < 40; i++) {
        const ry = h * 0.66 + (i * 8);
        const rx = w * 0.5 + (Math.sin(i * 1.5) * 120);
        const rw = 180 + Math.sin(i * 0.8) * 80;
        ctx.fillRect(rx - rw / 2, ry, rw, 2.5);
      }

      // Foreground pine tree silhouettes
      ctx.fillStyle = '#090d16';
      const drawPine = (x: number, base: number, height: number, width: number) => {
        ctx.beginPath();
        ctx.moveTo(x, base - height);
        ctx.lineTo(x + width / 2, base);
        ctx.lineTo(x - width / 2, base);
        ctx.closePath();
        ctx.fill();
      };
      drawPine(80, h * 0.85, 240, 90);
      drawPine(140, h * 0.9, 320, 110);
      drawPine(w - 120, h * 0.88, 280, 100);
      drawPine(w - 60, h * 0.92, 340, 120);

      // --- WATERMARK OVERLAY ---
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(-Math.PI / 8);

      // Central prominent watermark
      ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.fillText('STOCKPHOTO PREVIEW © 2026', 0, 0);

      // Grid repeating subtle watermarks
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillText('DO NOT COPY • SAMPLE ASSET', 0, -140);
      ctx.fillText('DO NOT COPY • SAMPLE ASSET', 0, 140);
      ctx.restore();

      // Corner watermark stamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('IMAGE ID: #849204-HD', w - 40, h - 35);
    },
  },
  {
    id: 'vintage-camera-date',
    title: 'Camera Date Timestamp',
    category: 'Travel Photography',
    badge: 'Orange Timestamp',
    description: 'Vibrant golden hour seaside portrait with typical digital camera date/time stamp in the corner.',
    watermarkText: "'26 08 14 17:48",
    drawPreset: (canvas: HTMLCanvasElement) => {
      const w = 1200;
      const h = 800;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Ocean Sunset
      const seaGrad = ctx.createLinearGradient(0, 0, 0, h);
      seaGrad.addColorStop(0, '#f97316');
      seaGrad.addColorStop(0.35, '#f43f5e');
      seaGrad.addColorStop(0.55, '#8b5cf6');
      seaGrad.addColorStop(0.65, '#0ea5e9');
      seaGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, 0, w, h);

      // Sun disc
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(w * 0.65, h * 0.48, 55, 0, Math.PI * 2);
      ctx.fill();

      // Ocean waves / surface
      ctx.fillStyle = 'rgba(12, 74, 110, 0.7)';
      ctx.fillRect(0, h * 0.52, w, h * 0.48);

      // Sun glitter path
      const glitterGrad = ctx.createLinearGradient(w * 0.65, h * 0.52, w * 0.65, h);
      glitterGrad.addColorStop(0, 'rgba(254, 215, 170, 0.8)');
      glitterGrad.addColorStop(0.8, 'rgba(254, 215, 170, 0.1)');
      ctx.fillStyle = glitterGrad;
      ctx.beginPath();
      ctx.moveTo(w * 0.65 - 30, h * 0.52);
      ctx.lineTo(w * 0.65 + 30, h * 0.52);
      ctx.lineTo(w * 0.65 + 140, h);
      ctx.lineTo(w * 0.65 - 140, h);
      ctx.closePath();
      ctx.fill();

      // Silhouette of sailboat
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.53);
      ctx.lineTo(w * 0.39, h * 0.53);
      ctx.lineTo(w * 0.38, h * 0.55);
      ctx.lineTo(w * 0.34, h * 0.55);
      ctx.closePath();
      ctx.fill();
      // Sail
      ctx.beginPath();
      ctx.moveTo(w * 0.365, h * 0.53);
      ctx.lineTo(w * 0.365, h * 0.46);
      ctx.lineTo(w * 0.385, h * 0.52);
      ctx.closePath();
      ctx.fill();

      // --- RETRO CAMERA TIMESTAMP (BOTTOM RIGHT) ---
      const stampX = w - 60;
      const stampY = h - 60;

      ctx.save();
      ctx.font = 'bold 38px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff7b00';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText("'26  08  14   17:48", stampX, stampY);
      ctx.restore();
    },
  },
  {
    id: 'product-brand-logo',
    title: 'Brand Logo & Price Badge',
    category: 'E-Commerce',
    badge: 'Corner Logo + Badge',
    description: 'Clean studio product mock with promotional sticker and manufacturer watermark banner.',
    watermarkText: 'VERIFIED BRAND ™',
    drawPreset: (canvas: HTMLCanvasElement) => {
      const w = 1200;
      const h = 800;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Studio backdrop gradient
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 80, w * 0.5, h * 0.5, 600);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(0.6, '#e2e8f0');
      bgGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Studio podium
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.72, 280, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elegant Ceramic Vase / Product
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(w * 0.5 - 50, h * 0.28);
      ctx.quadraticCurveTo(w * 0.5 - 140, h * 0.48, w * 0.5 - 75, h * 0.7);
      ctx.lineTo(w * 0.5 + 75, h * 0.7);
      ctx.quadraticCurveTo(w * 0.5 + 140, h * 0.48, w * 0.5 + 50, h * 0.28);
      ctx.closePath();
      ctx.fill();

      // Vase sheen / highlights
      const vaseSheen = ctx.createLinearGradient(w * 0.5 - 70, 0, w * 0.5 + 70, 0);
      vaseSheen.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      vaseSheen.addColorStop(0.4, 'rgba(255, 255, 255, 0.35)');
      vaseSheen.addColorStop(0.6, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = vaseSheen;
      ctx.fill();

      // --- WATERMARK: BRAND LOGO (TOP LEFT) ---
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.arc(90, 80, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('AV', 90, 88);

      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.textAlign = 'left';
      ctx.fillText('AURA VAULT™', 130, 87);
      ctx.restore();

      // --- WATERMARK: PROMO BADGE (TOP RIGHT) ---
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(w - 220, 50, 160, 48, 8);
      ctx.fill();

      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('SPECIAL OFFER', w - 140, 80);
      ctx.restore();

      // Bottom copyright bar
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('© 2026 LUXURY GOODS CO. ALL RIGHTS RESERVED • PROMOTIONAL USE ONLY', w * 0.5, h - 30);
    },
  },
  {
    id: 'confidential-stamp',
    title: 'Confidential Stamp & Watermark',
    category: 'Document / Blueprint',
    badge: 'Red Stamp',
    description: 'Technical architectural drafting canvas with prominent angled red "CONFIDENTIAL" rubber stamp.',
    watermarkText: 'CONFIDENTIAL',
    drawPreset: (canvas: HTMLCanvasElement) => {
      const w = 1200;
      const h = 800;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Blueprint blue background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Drafting shapes
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      // Outer border frame
      ctx.strokeRect(50, 50, w - 100, h - 100);

      // Floorplan schematic lines
      ctx.strokeRect(160, 160, 420, 360);
      ctx.strokeRect(580, 160, 460, 220);
      ctx.strokeRect(580, 380, 460, 140);

      // Room labels
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText('ZONE A - MAIN ATRIUM', 220, 240);
      ctx.fillText('ZONE B - LABORATORY', 640, 240);
      ctx.fillText('ZONE C - SECURE STORAGE', 640, 440);

      // Title block
      ctx.strokeRect(w - 380, h - 180, 280, 90);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('PROJECT: ALPHA-9', w - 360, h - 145);
      ctx.fillText('SCALE: 1:100  REV: 4.2', w - 360, h - 115);

      // --- RED RUBBER STAMP WATERMARK ---
      ctx.save();
      ctx.translate(w * 0.5, h * 0.48);
      ctx.rotate(-Math.PI / 7);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 8;
      ctx.strokeRect(-240, -65, 480, 130);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(-230, -55, 460, 110);

      ctx.font = 'bold 56px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.88)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CONFIDENTIAL', 0, -10);

      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText('DO NOT DISTRIBUTE', 0, 30);
      ctx.restore();
    },
  },
];
