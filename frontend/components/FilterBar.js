export default function FilterBar({ members, projects, filters, onChange }) {
    const inputClass =
      'rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';
  
    return (
      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/50">Team member</label>
          <select
            value={filters.member}
            onChange={(e) => onChange({ ...filters, member: e.target.value })}
            className={inputClass}
          >
            <option value="">All members</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/50">Project</label>
          <select
            value={filters.project}
            onChange={(e) => onChange({ ...filters, project: e.target.value })}
            className={inputClass}
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/50">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className={inputClass}
          />
        </div>
  
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/50">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className={inputClass}
          />
        </div>
  
        {(filters.member || filters.project || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => onChange({ member: '', project: '', dateFrom: '', dateTo: '' })}
            className="rounded-lg px-3 py-2 text-xs font-medium text-ink/50 hover:text-ink/80"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }