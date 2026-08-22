import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../AdminContext';
import { useLanguage } from '../../LanguageContext';

// Renders `value` as plain text when not in admin mode (or not focused) —
// same font/size/color as the surrounding content. In admin mode it becomes
// a borderless input/textarea that only shows an editing affordance
// (dashed underline / focus ring) on hover/focus, and saves via onSave
// on blur, only when the value actually changed.
export default function EditableField({
  value,
  onSave,
  className = '',
  multiline = false,
  required = false,
  requiredMessage,
  placeholder,
}) {
  const { isAdminMode } = useAdmin();
  const { t } = useLanguage();
  const [draft, setDraft] = useState(value ?? '');
  const [warn, setWarn] = useState(false);
  const committedRef = useRef(value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
    committedRef.current = value ?? '';
  }, [value]);

  if (!isAdminMode) {
    return <span className={className}>{value || placeholder || ''}</span>;
  }

  const commit = () => {
    if (required && !draft.trim()) {
      setWarn(true);
      return;
    }
    setWarn(false);
    if (draft !== committedRef.current) {
      committedRef.current = draft;
      onSave(draft);
    }
  };

  const fieldClass = `${className} bg-transparent border-b border-dashed border-transparent hover:border-[#3B82C4]/40 focus:border-[#3B82C4] focus:outline-none w-full resize-none`;

  return (
    <span className="inline-block w-full align-top">
      {multiline ? (
        <textarea
          className={fieldClass}
          value={draft}
          rows={Math.max(1, draft.split('\n').length)}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
        />
      ) : (
        <input
          type="text"
          className={fieldClass}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
        />
      )}
      {warn && (
        <span className="block text-[10px] text-red-500 mt-0.5">
          {requiredMessage ?? t({ en: 'Start time is required', vi: 'Cần nhập giờ bắt đầu' })}
        </span>
      )}
    </span>
  );
}
