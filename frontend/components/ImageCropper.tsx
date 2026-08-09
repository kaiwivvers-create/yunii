'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  imageSrc: string;
  title?: string;
  /** Circular crop preview (avatars). Defaults to a rounded square. */
  round?: boolean;
  /** Crop viewport size in px. */
  size?: number;
  /** Output square size in px. */
  outputSize?: number;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

/**
 * A simple, dependable square cropper: drag to reposition, scroll or use the
 * slider to zoom, with a live preview of the final crop.
 */
export default function ImageCropper({
  open,
  imageSrc,
  title = 'Crop image',
  round = false,
  size = 280,
  outputSize = 256,
  onCancel,
  onConfirm,
}: ImageCropperProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const areaRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; offX: number; offY: number } | null>(null);

  // (Re)load the image whenever the dialog opens
  useEffect(() => {
    if (!open) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = imageSrc;
    return () => setImg(null);
  }, [open, imageSrc]);

  // Native wheel listener (passive:false so we can prevent page scroll)
  useEffect(() => {
    const el = areaRef.current;
    if (!el || !open || !img) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(4, Math.max(1, +(z + (e.deltaY < 0 ? 0.1 : -0.1)).toFixed(2))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, img]);

  if (!open || !img) return null;

  // Cover-fit the image to the square, then apply zoom
  const cover = Math.max(size / img.naturalWidth, size / img.naturalHeight);
  const displayW = img.naturalWidth * cover * zoom;
  const displayH = img.naturalHeight * cover * zoom;
  const maxX = Math.max(0, (displayW - size) / 2);
  const maxY = Math.max(0, (displayH - size) / 2);
  const clamped = {
    x: Math.max(-maxX, Math.min(maxX, offset.x)),
    y: Math.max(-maxY, Math.min(maxY, offset.y)),
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, offX: offset.x, offY: offset.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setOffset({
        x: dragRef.current.offX + (ev.clientX - dragRef.current.startX),
        y: dragRef.current.offY + (ev.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleConfirm = () => {
    const scale = img.naturalWidth / displayW;
    const sx = (displayW / 2 + clamped.x - size / 2) * scale;
    const sy = (displayH / 2 + clamped.y - size / 2) * scale;
    const sw = size * scale;
    const sh = size * scale;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputSize, outputSize);
    onConfirm(canvas.toDataURL('image/jpeg', 0.88));
  };

  const k = 90 / size; // preview scale factor
  const previewShape = round ? 'rounded-full' : 'rounded-xl';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-2xl p-6 max-w-lg w-full animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">{title}</h3>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Crop area */}
          <div
            ref={areaRef}
            className="relative overflow-hidden rounded-2xl border-4 border-[#9370DB] dark:border-dark-violet bg-black/10 shadow-lg select-none shrink-0"
            style={{ width: size, height: size, touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onDoubleClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
          >
            <img
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none cursor-move"
              style={{
                width: displayW,
                height: displayH,
                transform: `translate(calc(-50% + ${clamped.x}px), calc(-50% + ${clamped.y}px))`,
              }}
            />
            {/* Rule-of-thirds grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
            </div>
          </div>

          {/* Live preview */}
          <div className="text-center shrink-0">
            <div className={`${previewShape} overflow-hidden mx-auto mb-2 border-2 border-[#9370DB]/30 bg-black/10`} style={{ width: 90, height: 90 }}>
              <div className="relative h-full w-full">
                <img
                  src={imageSrc}
                  alt="Final preview"
                  draggable={false}
                  className="absolute left-1/2 top-1/2 max-w-none"
                  style={{
                    width: displayW * k,
                    height: displayH * k,
                    transform: `translate(calc(-50% + ${clamped.x * k}px), calc(-50% + ${clamped.y * k}px))`,
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary">Preview</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-dark-text-secondary text-center mt-4">
          Drag to reposition · scroll or use the slider to zoom
        </p>

        {/* Zoom */}
        <div className="mt-4 flex items-center gap-3">
          <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#9370DB] dark:accent-dark-violet"
          />
          <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="w-10 text-right text-sm font-medium text-slate-700 dark:text-dark-text-secondary">
            {zoom.toFixed(1)}×
          </span>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#F0EEF8] dark:border-dark-border">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-slate-600 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors shadow-sm shadow-[#9370DB]/30"
          >
            <Check className="w-4 h-4" />
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
