import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useTripData } from '../DataContext';
import { useAdminAddRow, useAdminRow } from '../adminEditing';
import { DeleteRowButton, UndoButton } from './admin/AdminControls';

const TARGET_TAB = 'Announcements';

// A <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm") is a bare
// wall-clock time with no timezone of its own — interpret it as Hanoi
// (UTC+7) time explicitly, per spec, not the admin's device timezone.
function hanoiLocalToIso(datetimeLocalValue) {
  if (!datetimeLocalValue) return '';
  const [datePart, timePart] = datetimeLocalValue.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [h, min] = timePart.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - 7, min)).toISOString();
}

function AnnouncementRow({ announcement }) {
  const { t } = useLanguage();
  const { removeRow, showUndo, undo } = useAdminRow(TARGET_TAB, announcement.id);

  return (
    <div className="flex items-start justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#0B2A4A] whitespace-pre-line">{announcement.content}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {announcement.startTime ? new Date(announcement.startTime).toLocaleString() : '—'}
          {' → '}
          {announcement.endTime
            ? new Date(announcement.endTime).toLocaleString()
            : t({ en: 'indefinite', vi: 'vô thời hạn' })}
        </p>
      </div>
      {showUndo ? <UndoButton onUndo={undo} /> : <DeleteRowButton onDelete={removeRow} />}
    </div>
  );
}

export default function AnnouncementsManager({ onClose }) {
  const { t } = useLanguage();
  const { announcements } = useTripData();
  const addRow = useAdminAddRow(TARGET_TAB);

  const [startNow, setStartNow] = useState(true);
  const [startLocal, setStartLocal] = useState('');
  const [endLocal, setEndLocal] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    const startTime = startNow ? new Date().toISOString() : hanoiLocalToIso(startLocal);
    const endTime = hanoiLocalToIso(endLocal);
    const ok = await addRow({ content: content.trim(), startTime, endTime }, 'end');
    setSubmitting(false);
    if (ok) {
      setContent('');
      setStartLocal('');
      setEndLocal('');
      setStartNow(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#0B2A4A]">
            {t({ en: 'Manage announcements', vi: 'Quản lý thông báo' })}
          </h3>
          <button onClick={onClose} className="text-gray-400 text-sm">
            {t({ en: 'Close', vi: 'Đóng' })}
          </button>
        </div>

        <div className="flex flex-col gap-2 bg-gray-50 rounded-xl p-3 mb-4">
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            <input type="checkbox" checked={startNow} onChange={(e) => setStartNow(e.target.checked)} />
            {t({ en: 'Start now', vi: 'Ngay bây giờ' })}
          </label>
          {!startNow && (
            <div>
              <label className="text-[10px] text-gray-500">{t({ en: 'Start time', vi: 'Giờ bắt đầu' })}</label>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs mt-0.5"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] text-gray-500">
              {t({ en: 'End time (blank = indefinite)', vi: 'Giờ kết thúc (để trống = vô thời hạn)' })}
            </label>
            <input
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs mt-0.5"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t({ en: 'Announcement content...', vi: 'Nội dung thông báo...' })}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs resize-none"
          />
          <button
            onClick={handleCreate}
            disabled={!content.trim() || submitting}
            className="rounded-lg py-2 text-xs font-semibold text-white bg-[#0B2A4A] disabled:opacity-50"
          >
            {t({ en: 'Create announcement', vi: 'Tạo thông báo' })}
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {announcements.map((a) => (
            <AnnouncementRow key={a.id} announcement={a} />
          ))}
          {announcements.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-4">
              {t({ en: 'No announcements yet', vi: 'Chưa có thông báo nào' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
