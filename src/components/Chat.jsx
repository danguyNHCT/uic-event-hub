import { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import Header from './Header';
import AdminGate from './AdminGate';
import { useAdmin } from '../AdminContext';
import { usePersistentState } from '../store';

function formatRelative(timestamp, lang, now) {
  const seconds = Math.floor((now - timestamp) / 1000);
  if (seconds < 60) return lang === 'vi' ? 'vừa xong' : 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return lang === 'vi' ? `${minutes} phút trước` : `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  return lang === 'vi' ? `${hours} giờ trước` : `${hours} hr ago`;
}

export default function Chat() {
  const { lang, t } = useLanguage();
  const { isAdmin } = useAdmin();
  const [messages, setMessages] = usePersistentState('uic-trip-chat', []);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!text.trim() || !name.trim()) return;
    setMessages([
      { id: Date.now(), name: name.trim(), text: text.trim(), timestamp: Date.now() },
      ...messages,
    ]);
    setText('');
  };

  const handleDelete = (id) => {
    setMessages(messages.filter((m) => m.id !== id));
  };

  return (
    <div>
      <Header title={t({ en: 'Chat', vi: 'Trò chuyện' })} />
      <AdminGate />

      <div className="px-4 pt-4 pb-6">
        <p className="text-xs text-gray-500 mb-4">
          {t({
            en: 'Stored on this device only for now (demo)',
            vi: 'Hiện chỉ lưu trên thiết bị này (bản demo)',
          })}
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t({ en: 'Your display name', vi: 'Tên hiển thị của bạn' })}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0B2A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82C4]"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t({ en: 'Type a message...', vi: 'Nhập tin nhắn...' })}
          rows={2}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 mt-2.5 text-sm text-[#0B2A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82C4] resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || !name.trim()}
          className="w-full mt-3 bg-[#0B2A4A] disabled:opacity-40 text-white font-semibold rounded-xl py-3 text-sm transition-opacity"
        >
          {t({ en: 'Send', vi: 'Gửi' })}
        </button>

        <div className="mt-6 flex flex-col gap-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              {t({ en: 'No messages yet. Say hi!', vi: 'Chưa có tin nhắn nào. Hãy nói lời chào!' })}
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#0B2A4A] text-sm">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatRelative(m.timestamp, lang, now)}</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-400 text-[11px] font-semibold"
                      >
                        {t({ en: 'Delete', vi: 'Xóa' })}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{m.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
