import { useLanguage } from '../../LanguageContext';

export function DeleteRowButton({ onDelete, className = '' }) {
  const { t } = useLanguage();

  const handleClick = () => {
    if (window.confirm(t({ en: 'Delete this row?', vi: 'Xóa dòng này?' }))) {
      onDelete();
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={t({ en: 'Delete', vi: 'Xóa' })}
      className={`text-red-400 hover:text-red-500 shrink-0 ${className}`}
    >
      🗑️
    </button>
  );
}

export function UndoButton({ onUndo, className = '' }) {
  const { t } = useLanguage();
  return (
    <button onClick={onUndo} className={`text-[11px] font-semibold text-[#3B82C4] shrink-0 ${className}`}>
      ↩ {t({ en: 'Undo', vi: 'Hoàn tác' })}
    </button>
  );
}

export function AddRowButton({ onAdd, label, className = '' }) {
  return (
    <button onClick={onAdd} className={`text-xs font-semibold text-[#3B82C4] ${className}`}>
      + {label}
    </button>
  );
}
