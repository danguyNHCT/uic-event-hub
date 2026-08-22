import { useState } from 'react';
import { useLanguage } from '../../LanguageContext';
import { useAdmin } from '../../AdminContext';

export default function PinModal({ onClose }) {
  const { t } = useLanguage();
  const { unlock } = useAdmin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    if (!pin || checking) return;
    setChecking(true);
    const ok = await unlock(pin);
    setChecking(false);
    if (ok) {
      onClose();
    } else {
      setError(true);
    }
  };

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
            onClick={onClose}
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
