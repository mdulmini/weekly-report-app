'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatWeekLabel } from '../lib/dateUtils';

function buildTrendData(reports) {
  const byWeek = {};
  reports.forEach((r) => {
    const key = r.weekStartDate.slice(0, 10);
    byWeek[key] = byWeek[key] || { week: key, submitted: 0, total: 0 };
    byWeek[key].total += 1;
    if (r.status === 'submitted') byWeek[key].submitted += 1;
  });

  return Object.values(byWeek)
    .sort((a, b) => new Date(a.week) - new Date(b.week))
    .map((entry) => ({ ...entry, label: formatWeekLabel(entry.week) }));
}

export default function TasksTrendChart({ reports }) {
  const data = buildTrendData(reports);

  if (!data.length) {
    return <p className="text-sm text-ink/40">No reports in this range yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8890A6' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8890A6' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EEF0F5', fontSize: 12 }} />
        <Line type="monotone" dataKey="submitted" name="Reports submitted" stroke="#3457D5" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="total" name="Reports total" stroke="#C7CEDF" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}