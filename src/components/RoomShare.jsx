import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import ScreenHeader from './ScreenHeader';
import PeopleFilterBar from './PeopleFilterBar';
import { usePeopleFilter, personMatches } from '../peopleFilter';
import { SEED_ROOM_SHARE } from '../seedData';

const TRIP_TABS = [
  { id: 'trip1', label: { en: 'Trip 1', vi: 'Đợt 1' } },
  { id: 'trip2', label: { en: 'Trip 2', vi: 'Đợt 2' } },
];

function MemberDetail({ member, t }) {
  if (member.isFamily) {
    return <span className="text-[#C9A227] font-semibold">{t({ en: 'Family', vi: 'Gia đình' })}</span>;
  }
  return <span>{[member.office, member.dept].filter(Boolean).join(' · ') || '–'}</span>;
}

export default function RoomShare({ onBack }) {
  const { t } = useLanguage();
  const [trip, setTrip] = useState('trip1');
  const filter = usePeopleFilter();

  const rooms = SEED_ROOM_SHARE[trip] ?? [];
  const allMembers = rooms.flatMap((room) => room.members);
  const isFiltering = filter.query.trim() !== '' || filter.office !== '' || filter.dept !== '';
  const visibleRooms = isFiltering
    ? rooms
        .map((room) => ({ ...room, members: room.members.filter((m) => personMatches(m, filter)) }))
        .filter((room) => room.members.length > 0)
    : rooms;

  return (
    <div>
      <ScreenHeader title={t({ en: 'Room Share', vi: 'Ghép phòng' })} onBack={onBack} />

      <PeopleFilterBar
        people={allMembers}
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

      <div className="px-4 pt-2.5 pb-4 flex flex-col gap-2">
        {visibleRooms.map((room) => (
          <div key={room.roomNo} className="bg-white rounded-2xl shadow-sm p-3">
            <h3 className="font-bold text-[#0B2A4A] text-xs mb-1.5">
              {t({ en: 'Room', vi: 'Phòng' })} {room.roomNo}
            </h3>

            <div className="flex flex-col gap-1.5">
              {room.members.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#0B2A4A] truncate">{m.name}</div>
                    <div className="text-gray-500 mt-0.5 truncate">
                      <MemberDetail member={m} t={t} />
                    </div>
                  </div>
                </div>
              ))}
              {room.members.length === 0 && (
                <p className="text-xs text-gray-400 italic">{t({ en: 'Empty room', vi: 'Phòng trống' })}</p>
              )}
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            {t({ en: 'No rooms yet', vi: 'Chưa có phòng nào' })}
          </p>
        )}
        {rooms.length > 0 && visibleRooms.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            {t({ en: 'No matches', vi: 'Không tìm thấy kết quả' })}
          </p>
        )}
      </div>
    </div>
  );
}
