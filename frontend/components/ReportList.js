'use client';

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-amber-50 text-amber-700',
    submitted: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function ReportList({ reports, onEdit, onSubmit, onDelete }) {
  if (!reports.length) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
        <p className="text-sm text-ink/50">No reports yet. Create your first weekly report above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report._id}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-ink">
                  {new Date(report.weekStartDate).toLocaleDateString()} –{' '}
                  {new Date(report.weekEndDate).toLocaleDateString()}
                </p>
                <StatusBadge status={report.status} />
              </div>
              <p className="mt-0.5 text-sm text-ink/50">{report.project?.name || 'No project'}</p>
            </div>

            <div className="flex shrink-0 gap-2">
              {report.status === 'draft' && (
                <>
                  <button
                    onClick={() => onEdit(report)}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-black/5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onSubmit(report._id)}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-dark"
                  >
                    Submit
                  </button>
                </>
              )}
              {report.status === 'submitted' && (
                <button
                  onClick={() => onEdit(report)}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-black/5"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => onDelete(report._id)}
                className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium text-ink/70">Completed</p>
              <p className="mt-0.5 whitespace-pre-wrap text-ink/60">{report.tasksCompleted}</p>
            </div>
            <div>
              <p className="font-medium text-ink/70">Planned next</p>
              <p className="mt-0.5 whitespace-pre-wrap text-ink/60">{report.tasksPlanned}</p>
            </div>
            {report.blockers && (
              <div className="sm:col-span-2">
                <p className="font-medium text-ink/70">Blockers</p>
                <p className="mt-0.5 whitespace-pre-wrap text-ink/60">{report.blockers}</p>
              </div>
            )}
          </div>

          {report.hoursWorked != null && (
            <p className="mt-3 text-xs text-ink/40">Hours worked: {report.hoursWorked}</p>
          )}
        </div>
      ))}
    </div>
  );
}