export default function StatCard({ label, value, sublabel, tone = 'default' }) {
    const toneStyles = {
      default: 'text-ink',
      good: 'text-emerald-600',
      warn: 'text-amber-600',
      bad: 'text-red-600',
    };
  
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</p>
        <p className={`mt-2 font-display text-3xl font-bold ${toneStyles[tone]}`}>{value}</p>
        {sublabel && <p className="mt-1 text-xs text-ink/40">{sublabel}</p>}
      </div>
    );
  }