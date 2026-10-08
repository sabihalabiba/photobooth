'use client';
import { useRef } from 'react';

export type TextItem = { id: string; text: string; x: number; y: number; size: number; color: string };

export default function DraggableText({
  item, containerRef, onChange, onDelete,
}: {
  item: TextItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onChange: (t: TextItem) => void;
  onDelete: () => void;
}) {
  const dragging = useRef(false);

  function move(e: React.PointerEvent) {
    if (!dragging.current || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    onChange({ ...item, x, y });
  }

  return (
    <div
      onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={move}
      onPointerUp={() => (dragging.current = false)}
      onDoubleClick={onDelete}
      style={{
        position: 'absolute', left: `${item.x}%`, top: `${item.y}%`,
        transform: 'translate(-50%, -50%)', fontSize: item.size, color: item.color,
        cursor: 'grab', touchAction: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      }}
    >
      {item.text}
    </div>
  );
}