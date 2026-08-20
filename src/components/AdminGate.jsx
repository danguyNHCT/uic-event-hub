import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAdmin } from '../AdminContext';

// Drop this into any screen that has admin-editable content (Attendees,
// Room Share, Photo Walls, Chat). Shows a small "Admin" unlock control, or
// an "Admin mode on" banner with an exit button once unlocked.
export default function AdminGate() {
  const { t } = useLanguage();
  const { isAdmin, unlock, lock } = useAdmin();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const closeModal = () => {
    setOpen(false);
    setPin('');
    setError(false);
  };

  const handleUnlock = () => {
    if (unlock(pin)) {
      closeModal();
    } else {
      setError(true);
    }
  };

  if (isAdmin) {
    return (
      <div className="mx-4 mt-4 flex items-center justify-between rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/40 px-3 py-2">
        <span className="text-xs font-semibold text-[#0B2A4A]">
          🔓 {t({ en: 'Admin mode on', vi: 'Chế độ Admin đang bật' })}
        </span>
        <button onClick={lock} className="text-xs font-semibold text-[#3B82C4]">
          {t({ en: 'Exit', vi: 'Thoát' })}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-4">
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-gray-400 flex items-center gap-1"
      >
        🔒 {t({ en: 'Admin', vi: 'Quản trị' })}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-lg">
            <h3 className="font-semibold text-[#0B2A4A] mb-3">
              {t({ en: 'Enter admin PIN', vi: 'Nhập mã PIN quản trị' })}
            </h3>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3B82C4]"
              placeholder="••••"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mt-2">
                {t({ en: 'Incorrect PIN', vi: 'Mã PIN không đúng' })}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-gray-500 bg-gray-100"
              >
                {t({ en: 'Cancel', vi: 'Hủy' })}
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-[#0B2A4A]"
              >
                {t({ en: 'Unlock', vi: 'Mở khóa' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
