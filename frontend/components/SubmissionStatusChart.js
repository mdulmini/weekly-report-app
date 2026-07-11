'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STATUS_COLORS = {
  submitted: '#10B981',
  pending: '#F59E0B',
  late: '#EF4444',
};

export default function SubmissionStatusChart({ statusList }) {
  const data = statusList.map((s) => ({
    name: s.name.split(' ')[0],
    value: 1,
    status: s.status,
  }));

  if (!data.length) {
    return <p className="text-sm text-ink/40">No team members yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8890A6' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[0, 1]} />
        <Tooltip
          formatter={(_, __, entry) => [entry.payload.status, 'Status']}
          contentStyle={{ borderRadius: 8, border: '1px solid #EEF0F5', fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
          {data.map((entry, index) => (
            <Cell key={index} fill={STATUS_COLORS[entry.status] || '#94A3B8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}