export type PatchType = 'auto-solid' | 'auto-gradient' | 'blur-texture' | 'custom' | 'none';

export interface TextBlock {
  id: string;
  text: string;
  originalText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  opacity: number; // 0 to 1
  letterSpacing: number; // in px
  lineHeight: number; // multiplier e.g. 1.2
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  isUpperCase: boolean;
  
  // Magic background erase / patch properties
  patchColor: string;
  patchType: PatchType;
  patchPadding: number; // px to expand boundary
  patchFeather: number; // soft edge blur in px
  patchOpacity: number; // 0 to 1
  
  confidence: number; // 0 to 100
  isEdited: boolean;
  isLocked: boolean;
  isVisible: boolean;
  isCustom?: boolean; // added by user
}

export type ToolMode = 'select' | 'addText' | 'scanArea' | 'brush' | 'pan' | 'eyedropper';

export interface BrushStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
}

export interface HistoryState {
  textBlocks: TextBlock[];
  brushStrokes: BrushStroke[];
}

export interface FontOption {
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  sampleText?: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  previewClass: string;
  styles: Partial<TextBlock>;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  thumbnail: string;
  defaultBlocks?: Partial<TextBlock>[];
}
