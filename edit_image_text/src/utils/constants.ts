import { FontOption, StylePreset } from '../types';

export const AVAILABLE_FONTS: FontOption[] = [
  // Sans-serif
  { name: 'Inter', family: "'Inter', sans-serif", category: 'sans-serif' },
  { name: 'Roboto', family: "'Roboto', sans-serif", category: 'sans-serif' },
  { name: 'Poppins', family: "'Poppins', sans-serif", category: 'sans-serif' },
  { name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'sans-serif' },
  
  // Serif
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'serif' },
  { name: 'Merriweather', family: "'Merriweather', serif", category: 'serif' },
  
  // Display & Impact
  { name: 'Impact / Anton', family: "'Anton', 'Impact', sans-serif", category: 'display' },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'display' },
  { name: 'Oswald', family: "'Oswald', sans-serif", category: 'display' },
  { name: 'Bangers (Comic)', family: "'Bangers', cursive", category: 'display' },
  
  // Handwriting & Script
  { name: 'Caveat', family: "'Caveat', cursive", category: 'handwriting' },
  { name: 'Pacifico', family: "'Pacifico', cursive", category: 'handwriting' },
  { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'handwriting' },
  
  // Monospace & Retro
  { name: 'Courier Prime', family: "'Courier Prime', monospace", category: 'monospace' },
  { name: 'Comic Neue', family: "'Comic Neue', cursive", category: 'handwriting' },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'meme-impact',
    name: 'Meme Impact',
    description: 'Classic meme bold white text with thick black outline',
    previewClass: 'font-anton uppercase tracking-wider text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]',
    styles: {
      fontFamily: "'Anton', 'Impact', sans-serif",
      fontWeight: '900',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUpperCase: true,
      textAlign: 'center',
      shadowBlur: 2,
      shadowColor: '#000000',
      patchType: 'auto-solid',
    },
  },
  {
    id: 'modern-clean',
    name: 'Modern Sans',
    description: 'Crisp minimal aesthetic with clean letter spacing',
    previewClass: 'font-inter font-semibold tracking-wide text-white',
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: '600',
      color: '#FFFFFF',
      strokeWidth: 0,
      letterSpacing: 1,
      isUpperCase: false,
      shadowBlur: 4,
      shadowColor: 'rgba(0,0,0,0.4)',
      patchType: 'auto-solid',
    },
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    description: 'Glowing futuristic neon cyan with intense light drop',
    previewClass: 'font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    styles: {
      fontFamily: "'Oswald', sans-serif",
      fontWeight: '700',
      color: '#22d3ee',
      strokeWidth: 0,
      shadowColor: '#06b6d4',
      shadowBlur: 16,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      isUpperCase: true,
      patchType: 'auto-solid',
    },
  },
  {
    id: 'golden-luxury',
    name: 'Golden Luxury',
    description: 'Elegant serif with refined warm champagne tone',
    previewClass: 'font-serif italic text-amber-200',
    styles: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: '700',
      fontStyle: 'italic',
      color: '#fde68a',
      strokeWidth: 0,
      shadowBlur: 6,
      shadowColor: 'rgba(0,0,0,0.6)',
      patchType: 'auto-solid',
    },
  },
  {
    id: 'sale-badge',
    name: 'Sale Promo',
    description: 'Attention-grabbing bright yellow and bold punch',
    previewClass: 'font-bebas text-amber-300 bg-red-600 px-1',
    styles: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontWeight: '700',
      color: '#fef08a',
      strokeColor: '#991b1b',
      strokeWidth: 2,
      isUpperCase: true,
      patchType: 'auto-solid',
    },
  },
  {
    id: 'casual-script',
    name: 'Casual Handwritten',
    description: 'Organic, friendly handwritten script',
    previewClass: 'font-caveat font-bold text-emerald-300 text-lg',
    styles: {
      fontFamily: "'Caveat', cursive",
      fontWeight: '700',
      color: '#6ee7b7',
      strokeWidth: 0,
      isUpperCase: false,
      patchType: 'auto-solid',
    },
  },
  {
    id: 'vintage-type',
    name: 'Typewriter Vintage',
    description: 'Rustic monospace with authentic dark ink feeling',
    previewClass: 'font-mono text-amber-100',
    styles: {
      fontFamily: "'Courier Prime', monospace",
      fontWeight: '700',
      color: '#fef3c7',
      strokeWidth: 0,
      letterSpacing: 2,
      isUpperCase: true,
      patchType: 'auto-solid',
    },
  },
];

export const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#F8FAFC', '#64748B', '#0F172A',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#F43F5E', '#FEF08A', '#A7F3D0', '#BAE6FD',
];
