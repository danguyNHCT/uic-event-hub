import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { verifyPin as verifyPinRequest } from './services/dataService';

const AdminContext = createContext(null);
const UNDO_VISIBLE_MS = 5000;

// Admin mode is PIN-gated (verified against the backend) and lives only in
// React state — no localStorage/sessionStorage, so an F5/reload always
// drops back to the normal read-only view.
export function AdminProvider({ children }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [lastEdit, setLastEditState] = useState(null); // { targetTab, rowId, editHistoryId } | null
  const undoTimerRef = useRef(null);

  const unlock = useCallback(async (pin) => {
    const ok = await verifyPinRequest(pin);
    if (ok) setIsAdminMode(true);
    return ok;
  }, []);

  // Setting a new lastEdit replaces (and thus hides the undo button for)
  // whichever row previously held it; it also auto-clears after 5s.
  const setLastEdit = useCallback((edit) => {
    clearTimeout(undoTimerRef.current);
    setLastEditState(edit);
    if (edit) {
      undoTimerRef.current = setTimeout(() => setLastEditState(null), UNDO_VISIBLE_MS);
    }
  }, []);

  useEffect(() => () => clearTimeout(undoTimerRef.current), []);

  return (
    <AdminContext.Provider value={{ isAdminMode, unlock, lastEdit, setLastEdit }}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}
