import { useLanguage } from '../../LanguageContext';
import { useAdmin } from '../../AdminContext';
import { useTripData } from '../../DataContext';

// Only visible to admins — regular users never see this, per spec.
export default function OfflineBanner() {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const { isOfflineMode } = useTripData();

  if (!isAdminMode || !isOfflineMode) return null;

  return (
    <div className="bg-amber-100 text-amber-800 text-xs font-semibold text-center py-1.5 px-3">
      ⚠️ {t({ en: 'Offline mode - using cached data', vi: 'Đang dùng dữ liệu ngoại tuyến' })}
    </div>
  );
}
