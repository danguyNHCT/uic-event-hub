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

function GeneralAgendaCell({ text }) {
  const lines = text.split('\n');
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, idx) => {
        const match = line.match(/^(GROUP \d):\s*(.*)$/);
        if (match) {
          return (
            <div key={idx}>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 mr-1 bg-[#0B2A4A]/10 text-[#0B2A4A] align-middle">
                {match[1]}
              </span>
              <span className="text-xs text-gray-700 align-middle">{match[2]}</span>
            </div>
          );
        }
        return (
          <div key={idx} className="text-xs font-semibold text-[#0B2A4A]">
            {line}
          </div>
        );
      })}
    </div>
  );
}

function GeneralAgendaTable() {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="border-separate border-spacing-0 min-w-[660px] w-full">
        <thead>
          <tr>
            <th className="sticky left-0 bg-[#F7F8FA] text-left text-[11px] font-semibold text-gray-400 uppercase p-2 w-[80px]">
              {t({ en: 'Period', vi: 'Buổi' })}
            </th>
            {GENERAL_AGENDA.days.map((day) => (
              <th
                key={day}
                className="text-left text-[11px] font-semibold text-gray-400 uppercase p-2 min-w-[150px]"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GENERAL_AGENDA.rows.map((row) => (
            <tr key={row.period}>
              <td className="sticky left-0 bg-white align-top text-xs font-bold text-[#0B2A4A] p-2 border-t border-gray-100">
                {row.period}
              </td>
              {row.cells.map((cell, idx) => (
                <td key={idx} className="align-top bg-white p-2 border-t border-l border-gray-100">
                  <GeneralAgendaCell text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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

function DetailedAgendaTimeline({ trip }) {
  const { t } = useLanguage();
  const groups = groupRowsByDate(trip.rows);

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="text-sm font-bold text-[#0B2A4A] mb-2 whitespace-pre-line leading-snug">
            {group.date}
          </h3>
          <ol className="relative border-l-2 border-[#0B2A4A]/20 ml-2">
            {group.items.map((row, idx) => (
              <li key={idx} className="mb-4 ml-5 last:mb-0">
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
                <div className="bg-white rounded-xl shadow-sm p-3.5">
                  {row.activity ? (
                    <div className="font-semibold text-[#0B2A4A] whitespace-pre-line">{row.activity}</div>
                  ) : (
                    <div className="text-sm italic text-gray-400">
                      {t({ en: 'Not yet updated / TBU', vi: 'Chưa cập nhật / TBU' })}
                    </div>
                  )}
                  {row.note && (
                    <div className="text-xs text-gray-500 mt-1.5 whitespace-pre-line">{row.note}</div>
                  )}
                </div>
              </li>
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

      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-full p-1 gap-1">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 text-xs font-semibold rounded-full py-2 transition-colors ${
                subTab === tab.id ? 'bg-[#0B2A4A] text-white' : 'text-gray-500'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 pb-6">
        {subTab === 'general' && <GeneralAgendaTable />}
        {subTab === 'trip1' && <DetailedAgendaTimeline trip={DETAILED_AGENDA.trip1} />}
        {subTab === 'trip2' && <DetailedAgendaTimeline trip={DETAILED_AGENDA.trip2} />}
      </div>
    </div>
  );
}
