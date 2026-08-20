import { createContext, useContext, useState } from 'react';
import { ADMIN_PIN } from './content';

const AdminContext = createContext(null);

const SESSION_KEY = 'uic-trip-admin-unlocked';

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSession(unlocked) {
  try {
    if (unlocked) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore — session persistence is a nicety, not required
  }
}

// PIN-gated admin mode: not real authentication, just a UI gate so a
// non-technical organizer can flip on edit/delete controls at the event.
// Unlocked state persists for the browser tab session (sessionStorage) so
// navigating between screens doesn't require re-entering the PIN.
export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(readSession);

  const unlock = (pin) => {
    if (pin === ADMIN_PIN) {
      setIsAdmin(true);
      writeSession(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsAdmin(false);
    writeSession(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, unlock, lock }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}
