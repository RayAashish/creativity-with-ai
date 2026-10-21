import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, FileText, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TextBlock, BrushStroke } from '../types';
import { exportImage, copyImageToClipboard, generateExportCanvas } from '../utils/imageExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: HTMLImageElement | null;
  textBlocks: TextBlock[];
  brushStrokes: BrushStroke[];
  originalFileName?: string | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  image,
  textBlocks,
  brushStrokes,
  originalFileName,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'pdf'>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [fileName, setFileName] = useState<string>('edited-image');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (originalFileName) {
      const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
      setFileName(`${nameWithoutExt}-edited`);
    }
  }, [originalFileName]);

  // Update Preview Canvas
  useEffect(() => {
    if (!isOpen || !image || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const exportCanvas = generateExportCanvas(image, textBlocks, brushStrokes);

    canvas.width = exportCanvas.width;
    canvas.height = exportCanvas.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(exportCanvas, 0, 0);
    }
  }, [isOpen, image, textBlocks, brushStrokes]);

  if (!isOpen || !image) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await exportImage(image, textBlocks, brushStrokes, {
        format,
        quality,
        fileName: fileName.trim() || 'edited-image',
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyImageToClipboard(image, textBlocks, brushStrokes);
    if (success) {
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Export Edited Image</h3>
            <p className="text-xs text-slate-400">
              Download your image or copy directly to clipboard.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div className="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-hidden">
            <div className="relative max-h-64 max-w-full flex items-center justify-center overflow-hidden rounded-lg shadow-md">
              <canvas
                ref={previewCanvasRef}
                className="max-h-64 max-w-full object-contain rounded"
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-3 font-mono">
              {image.naturalWidth || image.width} × {image.naturalHeight || image.height} px
            </div>
          </div>

          {/* Right: Settings */}
          <div className="space-y-4">
            {/* Format Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['png', 'jpeg', 'webp', 'pdf'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                      format === fmt
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {format === 'png' && 'Lossless clarity, ideal for graphics and transparent regions.'}
                {format === 'jpeg' && 'Standard web image format with adjustable compression.'}
                {format === 'webp' && 'Next-gen web format offering high compression and clarity.'}
                {format === 'pdf' && 'Print-ready vector PDF document.'}
              </p>
            </div>

            {/* Quality Slider (for JPEG / WEBP) */}
            {(format === 'jpeg' || format === 'webp') && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span className="font-semibold">Quality</span>
                  <span className="font-mono">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-1.5 accent-indigo-500 rounded cursor-pointer"
                />
              </div>
            )}

            {/* Filename Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                File Name
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none flex-1 font-mono"
                />
                <span className="text-xs text-slate-500 font-mono">.{format}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating...' : `Download ${format.toUpperCase()}`}</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-98 flex items-center justify-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Image to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
