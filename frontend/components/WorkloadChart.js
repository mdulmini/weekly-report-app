'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function buildWorkloadData(reports) {
  const byProject = {};
  reports.forEach((r) => {
    const name = r.project?.name || 'Unassigned';
    byProject[name] = (byProject[name] || 0) + 1;
  });
  return Object.entries(byProject)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function WorkloadChart({ reports }) {
  const data = buildWorkloadData(reports);

  if (!data.length) {
    return <p className="text-sm text-ink/40">No reports in this range yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#8890A6' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 12, fill: '#8890A6' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EEF0F5', fontSize: 12 }} />
        <Bar dataKey="count" name="Reports" fill="#5B7CFA" radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}