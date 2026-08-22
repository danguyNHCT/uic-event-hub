import { useLanguage } from '../LanguageContext';
import { useTripData } from '../DataContext';
import ScreenHeader from './ScreenHeader';

// Same schedule applies to both trips — pull it from the agenda data rather
// than hardcoding it twice.
function findEntry(detailedAgenda) {
  const allRows = [...detailedAgenda.trip1.rows, ...detailedAgenda.trip2.rows];
  return allRows.find((row) => row.activity && row.activity.includes('Pickleball'));
}

export default function SportProgram({ onBack }) {
  const { t } = useLanguage();
  const { detailedAgenda } = useTripData();
  const entry = findEntry(detailedAgenda);

  return (
    <div>
      <ScreenHeader title={t({ en: 'Sport Program', vi: 'Chương trình thể thao' })} onBack={onBack} />
      <div className="px-4 pt-4 pb-4">
        <p className="text-xs text-gray-500 mb-3">
          {t({ en: 'Same schedule for both Trip 1 and Trip 2', vi: 'Lịch giống nhau cho cả Đợt 1 và Đợt 2' })}
        </p>
        {entry ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-xs font-semibold text-[#3B82C4] mb-1">
              🏓 {t({ en: 'Saturday 5 Sep', vi: 'Thứ Bảy 05/09' })}
            </div>
            <div className="text-sm font-semibold text-[#0B2A4A]">{entry.time}</div>
            <div className="font-bold text-[#0B2A4A] mt-1">{entry.activity}</div>
            {entry.note && <div className="text-xs text-gray-500 mt-1.5">📍 {entry.note}</div>}
          </div>
        ) : (
          <p className="text-sm text-gray-400">{t({ en: 'Not yet updated / TBU', vi: 'Chưa cập nhật' })}</p>
        )}
      </div>
    </div>
  );
}
