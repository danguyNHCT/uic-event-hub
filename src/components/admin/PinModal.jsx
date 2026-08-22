import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../LanguageContext';
import { useAdmin } from '../../AdminContext';

const PIN_LENGTH = 4;

export default function PinModal({ onClose }) {
  const { t } = useLanguage();
  const { unlock } = useAdmin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const scrollYRef = useRef(window.scrollY);

  // Restores the page's scroll position to where it was before this modal
  // opened, and blurs whatever input still has focus first — otherwise the
  // mobile keyboard closing (or the input's own focus) makes the browser
  // auto-scroll/crop the home screen right after Edit Mode is entered.
  const closeAndRestoreScroll = () => {
    document.activeElement?.blur();
    onClose();
    requestAnimationFrame(() => window.scrollTo(0, scrollYRef.current));
  };

  const handleSubmit = async () => {
    if (!pin || checking) return;
    setChecking(true);
    const ok = await unlock(pin);
    setChecking(false);
    if (ok) {
      closeAndRestoreScroll();
    } else {
      setError(true);
    }
  };

  // Auto-submit once the PIN reaches its expected length, so admins don't
  // need an extra tap on "Unlock" after typing the last digit.
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
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
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full rounded-xl border border-gray-200 p-3 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3B82C4]"
          placeholder="••••"
          autoFocus
        />
        {error && (
          <p className="text-xs text-red-500 mt-2">{t({ en: 'Incorrect PIN', vi: 'Mã PIN không đúng' })}</p>
        )}
        <div className="flex gap-2 mt-4">
          <button
            onClick={closeAndRestoreScroll}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-gray-500 bg-gray-100"
          >
            {t({ en: 'Cancel', vi: 'Hủy' })}
          </button>
          <button
            onClick={handleSubmit}
            disabled={checking}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-[#0B2A4A] disabled:opacity-50"
          >
            {checking ? '…' : t({ en: 'Unlock', vi: 'Mở khóa' })}
          </button>
        </div>
      </div>
    </div>
  );
}
