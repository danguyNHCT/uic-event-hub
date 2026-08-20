import { useLanguage } from '../LanguageContext';
import Header from './Header';

// No contact/tour-guide details exist in the source data yet — show a clear
// placeholder instead of inventing names/phone numbers.
export default function Contact() {
  const { t } = useLanguage();

  return (
    <div>
      <Header title={t({ en: 'Contact', vi: 'Liên hệ' })} />
      <div className="flex flex-col items-center justify-center text-center px-8 py-10 gap-2.5">
        <span className="text-5xl">☎️</span>
        <p className="font-semibold text-[#0B2A4A]">
          {t({ en: 'Contact details coming soon', vi: 'Thông tin liên hệ sẽ được cập nhật sớm' })}
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          {t({
            en: "Tour guide and organizer contact info hasn't been provided yet — check back closer to the trip.",
            vi: 'Thông tin liên hệ hướng dẫn viên và ban tổ chức chưa có — vui lòng kiểm tra lại gần ngày đi.',
          })}
        </p>
      </div>
    </div>
  );
}
