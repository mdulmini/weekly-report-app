export default function ActivityFeed({ reports }) {
    const recent = [...reports]
      .filter((r) => r.status === 'submitted')
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 6);
  
    if (!recent.length) {
      return <p className="text-sm text-ink/40">No submissions yet in this range.</p>;
    }
  
    return (
      <ul className="divide-y divide-black/5">
        {recent.map((r) => (
          <li key={r._id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {r.user?.name} <span className="font-normal text-ink/40">· {r.project?.name}</span>
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-ink/50">{r.tasksCompleted}</p>
            </div>
            <span className="shrink-0 text-xs text-ink/30">
              {new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </li>
        ))}
      </ul>
    );
  }