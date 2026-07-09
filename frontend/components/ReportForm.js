'use client';

import { useEffect, useState } from 'react';

// Adds 6 days to a start date to get the week's end date (7-day week)
function computeWeekEnd(startDateStr) {
  if (!startDateStr) return '';
  const start = new Date(startDateStr);
  start.setDate(start.getDate() + 6);
  return start.toISOString().slice(0, 10);
}

export default function ReportForm({ projects, initialData, onSubmit, submitting }) {
  const [form, setForm] = useState({
    weekStartDate: initialData?.weekStartDate?.slice(0, 10) || '',
    weekEndDate: initialData?.weekEndDate?.slice(0, 10) || '',
    project: initialData?.project?._id || initialData?.project || '',
    tasksCompleted: initialData?.tasksCompleted || '',
    tasksPlanned: initialData?.tasksPlanned || '',
    blockers: initialData?.blockers || '',
    hoursWorked: initialData?.hoursWorked ?? '',
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    if (form.weekStartDate && !initialData) {
      setForm((f) => ({ ...f, weekEndDate: computeWeekEnd(form.weekStartDate) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.weekStartDate]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      hoursWorked: form.hoursWorked === '' ? undefined : Number(form.hoursWorked),
    });
  };

  const inputClass =
    'w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';
  const labelClass = 'mb-1 block text-sm font-medium text-ink';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Week start date</label>
          <input
            type="date"
            required
            value={form.weekStartDate}
            onChange={handleChange('weekStartDate')}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Week end date</label>
          <input
            type="date"
            required
            value={form.weekEndDate}
            onChange={handleChange('weekEndDate')}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Project / category</label>
        <select
          required
          value={form.project}
          onChange={handleChange('project')}
          className={inputClass}
        >
          <option value="" disabled>
            Select a project…
          </option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Tasks completed</label>
        <textarea
          required
          rows={3}
          value={form.tasksCompleted}
          onChange={handleChange('tasksCompleted')}
          className={inputClass}
          placeholder="What did you finish this week?"
        />
      </div>

      <div>
        <label className={labelClass}>Tasks planned for next week</label>
        <textarea
          required
          rows={3}
          value={form.tasksPlanned}
          onChange={handleChange('tasksPlanned')}
          className={inputClass}
          placeholder="What's next on your plate?"
        />
      </div>

      <div>
        <label className={labelClass}>Blockers / challenges</label>
        <textarea
          rows={2}
          value={form.blockers}
          onChange={handleChange('blockers')}
          className={inputClass}
          placeholder="Anything slowing you down? (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Hours worked (optional)</label>
          <input
            type="number"
            min={0}
            max={168}
            step={0.5}
            value={form.hoursWorked}
            onChange={handleChange('hoursWorked')}
            className={inputClass}
            placeholder="e.g. 40"
          />
        </div>
        <div>
          <label className={labelClass}>Notes / links (optional)</label>
          <input
            type="text"
            value={form.notes}
            onChange={handleChange('notes')}
            className={inputClass}
            placeholder="Doc links, extra context…"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Saving…' : initialData ? 'Save changes' : 'Save as draft'}
      </button>
    </form>
  );
}