import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Crop,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Check,
  X,
  Image as ImageIcon,
  RefreshCw,
  Move
} from 'lucide-react';
import { Button } from './Button';

export const ImageFrameAdjuster = ({
  currentImageUrl,
  onImageSelected,
  onImageRemoved,
  className = ''
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState('4:3'); // '4:3', '1:1', '16:9'

  const fileInputRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const imageObjRef = useRef(null);
  const canvasRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Aspect ratio dimensions helper
  const getFrameRatioNumber = (ratioStr) => {
    switch (ratioStr) {
      case '1:1':
        return 1;
      case '16:9':
        return 16 / 9;
      case '4:3':
      default:
        return 4 / 3;
    }
  };

  // Handle local device file choice
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setImageSrc(dataUrl);
        resetAdjustments();
        setModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const resetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setAspectRatio('4:3');
  };

  // Load Image Object when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      drawCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw canvas whenever parameters change
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const targetWidth = 800;
    const ratio = getFrameRatioNumber(aspectRatio);
    const targetHeight = Math.round(targetWidth / ratio);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.save();

    // Move origin to center of frame
    const centerX = targetWidth / 2;
    const centerY = targetHeight / 2;
    ctx.translate(centerX + pan.x, centerY + pan.y);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply scale / zoom
    ctx.scale(zoom, zoom);

    // Draw image centered at origin
    // Calculate aspect fill initial scale
    const imgRatio = img.width / img.height;
    let drawW, drawH;
    if (imgRatio > ratio) {
      drawH = targetHeight;
      drawW = targetHeight * imgRatio;
    } else {
      drawW = targetWidth;
      drawH = targetWidth / imgRatio;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [zoom, rotation, pan, aspectRatio]);

  useEffect(() => {
    if (modalOpen) {
      drawCanvas();
    }
  }, [modalOpen, drawCanvas]);

  // Dragging logic for panning photo inside frame
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStartRef.current = { ...pan };
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  // Finalize Crop & Generate Data URL
  const handleApplyFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onImageSelected(finalDataUrl);
    setModalOpen(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Preview Container */}
      {currentImageUrl ? (
        <div className="relative max-w-sm mx-auto rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-sm group">
          <div className="aspect-4/3 w-full relative flex items-center justify-center bg-slate-950">
            <img
              src={currentImageUrl}
              alt="Produce Frame Preview"
              className="w-full h-full object-cover"
            />

            {/* Hover overlay with adjustment actions */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 backdrop-blur-xs">
              <span className="text-white text-[10px] font-black uppercase tracking-wider bg-amber-500/90 px-2.5 py-0.5 rounded-full shadow-xs">
                Photo Frame Active
              </span>
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setImageSrc(currentImageUrl);
                    setModalOpen(true);
                  }}
                  icon={Crop}
                  className="bg-white/90 hover:bg-white text-slate-900 text-xs font-extrabold shadow-sm py-1 px-2.5"
                >
                  Adjust Frame
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs border-slate-600 font-bold py-1 px-2.5"
                >
                  Change
                </Button>
                {onImageRemoved && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={onImageRemoved}
                    icon={X}
                    className="text-xs font-bold py-1 px-2"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white py-1.5 px-3 flex items-center justify-between text-[11px] border-t border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Check className="w-3.5 h-3.5" />
              Photo Formatted
            </span>
            <button
              type="button"
              onClick={() => {
                setImageSrc(currentImageUrl);
                setModalOpen(true);
              }}
              className="text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer text-[11px]"
            >
              Adjust Frame
            </button>
          </div>
        </div>
      ) : (
        /* Compact Upload Drag & Drop Trigger */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition-all rounded-xl p-4 text-center cursor-pointer space-y-2 group max-w-lg mx-auto"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">
              Upload Produce Photo from Device
            </p>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-tight">
            Click to choose a picture from your device. You can crop, zoom & adjust photo frame!
          </p>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors">
              <ImageIcon className="w-3.5 h-3.5" />
              Select Photo
            </span>
          </div>
        </div>
      )}

      {/* ADJUST PHOTO FRAME MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 border border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Crop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Adjust Photo Frame
                  </h3>
                  <p className="text-xs text-slate-400">
                    Drag photo to reposition, zoom in/out, or rotate for the marketplace card.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Canvas Frame Viewport */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Move className="w-3.5 h-3.5" />
                  Drag photo inside frame to align
                </span>
                <span>Frame Ratio: {aspectRatio}</span>
              </div>

              <div
                ref={previewContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="relative rounded-2xl bg-black overflow-hidden border-2 border-amber-500/60 shadow-inner cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
                style={{ touchAction: 'none' }}
              >
                {/* Canvas element */}
                <canvas
                  ref={canvasRef}
                  className="max-h-[340px] w-auto h-auto object-contain block mx-auto pointer-events-none"
                />

                {/* Grid overlay lines to guide user frame alignment */}
                <div className="absolute inset-0 border border-white/20 pointer-events-none grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-b border-white/15"></div>
                  <div className="border-r border-white/15"></div>
                  <div className="border-r border-white/15"></div>
                  <div></div>
                </div>
              </div>
            </div>

            {/* Controls Toolbar: Zoom, Rotate, Ratio */}
            <div className="space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              {/* Zoom Slider */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-300 w-16 shrink-0 flex items-center gap-1">
                  <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                  Zoom:
                </span>
                <input
                  type="range"
                  min="0.8"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <span className="text-xs font-mono font-bold text-amber-400 w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotation & Aspect Ratio Presets */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                {/* Rotation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Rotate:</span>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="Rotate 90 Left"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    -90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="Rotate 90 Right"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    +90°
                  </button>
                </div>

                {/* Aspect Ratio Presets */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-300">Frame Shape:</span>
                  {['4:3', '1:1', '16:9'].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        aspectRatio === ratio
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="px-2.5 py-1 text-slate-400 hover:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleApplyFrame}
                icon={Check}
                className="bg-emerald-600 hover:bg-emerald-500 font-extrabold shadow-lg px-6"
              >
                Apply & Save Frame
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
