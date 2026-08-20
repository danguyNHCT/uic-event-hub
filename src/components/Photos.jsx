import { useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import Header from './Header';
import AdminGate from './AdminGate';
import { useAdmin } from '../AdminContext';
import { usePersistentState } from '../store';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB, matches the Firebase Storage limit this will move to

export default function Photos() {
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const [photos, setPhotos] = usePersistentState('uic-trip-photos', []);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');

    if (!name.trim()) {
      setError(t({ en: 'Enter your name first', vi: 'Nhập tên của bạn trước' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError(t({ en: 'Only image files are allowed', vi: 'Chỉ nhận file ảnh' }));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t({ en: 'Image must be under 5MB', vi: 'Ảnh phải nhỏ hơn 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextPhotos = [
        { id: Date.now(), name: name.trim(), dataUrl: reader.result, timestamp: Date.now() },
        ...photos,
      ];
      const ok = setPhotos(nextPhotos);
      if (!ok) {
        setError(
          t({
            en: "Couldn't save photo — local demo storage is full.",
            vi: 'Không thể lưu ảnh — bộ nhớ demo cục bộ đã đầy.',
          })
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  return (
    <div>
      <Header title={t({ en: 'Photo Walls', vi: 'Tường ảnh' })} />
      <AdminGate />

      <div className="px-4 pt-4">
        <p className="text-xs text-gray-500 mb-3">
          {t({
            en: 'Stored on this device only for now (demo) · images up to 5MB',
            vi: 'Hiện chỉ lưu trên thiết bị này (bản demo) · ảnh tối đa 5MB',
          })}
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t({ en: 'Your display name', vi: 'Tên hiển thị của bạn' })}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0B2A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82C4]"
        />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full mt-2.5 bg-[#0B2A4A] text-white font-semibold rounded-xl py-3 text-sm"
        >
          📷 {t({ en: 'Add a photo', vi: 'Thêm ảnh' })}
        </button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      <div className="px-4 pt-5 pb-6 grid grid-cols-2 gap-3">
        {photos.length === 0 ? (
          <p className="col-span-2 text-center text-sm text-gray-400 py-8">
            {t({ en: 'No photos yet. Be the first!', vi: 'Chưa có ảnh nào. Hãy là người đầu tiên!' })}
          </p>
        ) : (
          photos.map((photo) => (
            <div key={photo.id} className="relative bg-white rounded-2xl shadow-sm overflow-hidden">
              <img src={photo.dataUrl} alt={photo.name} className="w-full aspect-square object-cover" />
              <div className="p-2">
                <div className="text-xs font-semibold text-[#0B2A4A] truncate">{photo.name}</div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-semibold rounded-full px-2 py-1"
                >
                  {t({ en: 'Delete', vi: 'Xóa' })}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
