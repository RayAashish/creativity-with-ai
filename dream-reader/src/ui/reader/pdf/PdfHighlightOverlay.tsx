import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useAnnotationStore } from '../../../stores/annotation-store';
import { denormalizeRect } from '../../../reader-core/anchoring/pdf-rects';

interface Props {
  pageNumber: number;
  width: number;
  height: number;
}

export const PdfHighlightOverlay: React.FC<Props> = ({ pageNumber, width, height }) => {
  const { annotations, activeAnnotationId, setActiveAnnotationId } = useAnnotationStore();

  const pageAnnotations = annotations.filter(
    (a) => a.anchor.type === 'pdf' && a.anchor.page === pageNumber && a.kind !== 'ink'
  );

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="absolute inset-0 pointer-events-none z-10"
    >
      {pageAnnotations.map((ann) => {
        if (ann.anchor.type !== 'pdf') return null;
        const rects = ann.anchor.normalizedRects;
        const isSelected = activeAnnotationId === ann.id;

        return (
          <div key={ann.id} id={`annotation-${ann.id}`} className="contents">
            {rects.map((r, rIdx) => {
              const denorm = denormalizeRect(r, width, height);

              return (
                <div
                  key={rIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAnnotationId(ann.id);
                  }}
                  style={{
                    left: `${denorm.left}px`,
                    top: `${denorm.top}px`,
                    width: `${denorm.width}px`,
                    height: `${denorm.height}px`,
                    backgroundColor:
                      ann.kind === 'highlight'
                        ? `${ann.color}77`
                        : ann.kind === 'comment'
                        ? `${ann.color}55`
                        : 'transparent',
                    borderBottom:
                      ann.kind === 'underline' ? `2.5px solid ${ann.color}` : 'none',
                    textDecoration:
                      ann.kind === 'strikethrough' ? 'line-through' : 'none',
                  }}
                  className={`absolute pointer-events-auto cursor-pointer transition-opacity rounded-xs ${
                    isSelected ? 'ring-2 ring-amber-500' : 'hover:opacity-90'
                  }`}
                  title={ann.noteText || ann.anchor.textQuote}
                >
                  {/* Strikethrough middle bar */}
                  {ann.kind === 'strikethrough' && (
                    <div
                      style={{ backgroundColor: ann.color }}
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px]"
                    />
                  )}
                </div>
              );
            })}

            {/* Comment Marker Icon */}
            {ann.kind === 'comment' && rects.length > 0 && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAnnotationId(ann.id);
                }}
                style={{
                  left: `${denormalizeRect(rects[0], width, height).left - 24}px`,
                  top: `${denormalizeRect(rects[0], width, height).top}px`,
                }}
                className={`absolute pointer-events-auto cursor-pointer p-1 rounded-full shadow-xs transition-transform hover:scale-110 z-20 ${
                  isSelected
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : 'bg-white text-amber-600 border border-amber-200'
                }`}
                title={`Note: ${ann.noteText || 'Click to read'}`}
              >
                <MessageSquare className="w-3 h-3 fill-current" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
