import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import ScreenHeader from './ScreenHeader';
import { SEED_ATTENDEES } from '../seedData';

const TRIP_TABS = [
  { id: 'trip1', label: { en: 'Trip 1', vi: 'Đợt 1' } },
  { id: 'trip2', label: { en: 'Trip 2', vi: 'Đợt 2' } },
];

const SECTION_TABS = [
  { id: 'bookedByUIC', label: { en: 'Booked by UIC', vi: 'UIC đặt vé' } },
  { id: 'selfBooking', label: { en: 'Self-booking', vi: 'Tự đặt vé' } },
];

function AttendeeRow({ person, t }) {
  const detail = person.isFamily
    ? t({ en: 'Family', vi: 'Gia đình' })
    : [person.office, person.dept].filter(Boolean).join(' · ') || '–';

  return (
    <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 shadow-sm">
      <span className="text-[11px] text-gray-400 w-5 shrink-0 text-right">{person.no}</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-[#0B2A4A] truncate">{person.name}</div>
        <div className="text-[11px] text-gray-500 truncate">{detail}</div>
      </div>
      {person.empCode && (
        <span className="text-[11px] text-gray-400 shrink-0">{person.empCode}</span>
      )}
    </div>
  );
}

export default function Attendees({ onBack }) {
  const { t } = useLanguage();
  const [trip, setTrip] = useState('trip1');
  const [section, setSection] = useState('bookedByUIC');

  const people = SEED_ATTENDEES[trip]?.[section] ?? [];

  return (
    <div>
      <ScreenHeader title={t({ en: 'Attendees', vi: 'Người tham dự' })} onBack={onBack} />

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
        {people.map((p) => (
          <AttendeeRow key={p.no} person={p} t={t} />
        ))}
        {people.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            {t({ en: 'No one here yet', vi: 'Chưa có ai' })}
          </p>
        )}
      </div>
    </div>
  );
}
