import { useLanguage } from '../LanguageContext';
import { useTripData } from '../DataContext';
import { useAdmin } from '../AdminContext';
import { useAdminRow, useAdminAddRow } from '../adminEditing';
import ScreenHeader from './ScreenHeader';
import EditableField from './admin/EditableField';
import { AddRowButton, DeleteRowButton, UndoButton } from './admin/AdminControls';

const TARGET_TAB = 'TravelNotices';

function NoticeCard({ notice, idx }) {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const { saveField, removeRow, showUndo, undo } = useAdminRow(TARGET_TAB, notice.id);

  return (
    <div className="bg-[#FCFAF5] rounded-2xl border border-[#E3D9B4] p-3.5 flex gap-3 items-start">
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
          idx % 2 === 0 ? 'bg-[#C9A227]/15' : 'bg-[#3B82C4]/15'
        }`}
      >
        {isAdminMode ? (
          <EditableField
            value={notice.icon}
            onSave={(v) => saveField('icon', v)}
            className="text-base text-center w-9"
          />
        ) : (
          notice.icon
        )}
      </span>
      <div className="flex-1 min-w-0 pt-1.5">
        {isAdminMode ? (
          <div className="flex flex-col gap-1.5">
            <EditableField
              value={notice.en}
              onSave={(v) => saveField('textEn', v)}
              multiline
              placeholder="EN"
              className="text-sm text-gray-600 leading-relaxed"
            />
            <EditableField
              value={notice.vi}
              onSave={(v) => saveField('textVi', v)}
              multiline
              placeholder="VI"
              className="text-sm text-gray-600 leading-relaxed"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">{t(notice)}</p>
        )}
      </div>
      {isAdminMode && (showUndo ? <UndoButton onUndo={undo} /> : <DeleteRowButton onDelete={removeRow} />)}
    </div>
  );
}

export default function TravelNotices({ onBack }) {
  const { t } = useLanguage();
  const { travelNotices } = useTripData();
  const { isAdminMode } = useAdmin();
  const addRow = useAdminAddRow(TARGET_TAB);

  const handleAdd = (insertAt) => addRow({ icon: '📌', textEn: '', textVi: '' }, insertAt);

  return (
    <div>
      <ScreenHeader title={t({ en: 'Travel Notices', vi: 'Lưu ý di chuyển' })} onBack={onBack} />
      <div className="px-4 pt-4 pb-4 flex flex-col gap-2.5">
        {isAdminMode && (
          <AddRowButton onAdd={() => handleAdd('start')} label={t({ en: 'Add at top', vi: 'Thêm ở đầu' })} />
        )}
        {travelNotices.map((notice, idx) => (
          <NoticeCard key={notice.id ?? idx} notice={notice} idx={idx} />
        ))}
        {isAdminMode && (
          <AddRowButton onAdd={() => handleAdd('end')} label={t({ en: 'Add at bottom', vi: 'Thêm ở cuối' })} />
        )}
      </div>
    </div>
  );
}
