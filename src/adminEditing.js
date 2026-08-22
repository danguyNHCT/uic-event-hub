import { useCallback } from 'react';
import { useAdmin } from './AdminContext';
import { useTripData } from './DataContext';
import { updateRow, deleteRow, createRow, rollbackEdit } from './services/dataService';

// Centralizes the update/delete/undo round-trip every admin-editable row
// needs: call the backend action, refetch (the "simple, no local state
// surgery" approach the spec asks for), and track the undo affordance.
export function useAdminRow(targetTab, rowId) {
  const { lastEdit, setLastEdit } = useAdmin();
  const { refresh } = useTripData();

  const saveField = useCallback(
    async (field, value) => {
      // `field` may be a plain field name (paired with `value`) or an object
      // of multiple fields to save together in one request — needed when two
      // fields (e.g. dayName + dateShort) must change atomically from a
      // single control.
      const rowData = typeof field === 'object' && field !== null ? field : { [field]: value };
      const result = await updateRow(targetTab, rowId, rowData);
      if (result?.success) {
        setLastEdit({ targetTab, rowId, editHistoryId: result.editHistoryId });
        await refresh();
      }
      return result?.success === true;
    },
    [targetTab, rowId, setLastEdit, refresh]
  );

  const removeRow = useCallback(async () => {
    const result = await deleteRow(targetTab, rowId);
    if (result?.success) {
      setLastEdit({ targetTab, rowId, editHistoryId: result.editHistoryId });
      await refresh();
    }
    return result?.success === true;
  }, [targetTab, rowId, setLastEdit, refresh]);

  const showUndo = lastEdit?.targetTab === targetTab && lastEdit?.rowId === rowId;

  const undo = useCallback(async () => {
    if (!lastEdit) return;
    const result = await rollbackEdit(lastEdit.editHistoryId);
    if (result?.success) {
      setLastEdit(null);
      await refresh();
    }
  }, [lastEdit, setLastEdit, refresh]);

  return { saveField, removeRow, showUndo, undo };
}

// For "+" add-row buttons: create a blank row on the backend, then refetch
// so the new row appears and can be inline-edited immediately.
export function useAdminAddRow(targetTab) {
  const { refresh } = useTripData();

  return useCallback(
    async (rowData, insertAt = 'end') => {
      const result = await createRow(targetTab, rowData, insertAt);
      if (result?.success) await refresh();
      return result?.success === true;
    },
    [targetTab, refresh]
  );
}
