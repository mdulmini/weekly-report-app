'use client';

import { useState } from 'react';
import { generateTeamSummary } from '../lib/api';

export default function TeamSummaryCard({ token, weekStartDate }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await generateTeamSummary(token, { weekStartDate });
      setSummary(res.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-ink">AI weekly summary</h2>
          <p className="mt-0.5 text-xs text-ink/40">
            Generated from this week's submitted reports
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-dark disabled:opacity-50"
        >
          {loading ? 'Generating…' : summary ? 'Regenerate' : 'Generate summary'}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {summary && !error && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">{summary}</p>
      )}

      {!summary && !error && !loading && (
        <p className="mt-3 text-sm text-ink/40">
          Click "Generate summary" to have AI summarize completed work, recurring blockers, and
          workload balance for this week.
        </p>
      )}
    </div>
  );
}