import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import ScreenHeader from './ScreenHeader';
import AdminGate from './AdminGate';
import { useAdmin } from '../AdminContext';
import { usePersistentState } from '../store';
import { SEED_ROOM_SHARE } from '../seedData';

const TRIP_TABS = [
  { id: 'trip1', label: { en: 'Trip 1', vi: 'Đợt 1' } },
  { id: 'trip2', label: { en: 'Trip 2', vi: 'Đợt 2' } },
];

const EMPTY_DRAFT = { empCode: '', name: '', office: '', dept: '', isFamily: false };

function MemberField({ value, isFamily, t }) {
  if (isFamily) {
    return <span className="text-[#C9A227] font-semibold">{t({ en: 'Family', vi: 'Gia đình' })}</span>;
  }
  return <span>{value ?? '–'}</span>;
}

export default function RoomShare({ onBack }) {
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const [roomShare, setRoomShare] = usePersistentState('uic-trip-roomshare', SEED_ROOM_SHARE);
  const [trip, setTrip] = useState('trip1');
  const [addMemberFor, setAddMemberFor] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const rooms = roomShare[trip] ?? [];

  const updateRooms = (nextRooms) => {
    setRoomShare({ ...roomShare, [trip]: nextRooms });
  };

  const handleAddRoom = () => {
    const nextNo = rooms.length ? Math.max(...rooms.map((r) => r.roomNo)) + 1 : 1;
    updateRooms([...rooms, { roomNo: nextNo, members: [] }]);
  };

  const handleRemoveRoom = (roomNo) => {
    updateRooms(rooms.filter((r) => r.roomNo !== roomNo));
  };

  const handleRemoveMember = (roomNo, idx) => {
    updateRooms(
      rooms.map((r) =>
        r.roomNo === roomNo ? { ...r, members: r.members.filter((_, i) => i !== idx) } : r
      )
    );
  };

  const handleAddMember = (roomNo) => {
    if (!draft.name.trim()) return;
    updateRooms(
      rooms.map((r) =>
        r.roomNo === roomNo
          ? {
              ...r,
              members: [
                ...r.members,
                {
                  empCode: draft.empCode.trim() || null,
                  name: draft.name.trim(),
                  office: draft.office.trim() || null,
                  dept: draft.dept.trim() || null,
                  isFamily: draft.isFamily,
                },
              ],
            }
          : r
      )
    );
    setDraft(EMPTY_DRAFT);
    setAddMemberFor(null);
  };

  return (
    <div>
      <ScreenHeader title={t({ en: 'Room Share', vi: 'Ghép phòng' })} onBack={onBack} />
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

      {isAdmin && (
        <div className="px-4 pt-3">
          <button onClick={handleAddRoom} className="text-xs font-semibold text-[#3B82C4]">
            + {t({ en: 'Add room', vi: 'Thêm phòng' })}
          </button>
        </div>
      )}

      <div className="px-4 pt-3 pb-6 flex flex-col gap-3">
        {rooms.map((room) => (
          <div key={room.roomNo} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#0B2A4A] text-sm">
                {t({ en: 'Room', vi: 'Phòng' })} {room.roomNo}
              </h3>
              {isAdmin && (
                <button
                  onClick={() => handleRemoveRoom(room.roomNo)}
                  className="text-[11px] font-semibold text-red-400"
                >
                  {t({ en: 'Delete room', vi: 'Xóa phòng' })}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {room.members.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2"
                >
                  <div>
                    <div className="font-semibold text-[#0B2A4A]">{m.name}</div>
                    <div className="text-gray-500 mt-0.5">
                      <MemberField value={m.office} isFamily={m.isFamily} t={t} />
                      {' · '}
                      <MemberField value={m.dept} isFamily={m.isFamily} t={t} />
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(room.roomNo, idx)}
                      className="text-red-400 font-semibold"
                    >
                      {t({ en: 'Remove', vi: 'Xóa' })}
                    </button>
                  )}
                </div>
              ))}
              {room.members.length === 0 && (
                <p className="text-xs text-gray-400 italic">{t({ en: 'Empty room', vi: 'Phòng trống' })}</p>
              )}
            </div>

            {isAdmin &&
              (addMemberFor === room.roomNo ? (
                <div className="mt-3 flex flex-col gap-1.5 bg-gray-50 rounded-xl p-3">
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder={t({ en: 'Name', vi: 'Họ tên' })}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                  />
                  <input
                    value={draft.empCode}
                    onChange={(e) => setDraft({ ...draft, empCode: e.target.value })}
                    placeholder={t({ en: 'Emp. code', vi: 'Mã NV' })}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                  />
                  <input
                    value={draft.office}
                    onChange={(e) => setDraft({ ...draft, office: e.target.value })}
                    placeholder={t({ en: 'Office', vi: 'Văn phòng' })}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                  />
                  <input
                    value={draft.dept}
                    onChange={(e) => setDraft({ ...draft, dept: e.target.value })}
                    placeholder={t({ en: 'Dept', vi: 'Bộ phận' })}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
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
                        setAddMemberFor(null);
                        setDraft(EMPTY_DRAFT);
                      }}
                      className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-gray-500 bg-gray-100"
                    >
                      {t({ en: 'Cancel', vi: 'Hủy' })}
                    </button>
                    <button
                      onClick={() => handleAddMember(room.roomNo)}
                      className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white bg-[#0B2A4A]"
                    >
                      {t({ en: 'Add', vi: 'Thêm' })}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddMemberFor(room.roomNo)}
                  className="mt-3 text-xs font-semibold text-[#3B82C4]"
                >
                  + {t({ en: 'Add member', vi: 'Thêm thành viên' })}
                </button>
              ))}
          </div>
        ))}
        {rooms.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            {t({ en: 'No rooms yet', vi: 'Chưa có phòng nào' })}
          </p>
        )}
      </div>
    </div>
  );
}
