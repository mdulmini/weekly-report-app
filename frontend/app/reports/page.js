'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ReportForm from '../../components/ReportForm';
import ReportList from '../../components/ReportList';
import {
  createReport,
  deleteReport,
  getMyReports,
  getProjects,
  submitReport,
  updateReport,
} from '../../lib/api';

export default function ReportsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsRes, reportsRes] = await Promise.all([
        getProjects(token),
        getMyReports(token),
      ]);
      setProjects(projectsRes.projects);
      setReports(reportsRes.reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    setError('');
    try {
      if (editingReport) {
        await updateReport(token, editingReport._id, formData);
      } else {
        await createReport(token, formData);
      }
      setEditingReport(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (id) => {
    setError('');
    try {
      await submitReport(token, id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    setError('');
    try {
      await deleteReport(token, id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-ink">
          {editingReport ? 'Edit weekly report' : 'New weekly report'}
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Same fields, same order, every week — keeps your reports comparable across the team.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {projects.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-ink/50">
            No projects exist yet. Ask your manager to create one before you file a report.
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <ReportForm
              key={editingReport?._id || 'new'}
              projects={projects}
              initialData={editingReport}
              onSubmit={handleFormSubmit}
              submitting={submitting}
            />
            {editingReport && (
              <button
                onClick={() => setEditingReport(null)}
                className="mt-3 text-xs font-medium text-ink/40 hover:text-ink/60"
              >
                Cancel edit
              </button>
            )}
          </div>
        )}

        <h2 className="mt-10 font-display text-lg font-bold text-ink">Your report history</h2>
        <div className="mt-4">
          <ReportList
            reports={reports}
            onEdit={setEditingReport}
            onSubmit={handleSubmitReport}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}