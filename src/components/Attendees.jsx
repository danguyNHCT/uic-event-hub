import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useTripData } from '../DataContext';
import { useAdmin } from '../AdminContext';
import { useAdminRow, useAdminAddRow } from '../adminEditing';
import ScreenHeader from './ScreenHeader';
import PeopleFilterBar from './PeopleFilterBar';
import EditableField from './admin/EditableField';
import { AddRowButton, DeleteRowButton, UndoButton } from './admin/AdminControls';
import { usePeopleFilter, personMatches } from '../peopleFilter';

const TRIP_TABS = [
  { id: 'trip1', label: { en: 'Trip 1', vi: 'Đợt 1' } },
  { id: 'trip2', label: { en: 'Trip 2', vi: 'Đợt 2' } },
];

const SECTION_TABS = [
  { id: 'bookedByUIC', label: { en: 'Booked by company', vi: 'Công ty đặt vé' } },
  { id: 'selfBooking', label: { en: 'Self-booking', vi: 'Tự đặt vé' } },
];

function targetTabFor(trip) {
  return trip === 'trip1' ? 'Attendees_Trip1' : 'Attendees_Trip2';
}

function AttendeeRow({ person, targetTab }) {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const { saveField, removeRow, showUndo, undo } = useAdminRow(targetTab, person.id);

  if (!isAdminMode) {
    const detail = person.isFamily
      ? t({ en: 'Family', vi: 'Gia đình' })
      : [person.office, person.dept].filter(Boolean).join(' · ') || '–';
    return (
      <div className="flex items-center gap-2.5 bg-[#FCFAF5] rounded-xl px-3 py-2 border border-[#E3D9B4]">
        <span className="text-[11px] text-gray-400 w-5 shrink-0 text-right">{person.no}</span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-[#0B2A4A] truncate">{person.name}</div>
          <div className="text-[11px] text-gray-500 truncate">{detail}</div>
        </div>
        {person.empCode && <span className="text-[11px] text-gray-400 shrink-0">{person.empCode}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
      <span className="text-[11px] text-gray-400 w-5 shrink-0 text-right pt-1.5">{person.no}</span>
      <div className="min-w-0 flex-1 grid grid-cols-2 gap-1.5">
        <EditableField
          value={person.name}
          onSave={(v) => saveField('name', v)}
          className="text-xs font-semibold text-[#0B2A4A] col-span-2"
          placeholder={t({ en: 'Name', vi: 'Họ tên' })}
        />
        <EditableField
          value={person.empCode}
          onSave={(v) => saveField('empCode', v)}
          className="text-[11px] text-gray-500"
          placeholder={t({ en: 'Emp. code', vi: 'Mã NV' })}
        />
        <EditableField
          value={person.office}
          onSave={(v) => saveField('office', v)}
          className="text-[11px] text-gray-500"
          placeholder={t({ en: 'Office', vi: 'Văn phòng' })}
        />
        <EditableField
          value={person.dept}
          onSave={(v) => saveField('dept', v)}
          className="text-[11px] text-gray-500"
          placeholder={t({ en: 'Dept', vi: 'Bộ phận' })}
        />
        <label className="flex items-center gap-1 text-[11px] text-gray-500">
          <input
            type="checkbox"
            checked={person.isFamily}
            onChange={(e) => saveField('isFamily', e.target.checked)}
          />
          {t({ en: 'Family', vi: 'Gia đình' })}
        </label>
      </div>
      <div className="pt-1">{showUndo ? <UndoButton onUndo={undo} /> : <DeleteRowButton onDelete={removeRow} />}</div>
    </div>
  );
}

export default function Attendees({ onBack }) {
  const { t } = useLanguage();
  const { attendees } = useTripData();
  const { isAdminMode } = useAdmin();
  const [trip, setTrip] = useState('trip1');
  const [section, setSection] = useState('bookedByUIC');
  const filter = usePeopleFilter();

  const targetTab = targetTabFor(trip);
  const addRow = useAdminAddRow(targetTab);

  const people = attendees[trip]?.[section] ?? [];
  const visiblePeople = people.filter((p) => personMatches(p, filter));

  const handleAdd = (insertAt) =>
    addRow({ bookingType: section, empCode: '', name: '', office: '', dept: '', isFamily: false }, insertAt);

  return (
    <div>
      <ScreenHeader title={t({ en: 'Attendees', vi: 'Người tham dự' })} onBack={onBack} />

      <PeopleFilterBar
        people={people}
        query={filter.query}
        onQueryChange={filter.setQuery}
        office={filter.office}
        onOfficeChange={filter.setOffice}
        dept={filter.dept}
        onDeptChange={filter.setDept}
      />

      <div className="px-4 pt-3">
        <div className="flex bg-gray-100 rounded-full p-1 gap-1">
          {TRIP_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTrip(tab.id)}
              className={`flex-1 text-xs font-semibold rounded-full py-1.5 transition-colors ${
                trip === tab.id ? 'bg-[#0B2A4A] text-white' : 'text-gray-500'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2.5">
        <div className="flex gap-4 border-b border-gray-200">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`text-xs font-semibold pb-1.5 pt-1 border-b-2 transition-colors ${
                section === tab.id ? 'border-[#0B2A4A] text-[#0B2A4A]' : 'border-transparent text-gray-400'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2.5 pb-4 flex flex-col gap-1.5">
        {isAdminMode && (
          <AddRowButton onAdd={() => handleAdd('start')} label={t({ en: 'Add at top', vi: 'Thêm ở đầu' })} />
        )}
        {visiblePeople.map((p) => (
          <AttendeeRow key={p.id ?? p.no} person={p} targetTab={targetTab} />
        ))}
        {people.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            {t({ en: 'No one here yet', vi: 'Chưa có ai' })}
          </p>
        )}
        {people.length > 0 && visiblePeople.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            {t({ en: 'No matches', vi: 'Không tìm thấy kết quả' })}
          </p>
        )}
        {isAdminMode && (
          <AddRowButton onAdd={() => handleAdd('end')} label={t({ en: 'Add at bottom', vi: 'Thêm ở cuối' })} />
        )}
      </div>
    </div>
  );
}
