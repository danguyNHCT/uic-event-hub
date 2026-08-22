import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useTripData } from '../DataContext';
import { useAdminAddRow, useAdminRow } from '../adminEditing';
import { FIXED_TRIP_DATES } from '../content';
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

// Combines a FIXED_TRIP_DATES `isoDate` with a <input type="time"> value
// into the same "YYYY-MM-DDTHH:mm" shape hanoiLocalToIso already expects.
// A blank time means "not set" (kept blank), matching the previous
// datetime-local behavior where leaving the field empty meant unset/indefinite.
function combineDateTime(isoDate, timeOfDay) {
  if (!timeOfDay) return '';
  return `${isoDate}T${timeOfDay}`;
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
  const [startDate, setStartDate] = useState(FIXED_TRIP_DATES[0].isoDate);
  const [startTimeOfDay, setStartTimeOfDay] = useState('');
  const [endDate, setEndDate] = useState(FIXED_TRIP_DATES[0].isoDate);
  const [endTimeOfDay, setEndTimeOfDay] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    const startTime = startNow
      ? new Date().toISOString()
      : hanoiLocalToIso(combineDateTime(startDate, startTimeOfDay));
    const endTime = hanoiLocalToIso(combineDateTime(endDate, endTimeOfDay));
    const ok = await addRow({ content: content.trim(), startTime, endTime }, 'end');
    setSubmitting(false);
    if (ok) {
      setContent('');
      setStartTimeOfDay('');
      setEndTimeOfDay('');
      setStartDate(FIXED_TRIP_DATES[0].isoDate);
      setEndDate(FIXED_TRIP_DATES[0].isoDate);
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
            <div className="flex gap-1.5">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500">{t({ en: 'Start date', vi: 'Ngày bắt đầu' })}</label>
                <select
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs mt-0.5"
                >
                  {FIXED_TRIP_DATES.map((d) => (
                    <option key={d.isoDate} value={d.isoDate}>
                      {d.dayName} {d.dateShort}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500">{t({ en: 'Start time', vi: 'Giờ bắt đầu' })}</label>
                <input
                  type="time"
                  value={startTimeOfDay}
                  onChange={(e) => setStartTimeOfDay(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs mt-0.5"
                />
              </div>
            </div>
          )}
          <div className="flex gap-1.5">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500">{t({ en: 'End date', vi: 'Ngày kết thúc' })}</label>
              <select
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs mt-0.5"
              >
                {FIXED_TRIP_DATES.map((d) => (
                  <option key={d.isoDate} value={d.isoDate}>
                    {d.dayName} {d.dateShort}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-500">
                {t({ en: 'End time (blank = indefinite)', vi: 'Giờ kết thúc (để trống = vô thời hạn)' })}
              </label>
              <input
                type="time"
                value={endTimeOfDay}
                onChange={(e) => setEndTimeOfDay(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs mt-0.5"
              />
            </div>
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
