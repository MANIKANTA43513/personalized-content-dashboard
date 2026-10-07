'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ContentItem } from '@/types/content';
import { useAppDispatch } from '@/store/hooks';
import { setOrder } from '@/store/slices/feedSlice';
import { announce } from '@/store/slices/uiSlice';
import { ContentCard } from './ContentCard';

function SortableCard({ item, index, total }: { item: ContentItem; index: number; total: number }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      data-testid="drag-handle"
      aria-label={t('drag.handle', { title: item.title, position: index + 1, total })}
      className="flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full border border-line bg-surface/90 text-muted hover:text-ink active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={isDragging ? 'opacity-40' : undefined}
    >
      <ContentCard item={item} dragHandle={handle} static />
    </li>
  );
}

/**
 * Drag-and-drop grid. Dragging starts only from the grip handle, so links and the
 * favourite button keep working. Keyboard: focus the handle, Space to lift, arrows to move, Space to drop.
 */
export function SortableFeed({ items }: { items: ContentItem[] }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = items.map((i) => i.id);
  const active = items.find((i) => i.id === activeId) ?? null;

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const from = ids.indexOf(String(a.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    dispatch(setOrder(arrayMove(ids, from, to)));
    dispatch(announce(t('drag.dropped', { position: to + 1, total: ids.length })));
  };

  return (
    <DndContext
      id="feed-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements: {
          onDragStart: () => t('drag.lifted'),
          onDragOver: () => undefined,
          onDragEnd: () => undefined,
          onDragCancel: () => t('drag.cancelled'),
        },
        screenReaderInstructions: { draggable: t('drag.instructions') },
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" data-testid="feed-list">
          {items.map((item, i) => (
            <SortableCard key={item.id} item={item} index={i} total={items.length} />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180 }}>
        {active ? (
          <div className="rotate-1 cursor-grabbing opacity-95 shadow-lift">
            <ContentCard item={active} dragging static />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
