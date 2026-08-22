import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '../LanguageContext';
import { useTripData } from '../DataContext';
import { useAdminRow, useAdminAddRow } from '../adminEditing';
import { reorderRows } from '../services/dataService';
import EditableField from './admin/EditableField';
import { AddRowButton, DeleteRowButton, UndoButton } from './admin/AdminControls';

const TARGET_TAB = 'GeneralAgenda';
const PERIODS = ['Morning', 'Afternoon', 'Evening'];

function SortableRow({ row, days }) {
  const { saveField, removeRow, showUndo, undo } = useAdminRow(TARGET_TAB, row.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm p-2.5 flex items-start gap-2">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-300 pt-1.5 touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex gap-1.5 flex-wrap">
          <select
            value={row.date}
            onChange={(e) => saveField('date', e.target.value)}
            className="text-[11px] rounded border border-gray-200 px-1 py-1"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={row.period}
            onChange={(e) => saveField('period', e.target.value)}
            className="text-[11px] rounded border border-gray-200 px-1 py-1"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={row.group ?? ''}
            onChange={(e) => saveField('group', e.target.value)}
            className="text-[11px] rounded border border-gray-200 px-1 py-1"
          >
            <option value="">—</option>
            <option value="GROUP 1">GROUP 1</option>
            <option value="GROUP 2">GROUP 2</option>
          </select>
        </div>
        <EditableField
          value={row.content}
          onSave={(v) => saveField('content', v)}
          className="text-xs text-[#0B2A4A]"
        />
      </div>
      {showUndo ? <UndoButton onUndo={undo} /> : <DeleteRowButton onDelete={removeRow} />}
    </div>
  );
}

// Admin-only flat, freely-draggable list view of General Agenda — a
// completely different layout from the matrix regular users see. Any
// reorder here is what the matrix reflects once transformed back.
export default function GeneralAgendaAdmin() {
  const { t } = useLanguage();
  const { generalAgenda, generalAgendaRows, refresh } = useTripData();
  const addRow = useAdminAddRow(TARGET_TAB);
  const [localRows, setLocalRows] = useState(generalAgendaRows);

  useEffect(() => {
    setLocalRows(generalAgendaRows);
  }, [generalAgendaRows]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localRows.findIndex((r) => r.id === active.id);
    const newIndex = localRows.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(localRows, oldIndex, newIndex);
    setLocalRows(reordered);
    const result = await reorderRows(TARGET_TAB, reordered.map((r) => r.id));
    if (result?.success) await refresh();
  };

  const handleAdd = (insertAt) =>
    addRow({ date: generalAgenda.days[0] ?? '', period: 'Morning', group: '', content: '' }, insertAt);

  return (
    <div className="flex flex-col gap-2">
      <AddRowButton onAdd={() => handleAdd('start')} label={t({ en: 'Add at top', vi: 'Thêm ở đầu' })} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localRows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {localRows.map((row) => (
              <SortableRow key={row.id} row={row} days={generalAgenda.days} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <AddRowButton onAdd={() => handleAdd('end')} label={t({ en: 'Add at bottom', vi: 'Thêm ở cuối' })} />
    </div>
  );
}
