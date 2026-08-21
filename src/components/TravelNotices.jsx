import { useLanguage } from '../LanguageContext';
import ScreenHeader from './ScreenHeader';
import { TRAVEL_NOTICES } from '../content';

export default function TravelNotices({ onBack }) {
  const { t } = useLanguage();

  return (
    <div>
      <ScreenHeader title={t({ en: 'Travel Notices', vi: 'Lưu ý di chuyển' })} onBack={onBack} />
      <div className="px-4 pt-4 pb-4 flex flex-col gap-2.5">
        {TRAVEL_NOTICES.map((notice, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm p-3.5 flex gap-3 items-start">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                idx % 2 === 0 ? 'bg-[#C9A227]/15' : 'bg-[#3B82C4]/15'
              }`}
            >
              {notice.icon}
            </span>
            <p className="text-sm text-gray-600 leading-relaxed pt-1.5">{t(notice)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
