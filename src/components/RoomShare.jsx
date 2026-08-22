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

function targetTabFor(trip) {
  return trip === 'trip1' ? 'RoomShare_Trip1' : 'RoomShare_Trip2';
}

function MemberDetail({ member, t }) {
  if (member.isFamily) {
    return <span className="text-[#C9A227] font-semibold">{t({ en: 'Family', vi: 'Gia đình' })}</span>;
  }
  return <span>{[member.office, member.dept].filter(Boolean).join(' · ') || '–'}</span>;
}

function MemberRow({ member, targetTab }) {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const { saveField, removeRow, showUndo, undo } = useAdminRow(targetTab, member.id);

  if (!isAdminMode) {
    return (
      <div className="flex items-center justify-between text-xs bg-[#F3F1EA] rounded-lg px-2.5 py-1.5">
        <div className="min-w-0">
          <div className="font-semibold text-[#0B2A4A] truncate">{member.name}</div>
          <div className="text-gray-500 mt-0.5 truncate">
            <MemberDetail member={member} t={t} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 text-xs bg-[#F3F1EA] rounded-lg px-2.5 py-1.5">
      <div className="min-w-0 flex-1 grid grid-cols-2 gap-1">
        <EditableField
          value={member.name}
          onSave={(v) => saveField('name', v)}
          className="font-semibold text-[#0B2A4A] col-span-2"
          placeholder={t({ en: 'Name', vi: 'Họ tên' })}
        />
        <EditableField
          value={member.empCode}
          onSave={(v) => saveField('empCode', v)}
          className="text-gray-500"
          placeholder={t({ en: 'Emp. code', vi: 'Mã NV' })}
        />
        <EditableField
          value={member.office}
          onSave={(v) => saveField('office', v)}
          className="text-gray-500"
          placeholder={t({ en: 'Office', vi: 'Văn phòng' })}
        />
        <EditableField
          value={member.dept}
          onSave={(v) => saveField('dept', v)}
          className="text-gray-500"
          placeholder={t({ en: 'Dept', vi: 'Bộ phận' })}
        />
        <label className="flex items-center gap-1 text-gray-500">
          <input
            type="checkbox"
            checked={member.isFamily}
            onChange={(e) => saveField('isFamily', e.target.checked)}
          />
          {t({ en: 'Family', vi: 'Gia đình' })}
        </label>
      </div>
      <div className="pt-0.5">{showUndo ? <UndoButton onUndo={undo} /> : <DeleteRowButton onDelete={removeRow} />}</div>
    </div>
  );
}

function RoomCard({ room, targetTab, onAddMember }) {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();

  return (
    <div className="bg-[#FCFAF5] rounded-2xl border border-[#E3D9B4] p-3">
      <h3 className="font-bold text-[#0B2A4A] text-xs mb-1.5">
        {t({ en: 'Room', vi: 'Phòng' })} {room.roomNo}
      </h3>
      <div className="flex flex-col gap-1.5">
        {isAdminMode && (
          <AddRowButton
            onAdd={() => onAddMember(room.roomNo, 'start')}
            label={t({ en: 'Add member', vi: 'Thêm thành viên' })}
          />
        )}
        {room.members.map((m) => (
          <MemberRow key={m.id} member={m} targetTab={targetTab} />
        ))}
        {room.members.length === 0 && !isAdminMode && (
          <p className="text-xs text-gray-400 italic">{t({ en: 'Empty room', vi: 'Phòng trống' })}</p>
        )}
      </div>
    </div>
  );
}

export default function RoomShare({ onBack }) {
  const { t } = useLanguage();
  const { roomShare } = useTripData();
  const { isAdminMode } = useAdmin();
  const [trip, setTrip] = useState('trip1');
  const filter = usePeopleFilter();

  const targetTab = targetTabFor(trip);
  const addRow = useAdminAddRow(targetTab);

  const rooms = roomShare[trip] ?? [];
  const allMembers = rooms.flatMap((room) => room.members);
  const isFiltering = filter.query.trim() !== '' || filter.office !== '' || filter.dept !== '';
  const visibleRooms = isFiltering
    ? rooms
        .map((room) => ({ ...room, members: room.members.filter((m) => personMatches(m, filter)) }))
        .filter((room) => room.members.length > 0)
    : rooms;

  const handleAddMember = (roomNo, insertAt) =>
    addRow({ roomNo, empCode: '', name: '', office: '', dept: '', isFamily: false }, insertAt);

  const handleAddRoom = (insertAt) => {
    const nextRoomNo = rooms.length ? Math.max(...rooms.map((r) => r.roomNo)) + 1 : 1;
    return addRow({ roomNo: nextRoomNo, empCode: '', name: '', office: '', dept: '', isFamily: false }, insertAt);
  };

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
        {isAdminMode && (
          <AddRowButton
            onAdd={() => handleAddRoom('start')}
            label={t({ en: 'Add room', vi: 'Thêm phòng' })}
          />
        )}
        {visibleRooms.map((room) => (
          <RoomCard key={room.roomNo} room={room} targetTab={targetTab} onAddMember={handleAddMember} />
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
        {isAdminMode && (
          <AddRowButton
            onAdd={() => handleAddRoom('end')}
            label={t({ en: 'Add room', vi: 'Thêm phòng' })}
          />
        )}
      </div>
    </div>
  );
}
