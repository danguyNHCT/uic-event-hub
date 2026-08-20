import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import ScreenHeader from './ScreenHeader';
import AdminGate from './AdminGate';
import { useAdmin } from '../AdminContext';
import { usePersistentState } from '../store';
import { SEED_ATTENDEES } from '../seedData';

const TRIP_TABS = [
  { id: 'trip1', label: { en: 'Trip 1', vi: 'Đợt 1' } },
  { id: 'trip2', label: { en: 'Trip 2', vi: 'Đợt 2' } },
];

const SECTION_TABS = [
  { id: 'bookedByUIC', label: { en: 'Booked by UIC', vi: 'UIC đặt vé' } },
  { id: 'selfBooking', label: { en: 'Self-booking', vi: 'Tự đặt vé' } },
];

const EMPTY_DRAFT = { empCode: '', name: '', office: '', dept: '', isFamily: false };

function Field({ value, isFamily, t }) {
  if (isFamily) {
    return (
      <span className="text-[11px] font-semibold text-[#C9A227]">
        {t({ en: 'Family', vi: 'Gia đình' })}
      </span>
    );
  }
  return <span>{value ?? '–'}</span>;
}

export default function Attendees({ onBack }) {
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const [attendees, setAttendees] = usePersistentState('uic-trip-attendees', SEED_ATTENDEES);
  const [trip, setTrip] = useState('trip1');
  const [section, setSection] = useState('bookedByUIC');
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const people = attendees[trip]?.[section] ?? [];

  const updateList = (nextList) => {
    setAttendees({
      ...attendees,
      [trip]: { ...attendees[trip], [section]: nextList },
    });
  };

  const handleFieldChange = (no, field, value) => {
    updateList(people.map((p) => (p.no === no ? { ...p, [field]: value } : p)));
  };

  const handleRemove = (no) => {
    updateList(people.filter((p) => p.no !== no));
  };

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    const nextNo = people.length ? Math.max(...people.map((p) => p.no)) + 1 : 1;
    updateList([
      ...people,
      {
        no: nextNo,
        empCode: draft.empCode.trim() || null,
        name: draft.name.trim(),
        office: draft.office.trim() || null,
        dept: draft.dept.trim() || null,
        isFamily: draft.isFamily,
      },
    ]);
    setDraft(EMPTY_DRAFT);
    setShowAdd(false);
  };

  return (
    <div>
      <ScreenHeader title={t({ en: 'Attendees', vi: 'Người tham dự' })} onBack={onBack} />
      <AdminGate />

      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-full p-1 gap-1">
          {TRIP_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTrip(tab.id)}
              className={`flex-1 text-xs font-semibold rounded-full py-2 transition-colors ${
                trip === tab.id ? 'bg-[#0B2A4A] text-white' : 'text-gray-500'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex gap-4 border-b border-gray-200">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`text-xs font-semibold pb-2 pt-1 border-b-2 transition-colors ${
                section === tab.id ? 'border-[#0B2A4A] text-[#0B2A4A]' : 'border-transparent text-gray-400'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-xs min-w-[520px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase">
                <th className="text-left p-2.5 font-semibold">STT</th>
                <th className="text-left p-2.5 font-semibold">{t({ en: 'Emp. code', vi: 'Mã NV' })}</th>
                <th className="text-left p-2.5 font-semibold">{t({ en: 'Name', vi: 'Họ tên' })}</th>
                <th className="text-left p-2.5 font-semibold">{t({ en: 'Office', vi: 'Văn phòng' })}</th>
                <th className="text-left p-2.5 font-semibold">{t({ en: 'Dept', vi: 'Bộ phận' })}</th>
                {isAdmin && <th className="p-2.5" />}
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.no} className="border-t border-gray-100">
                  <td className="p-2.5 text-gray-400">{p.no}</td>
                  {isAdmin ? (
                    <>
                      <td className="p-2.5">
                        <input
                          value={p.empCode ?? ''}
                          onChange={(e) => handleFieldChange(p.no, 'empCode', e.target.value || null)}
                          className="w-16 rounded-lg border border-gray-200 px-1.5 py-1 text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          value={p.name}
                          onChange={(e) => handleFieldChange(p.no, 'name', e.target.value)}
                          className="w-28 rounded-lg border border-gray-200 px-1.5 py-1 text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          value={p.office ?? ''}
                          onChange={(e) => handleFieldChange(p.no, 'office', e.target.value || null)}
                          className="w-14 rounded-lg border border-gray-200 px-1.5 py-1 text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          value={p.dept ?? ''}
                          onChange={(e) => handleFieldChange(p.no, 'dept', e.target.value || null)}
                          className="w-20 rounded-lg border border-gray-200 px-1.5 py-1 text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => handleRemove(p.no)}
                          className="text-red-400 text-[11px] font-semibold whitespace-nowrap"
                        >
                          {t({ en: 'Remove', vi: 'Xóa' })}
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2.5 text-[#0B2A4A] font-medium">
                        <Field value={p.empCode} isFamily={p.isFamily} t={t} />
                      </td>
                      <td className="p-2.5 text-[#0B2A4A] font-semibold">{p.name}</td>
                      <td className="p-2.5 text-gray-600">
                        <Field value={p.office} isFamily={p.isFamily} t={t} />
                      </td>
                      <td className="p-2.5 text-gray-600">
                        <Field value={p.dept} isFamily={p.isFamily} t={t} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {people.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    {t({ en: 'No one here yet', vi: 'Chưa có ai' })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <div className="mt-3">
            {showAdd ? (
              <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder={t({ en: 'Name', vi: 'Họ tên' })}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                />
                <input
                  value={draft.empCode}
                  onChange={(e) => setDraft({ ...draft, empCode: e.target.value })}
                  placeholder={t({ en: 'Emp. code', vi: 'Mã NV' })}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                />
                <input
                  value={draft.office}
                  onChange={(e) => setDraft({ ...draft, office: e.target.value })}
                  placeholder={t({ en: 'Office', vi: 'Văn phòng' })}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                />
                <input
                  value={draft.dept}
                  onChange={(e) => setDraft({ ...draft, dept: e.target.value })}
                  placeholder={t({ en: 'Dept', vi: 'Bộ phận' })}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                />
                <label className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={draft.isFamily}
                    onChange={(e) => setDraft({ ...draft, isFamily: e.target.checked })}
                  />
                  {t({ en: 'Family (no emp. code)', vi: 'Gia đình (không có mã NV)' })}
                </label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      setShowAdd(false);
                      setDraft(EMPTY_DRAFT);
                    }}
                    className="flex-1 rounded-lg py-2 text-xs font-semibold text-gray-500 bg-gray-100"
                  >
                    {t({ en: 'Cancel', vi: 'Hủy' })}
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 rounded-lg py-2 text-xs font-semibold text-white bg-[#0B2A4A]"
                  >
                    {t({ en: 'Add', vi: 'Thêm' })}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAdd(true)} className="text-xs font-semibold text-[#3B82C4]">
                + {t({ en: 'Add attendee', vi: 'Thêm người tham dự' })}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
