import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, Trash2, PenTool } from 'lucide-react';
import StoryboardCanvas from './StoryboardCanvas';

export default function SketchPadModal({ shot, project, onClose, onSaveSketch }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#F59E0B');
  const [lineWidth, setLineWidth] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (shot?.sketchDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = shot.sketchDataUrl;
    }
  }, [shot]);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSaveSketch(shot.id, dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl glass bg-[#0d0b14]/95 p-5 animate-rise">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-base font-bold text-white">
              Draw Storyboard Pose / Director Overlay — Shot {shot.number}: {shot.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Grease Pencil Color:</span>
            {['#F59E0B', '#38BDF8', '#F43F5E', '#FFFFFF', '#10B981'].map((col) => (
              <button
                key={col}
                onClick={() => setStrokeColor(col)}
                className={`h-6 w-6 rounded-full border-2 transition ${
                  strokeColor === col ? 'scale-110 border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Brush</span>
              <input
                type="range"
                min="2"
                max="14"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-20 accent-amber-400"
              />
            </label>
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Layer
            </button>
          </div>
        </div>

        {/* Layered Storyboard + Interactive Drawing Canvas */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-amber-500/40">
          <StoryboardCanvas
            shot={{ ...shot, sketchDataUrl: null }}
            project={project}
            className="pointer-events-none h-full w-full"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            className="absolute inset-0 h-full w-full cursor-crosshair"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Tip: Sketch rough lines-of-action, facial expressions, or red camera motion arrows over the procedural frame.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 btn btn-primary"
            >
              <Check className="h-3.5 w-3.5" /> Save Sketch Overlay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
