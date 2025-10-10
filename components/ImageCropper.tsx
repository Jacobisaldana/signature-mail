import React, { useEffect, useMemo, useRef, useState } from 'react';

interface ImageCropperProps {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
  // Target output size (square)
  outputSize?: number; // px
}

// Simple image cropper (zoom + pan) without external deps.
// - Shows a square viewport where user can zoom and drag the image.
// - Exports a square JPEG via canvas.
export const ImageCropper: React.FC<ImageCropperProps> = ({ file, onCancel, onConfirm, outputSize = 400 }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  // We separate baseScale (cover viewport) from zoom to avoid aspect glitches
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ active: boolean; startX: number; startY: number; startOffX: number; startOffY: number } | null>(null);

  const viewport = 260; // visible crop area (square)

  // Read file as Data URL to avoid cache collisions with Object URLs
  useEffect(() => {
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled) setImageUrl(reader.result as string);
    };
    reader.onerror = () => {
      if (!cancelled) setImageUrl('');
    };
    reader.readAsDataURL(file);
    return () => {
      cancelled = true;
    };
  }, [file]);

  // When image loads, compute minScale to cover viewport
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNatural({ w, h });
    const coverScale = Math.max(viewport / w, viewport / h);
    setBaseScale(coverScale);
    setZoom(1);
    // Center image initially
    const scaledW = w * coverScale;
    const scaledH = h * coverScale;
    setOffset({ x: (viewport - scaledW) / 2, y: (viewport - scaledH) / 2 });
  };

  // Clamp offset so image always covers viewport (no empty spaces)
  const clampOffset = (next: { x: number; y: number }, totalScale: number) => {
    if (!natural) return next;
    const scaledW = natural.w * totalScale;
    const scaledH = natural.h * totalScale;
    const minX = viewport - scaledW;
    const minY = viewport - scaledH;
    return {
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y)),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDrag({ active: true, startX: e.clientX, startY: e.clientY, startOffX: offset.x, startOffY: offset.y });
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!drag?.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const total = baseScale * zoom;
    setOffset(clampOffset({ x: drag.startOffX + dx, y: drag.startOffY + dy }, total));
  };
  const endDrag = () => setDrag(null);

  useEffect(() => {
    if (!drag?.active) return;
    const move = (e: MouseEvent) => onMouseMove(e);
    const up = () => endDrag();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [drag]);

  const onWheel: React.WheelEventHandler = (e) => {
    if (!natural) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const nextZoom = Math.min(Math.max(1, zoom + delta), 4);
    setZoom(nextZoom);
    const total = baseScale * nextZoom;
    setOffset((prev) => clampOffset(prev, total));
  };

  const onSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = parseFloat(e.target.value);
    setZoom(nextZoom);
    const total = baseScale * nextZoom;
    setOffset((prev) => clampOffset(prev, total));
  };

  // Render to canvas and return blob
  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Map viewport to source rect on natural image
    const total = baseScale * zoom;
    const sx = (-offset.x) / total;
    const sy = (-offset.y) / total;
    const sw = viewport / total;
    const sh = viewport / total;

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputSize, outputSize);
    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, 'image/jpeg', 0.95);
  };

  const sliderMin = 1;
  const sliderMax = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-lg">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Adjust Image</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative mx-auto border bg-gray-100"
            style={{ width: viewport, height: viewport, overflow: 'hidden', cursor: drag?.active ? 'grabbing' : 'grab', borderRadius: '50%' }}
            onMouseDown={onMouseDown}
            onWheel={onWheel}
          >
            {imageUrl && (
              <img
                ref={imgRef}
                src={imageUrl}
                alt="preview"
                draggable={false}
                onLoad={handleImageLoad}
                style={{ position: 'absolute', left: offset.x, top: offset.y, width: natural ? natural.w * baseScale : 'auto', height: natural ? natural.h * baseScale : 'auto', transform: `scale(${zoom})`, transformOrigin: 'top left', userSelect: 'none' }}
              />
            )}
            {/* optional ring */}
            <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80" />
          </div>

          <div className="mt-4 flex items-center space-x-3">
            <span className="text-xs text-gray-500">Zoom</span>
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={0.01}
              value={zoom}
              onChange={onSlider}
              className="flex-1"
            />
          </div>
        </div>
        <div className="px-4 py-3 border-t flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 rounded-md bg-amber-500 text-black font-semibold hover:bg-amber-600">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
