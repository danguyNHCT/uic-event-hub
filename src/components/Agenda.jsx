import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import ScreenHeader from './ScreenHeader';
import { GENERAL_AGENDA, DETAILED_AGENDA } from '../content';

const SUB_TABS = [
  { id: 'general', label: { en: 'General', vi: 'Tổng quan' } },
  { id: 'trip1', label: { en: 'Trip 1', vi: 'Đợt 1' } },
  { id: 'trip2', label: { en: 'Trip 2', vi: 'Đợt 2' } },
];

const GROUP_COLORS = {
  HCMC: 'bg-[#3B82C4]/15 text-[#3B82C4]',
  Hanoi: 'bg-[#C9A227]/25 text-[#8a6c14]',
  Danang: 'bg-emerald-100 text-emerald-700',
  All: 'bg-[#0B2A4A]/10 text-[#0B2A4A]',
};

function groupColor(group) {
  return GROUP_COLORS[group] || 'bg-gray-100 text-gray-600';
}

function GeneralAgendaLine({ line }) {
  const match = line.match(/^(GROUP \d):\s*(.*)$/);
  if (match) {
    return (
      <div>
        <span className="inline-block text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 mr-1 bg-[#0B2A4A]/10 text-[#0B2A4A] align-middle">
          {match[1]}
        </span>
        <span className="text-xs text-gray-700 align-middle">{match[2]}</span>
      </div>
    );
  }
  return <div className="text-xs font-semibold text-[#0B2A4A]">{line}</div>;
}

// The period label centers against the FIRST content line only. When a
// period has multiple GROUP rows stacked underneath, subsequent rows are
// indented under the content column (via a same-width invisible spacer, so
// they stay in sync with the label column) with no label repeated next to
// them, and don't affect the label's vertical position.
function GeneralAgendaRow({ period, text }) {
  const [firstLine, ...restLines] = text.split('\n');

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase w-20 shrink-0 whitespace-nowrap">
          {period}
        </span>
        <div className="flex-1">
          <GeneralAgendaLine line={firstLine} />
        </div>
      </div>
      {restLines.map((line, idx) => (
        <div key={idx} className="flex gap-2">
          <span className="w-20 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <GeneralAgendaLine line={line} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Vertical, one-day-per-card layout — avoids the horizontal scroll a
// day-columns table would need on a phone-width viewport.
function GeneralAgendaTable() {
  return (
    <div className="flex flex-col gap-2.5">
      {GENERAL_AGENDA.days.map((day, dayIdx) => (
        <div key={day} className="bg-white rounded-2xl shadow-sm p-3">
          <h3 className="text-xs font-bold text-[#0B2A4A] mb-2">{day}</h3>
          <div className="flex flex-col gap-2">
            {GENERAL_AGENDA.rows.map((row) => (
              <GeneralAgendaRow key={row.period} period={row.period} text={row.cells[dayIdx]} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupRowsByDate(rows) {
  const groups = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.date === row.date) {
      last.items.push(row);
    } else {
      groups.push({ date: row.date, items: [row] });
    }
  });
  return groups;
}

function AgendaRow({ row }) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const hasMenu = row.menu && row.menu.length > 0;

  return (
    <li className="mb-3 ml-5 last:mb-0">
      <span className="absolute -left-[7px] w-3.5 h-3.5 rounded-full bg-[#C9A227] border-2 border-white" />
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-semibold text-[#3B82C4]">
          {row.time || t({ en: 'Time TBU', vi: 'Giờ chưa cập nhật' })}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${groupColor(row.group)}`}
        >
          {row.group}
        </span>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-3">
        {row.activity ? (
          <div className="font-semibold text-[#0B2A4A] whitespace-pre-line">{row.activity}</div>
        ) : (
          <div className="text-sm italic text-gray-400">
            {t({ en: 'Not yet updated / TBU', vi: 'Chưa cập nhật / TBU' })}
          </div>
        )}
        {row.note && <div className="text-xs text-gray-500 mt-1.5 whitespace-pre-line">{row.note}</div>}
        {(row.mapsUrl || hasMenu) && (
          <div className="flex gap-3 mt-2">
            {row.mapsUrl && (
              <a
                href={row.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#3B82C4] flex items-center gap-1"
              >
                📍 {t({ en: 'View on map', vi: 'Xem bản đồ' })}
              </a>
            )}
            {hasMenu && (
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="text-xs font-semibold text-[#3B82C4] flex items-center gap-1"
              >
                🍽️ {t({ en: 'View menu', vi: 'Xem thực đơn' })}
              </button>
            )}
          </div>
        )}
        {hasMenu && menuOpen && (
          <ul className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
            {row.menu.map((item, idx) => (
              <li key={idx} className="text-xs text-gray-600">
                • {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function DetailedAgendaTimeline({ trip }) {
  const groups = groupRowsByDate(trip.rows);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="text-sm font-bold text-[#0B2A4A] mb-1.5 whitespace-pre-line leading-snug">
            {group.date}
          </h3>
          <ol className="relative border-l-2 border-[#0B2A4A]/20 ml-2">
            {group.items.map((row, idx) => (
              <AgendaRow key={idx} row={row} />
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default function Agenda({ onBack }) {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState('general');

  return (
    <div>
      <ScreenHeader title={t({ en: 'Agenda', vi: 'Chương trình' })} onBack={onBack} />

      <div className="px-4 pt-3">
        <div className="flex bg-gray-100 rounded-full p-1 gap-1">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 text-xs font-semibold rounded-full py-1.5 transition-colors ${
                subTab === tab.id ? 'bg-[#0B2A4A] text-white' : 'text-gray-500'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        {subTab === 'general' && <GeneralAgendaTable />}
        {subTab === 'trip1' && <DetailedAgendaTimeline trip={DETAILED_AGENDA.trip1} />}
        {subTab === 'trip2' && <DetailedAgendaTimeline trip={DETAILED_AGENDA.trip2} />}
      </div>
    </div>
  );
}
