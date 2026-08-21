import { useLanguage } from '../LanguageContext';
import { getOfficeDeptOptions } from '../peopleFilter';

// Shared search + Office -> Dept filter UI for Attendees and Room Share.
// `people` is the flat list the current screen/trip is showing, used only to
// derive which Office/Dept options make sense to offer.
export default function PeopleFilterBar({ people, query, onQueryChange, office, onOfficeChange, dept, onDeptChange }) {
  const { t } = useLanguage();
  const { offices, deptsByOffice } = getOfficeDeptOptions(people);
  const deptOptions = office ? deptsByOffice[office] ?? [] : [];

  return (
    <div className="px-4 pt-3 flex flex-col gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t({ en: 'Search by name...', vi: 'Tìm theo tên...' })}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#0B2A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82C4]"
      />
      <div className="flex gap-2">
        <select
          value={office}
          onChange={(e) => onOfficeChange(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-[#0B2A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82C4]"
        >
          <option value="">{t({ en: 'All offices', vi: 'Tất cả văn phòng' })}</option>
          {offices.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select
          value={dept}
          onChange={(e) => onDeptChange(e.target.value)}
          disabled={!office}
          className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-[#0B2A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82C4] disabled:opacity-50"
        >
          <option value="">{t({ en: 'All depts', vi: 'Tất cả bộ phận' })}</option>
          {deptOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
