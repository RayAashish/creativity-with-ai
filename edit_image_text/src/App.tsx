import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { CanvasArea } from './components/CanvasArea';
import { Sidebar } from './components/Sidebar';
import { SamplePickerModal } from './components/SamplePickerModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { TextBlock, BrushStroke, ToolMode, HistoryState, SampleImage } from './types';
import { detectTextInImage } from './utils/ocr';
import { SAMPLE_IMAGES } from './utils/sampleImages';

export function App() {
  // Image State
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Layers & Drawing State
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Tool Modes & Canvas Controls
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // OCR & Processing State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{ status: string; progress: number } | null>(null);
  const [ocrLanguage, setOcrLanguage] = useState<string>('eng');
  const [ocrGranularity, setOcrGranularity] = useState<'line' | 'word'>('line');

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Brush settings
  const [brushSize, setBrushSize] = useState<number>(24);
  const [brushColor, setBrushColor] = useState<string>('#ffffff');
  const [brushOpacity, setBrushOpacity] = useState<number>(1);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('textmorph_gemini_key') || '';
  });

  // Undo / Redo History
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const recordHistory = useCallback(() => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [
        ...sliced,
        {
          textBlocks: JSON.parse(JSON.stringify(textBlocks)),
          brushStrokes: JSON.parse(JSON.stringify(brushStrokes)),
        },
      ];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [textBlocks, brushStrokes, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTextBlocks(JSON.parse(JSON.stringify(prevState.textBlocks)));
      setBrushStrokes(JSON.parse(JSON.stringify(prevState.brushStrokes)));
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTextBlocks(JSON.parse(JSON.stringify(nextState.textBlocks)));
      setBrushStrokes(JSON.parse(JSON.stringify(nextState.brushStrokes)));
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Helper to load an image source (data URL or object URL)
  const loadImageSource = (src: string, name: string, defaultBlocks?: Partial<TextBlock>[]) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setImageName(name);
      setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      setPanOffset({ x: 0, y: 0 });

      // Auto fit zoom based on typical viewport
      const screenW = window.innerWidth - 380;
      const screenH = window.innerHeight - 150;
      const fitRatio = Math.min(screenW / (img.naturalWidth || 800), screenH / (img.naturalHeight || 600), 1);
      setZoom(Math.max(0.2, Number(fitRatio.toFixed(2))));

      setBrushStrokes([]);

      if (defaultBlocks && defaultBlocks.length > 0) {
        const calibrated = defaultBlocks.map((b, idx) => ({
          id: b.id || `blk-${Date.now()}-${idx}`,
          text: b.text || '',
          originalText: b.originalText || b.text || '',
          x: b.x || 50,
          y: b.y || 50,
          width: b.width || 200,
          height: b.height || 40,
          rotation: b.rotation || 0,
          fontSize: b.fontSize || 32,
          fontFamily: b.fontFamily || "'Inter', sans-serif",
          fontWeight: b.fontWeight || '700',
          fontStyle: b.fontStyle || 'normal',
          textAlign: b.textAlign || 'left',
          color: b.color || '#ffffff',
          opacity: b.opacity ?? 1,
          letterSpacing: b.letterSpacing || 0,
          lineHeight: b.lineHeight || 1.15,
          strokeColor: b.strokeColor || '#000000',
          strokeWidth: b.strokeWidth || 0,
          shadowColor: b.shadowColor || 'transparent',
          shadowBlur: b.shadowBlur || 0,
          shadowOffsetX: b.shadowOffsetX || 0,
          shadowOffsetY: b.shadowOffsetY || 0,
          isUpperCase: !!b.isUpperCase,
          patchColor: b.patchColor || '#ffffff',
          patchType: b.patchType || 'auto-solid',
          patchPadding: b.patchPadding || 6,
          patchFeather: b.patchFeather || 2,
          patchOpacity: b.patchOpacity ?? 1,
          confidence: b.confidence || 99,
          isEdited: false,
          isLocked: false,
          isVisible: true,
        })) as TextBlock[];

        setTextBlocks(calibrated);
        setActiveBlockId(calibrated[0]?.id || null);

        // initialize history
        setHistory([
          {
            textBlocks: JSON.parse(JSON.stringify(calibrated)),
            brushStrokes: [],
          },
        ]);
        setHistoryIndex(0);
      } else {
        setTextBlocks([]);
        setActiveBlockId(null);
        setHistory([]);
        setHistoryIndex(-1);
        // Automatically trigger OCR scan
        runOcrOnImage(img);
      }
    };
    img.src = src;
  };

  // Upload image handler
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        loadImageSource(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // OCR Scan entire image
  const runOcrOnImage = async (imgToScan: HTMLImageElement) => {
    setIsScanning(true);
    setScanProgress({ status: 'Initializing OCR engine...', progress: 0.1 });
    try {
      const detected = await detectTextInImage(
        imgToScan,
        (p) => setScanProgress(p),
        ocrLanguage,
        undefined,
        ocrGranularity
      );
      setTextBlocks(detected);
      if (detected.length > 0) {
        setActiveBlockId(detected[0].id);
        showToast(
          `Detected ${detected.length} editable text blocks! Click any box on the image to edit.`,
          'success'
        );
      } else {
        showToast(
          'No text detected automatically. Try "Scan Area" (S) to draw a box or "Add Text" (T).',
          'info'
        );
      }
      setHistory([
        {
          textBlocks: JSON.parse(JSON.stringify(detected)),
          brushStrokes: [],
        },
      ]);
      setHistoryIndex(0);
    } catch (err: any) {
      console.error('OCR Scan failed:', err);
      showToast('OCR scan failed: ' + (err?.message || 'Error running OCR'), 'error');
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  // Targeted Area Scan
  const handleScanArea = async (area: { x: number; y: number; width: number; height: number }) => {
    if (!image) return;
    setIsScanning(true);
    setScanProgress({ status: 'Scanning selected area...', progress: 0.2 });
    try {
      const detected = await detectTextInImage(
        image,
        (p) => setScanProgress(p),
        ocrLanguage,
        area,
        ocrGranularity
      );
      if (detected.length > 0) {
        recordHistory();
        setTextBlocks((prev) => [...prev, ...detected]);
        setActiveBlockId(detected[0].id);
        showToast(`Found ${detected.length} text blocks in the selected area!`, 'success');
      } else {
        showToast('No text detected in selected area. Try adjusting the bounding box.', 'info');
      }
    } catch (err: any) {
      console.error('Area OCR failed:', err);
      showToast('Area OCR failed: ' + (err?.message || 'Error scanning area'), 'error');
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  // Color Eyedropper handler
  const handleColorSampled = (hex: string) => {
    if (activeBlockId) {
      recordHistory();
      setTextBlocks((prev) =>
        prev.map((b) => (b.id === activeBlockId ? { ...b, color: hex, isEdited: true } : b))
      );
    } else {
      setBrushColor(hex);
    }
  };

  // Select Sample Image
  const handleSelectSample = (sample: SampleImage) => {
    loadImageSource(sample.url, `${sample.title}.png`, sample.defaultBlocks);
  };

  // Paste image directly from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleImageUpload(blob);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Keyboard Shortcuts (Undo, Redo, Delete, Duplicate, Modes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Undo / Redo
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

      // If typing in input, don't trigger tool switching or deletion
      if (isInput) return;

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeBlockId) {
          const block = textBlocks.find((b) => b.id === activeBlockId);
          if (block) {
            recordHistory();
            const newId = `blk-dup-${Date.now()}`;
            const dup: TextBlock = { ...block, id: newId, x: block.x + 20, y: block.y + 20, isEdited: true };
            setTextBlocks((prev) => [...prev, dup]);
            setActiveBlockId(newId);
          }
        }
        return;
      }

      // Delete block
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (activeBlockId) {
          e.preventDefault();
          recordHistory();
          setTextBlocks((prev) => prev.filter((b) => b.id !== activeBlockId));
          setActiveBlockId(null);
        }
        return;
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setActiveBlockId(null);
        return;
      }

      // Tool switches
      if (e.key.toLowerCase() === 'v') setToolMode('select');
      if (e.key.toLowerCase() === 't') setToolMode('addText');
      if (e.key.toLowerCase() === 's') setToolMode('scanArea');
      if (e.key.toLowerCase() === 'b') setToolMode('brush');
      if (e.key.toLowerCase() === 'i') setToolMode('eyedropper');
      if (e.key.toLowerCase() === 'h') setToolMode('pan');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBlockId, textBlocks, historyIndex, history]);

  // Load first sample on first open so user immediately sees the app in action!
  useEffect(() => {
    if (!image && SAMPLE_IMAGES.length > 0) {
      const firstSample = SAMPLE_IMAGES[0];
      loadImageSource(firstSample.url, `${firstSample.title}.png`, firstSample.defaultBlocks);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        imageName={imageName}
        imageDimensions={imageDimensions}
        zoom={zoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isComparing={isComparing}
        setIsComparing={setIsComparing}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onZoomIn={() => setZoom((prev) => Math.min(5, prev * 1.2))}
        onZoomOut={() => setZoom((prev) => Math.max(0.15, prev * 0.8))}
        onZoomFit={() => {
          if (image) {
            const screenW = window.innerWidth - 380;
            const screenH = window.innerHeight - 150;
            const fitRatio = Math.min(screenW / (image.naturalWidth || 800), screenH / (image.naturalHeight || 600), 1);
            setZoom(Math.max(0.2, Number(fitRatio.toFixed(2))));
            setPanOffset({ x: 0, y: 0 });
          }
        }}
        textCount={textBlocks.length}
      />

      {/* Main Action Toolbar */}
      <Toolbar
        toolMode={toolMode}
        setToolMode={setToolMode}
        onImageUpload={handleImageUpload}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onScanImage={() => image && runOcrOnImage(image)}
        isScanning={isScanning}
        scanProgress={scanProgress}
        hasImage={!!image}
        ocrLanguage={ocrLanguage}
        setOcrLanguage={setOcrLanguage}
        ocrGranularity={ocrGranularity}
        setOcrGranularity={setOcrGranularity}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushOpacity={brushOpacity}
        setBrushOpacity={setBrushOpacity}
      />

      {/* Workspace Area: Interactive Canvas + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <CanvasArea
          image={image}
          textBlocks={textBlocks}
          setTextBlocks={setTextBlocks}
          brushStrokes={brushStrokes}
          setBrushStrokes={setBrushStrokes}
          activeBlockId={activeBlockId}
          setActiveBlockId={setActiveBlockId}
          toolMode={toolMode}
          setToolMode={setToolMode}
          zoom={zoom}
          setZoom={setZoom}
          panOffset={panOffset}
          setPanOffset={setPanOffset}
          isComparing={isComparing}
          onImageUpload={handleImageUpload}
          onOpenSamples={() => setIsSamplesOpen(true)}
          onScanArea={handleScanArea}
          onColorSampled={handleColorSampled}
          brushSize={brushSize}
          brushColor={brushColor}
          brushOpacity={brushOpacity}
          recordHistory={recordHistory}
          isScanning={isScanning}
          scanProgress={scanProgress}
        />

        {/* Sidebar Controls */}
        <Sidebar
          textBlocks={textBlocks}
          setTextBlocks={setTextBlocks}
          activeBlockId={activeBlockId}
          setActiveBlockId={setActiveBlockId}
          onScanImage={() => image && runOcrOnImage(image)}
          geminiApiKey={geminiApiKey}
          recordHistory={recordHistory}
        />

        {/* Floating Toast Notification */}
        {toast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
            <div
              className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center space-x-2 pointer-events-auto backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900/90 border-indigo-500/50 text-indigo-200'
              }`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SamplePickerModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectSample={handleSelectSample}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        image={image}
        textBlocks={textBlocks}
        brushStrokes={brushStrokes}
        originalFileName={imageName}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
      />
    </div>
  );
}

export default App;
