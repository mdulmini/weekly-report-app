'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import FilterBar from '../../components/FilterBar';
import SubmissionStatusChart from '../../components/SubmissionStatusChart';
import TasksTrendChart from '../../components/TasksTrendChart';
import WorkloadChart from '../../components/WorkloadChart';
import ActivityFeed from '../../components/ActivityFeed';
import TeamSummaryCard from '../../components/TeamSummaryCard';
import ChatWidget from '../../components/ChatWidget';
import { getProjects, getTeamMembers, getTeamReports, getSubmissionStatus } from '../../lib/api';
import { getMondayOfWeek, shiftWeek, formatWeekLabel } from '../../lib/dateUtils';

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(getMondayOfWeek());
  const [filters, setFilters] = useState({ member: '', project: '', dateFrom: '', dateTo: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'manager') {
      router.replace('/reports');
      return;
    }
    loadStaticData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  useEffect(() => {
    if (!user || user.role !== 'manager') return;
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  useEffect(() => {
    if (!user || user.role !== 'manager') return;
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentWeek]);

  const loadStaticData = async () => {
    try {
      const [membersRes, projectsRes] = await Promise.all([
        getTeamMembers(token),
        getProjects(token),
      ]);
      setMembers(membersRes.members);
      setProjects(projectsRes.projects);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.member) params.set('member', filters.member);
      if (filters.project) params.set('project', filters.project);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await getTeamReports(token, query);
      setReports(res.reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const res = await getSubmissionStatus(token, currentWeek);
      setStatusList(res.statusList);
    } catch (err) {
      setError(err.message);
    }
  };

  const stats = useMemo(() => {
    const submittedThisWeek = statusList.filter((s) => s.status === 'submitted').length;
    const total = statusList.length || 1;
    const complianceRate = Math.round((submittedThisWeek / total) * 100);
    const openBlockers = reports.filter((r) => r.blockers && r.blockers.trim().toLowerCase() !== 'none').length;
    return { submittedThisWeek, complianceRate, openBlockers, totalMembers: statusList.length };
  }, [statusList, reports]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Team Dashboard</h1>
            <p className="mt-1 text-sm text-ink/50">
              Submission status for week of {formatWeekLabel(currentWeek)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeek(shiftWeek(currentWeek, -1))}
              className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-ink/60 hover:bg-black/5"
            >
              ← Prev week
            </button>
            <button
              onClick={() => setCurrentWeek(getMondayOfWeek())}
              className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-ink/60 hover:bg-black/5"
            >
              This week
            </button>
            <button
              onClick={() => setCurrentWeek(shiftWeek(currentWeek, 1))}
              className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-ink/60 hover:bg-black/5"
            >
              Next week →
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {/* Summary metrics */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Submitted this week"
            value={`${stats.submittedThisWeek} / ${stats.totalMembers}`}
            sublabel="Team members reporting in"
            tone="good"
          />
          <StatCard
            label="Compliance rate"
            value={`${stats.complianceRate}%`}
            sublabel="Submitted vs pending this week"
            tone={stats.complianceRate >= 80 ? 'good' : stats.complianceRate >= 50 ? 'warn' : 'bad'}
          />
          <StatCard
            label="Open blockers"
            value={stats.openBlockers}
            sublabel="Across reports in current filter"
            tone={stats.openBlockers > 0 ? 'warn' : 'default'}
          />
        </div>

        {/* Filters (apply to charts + activity feed below, not the weekly status card above) */}
        <div className="mt-6">
          <FilterBar members={members} projects={projects} filters={filters} onChange={setFilters} />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="font-display font-semibold text-ink">Submission status this week</h2>
            <p className="mt-0.5 text-xs text-ink/40">Per team member</p>
            <div className="mt-4">
              <SubmissionStatusChart statusList={statusList} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="font-display font-semibold text-ink">Workload by project</h2>
            <p className="mt-0.5 text-xs text-ink/40">Report count in the current filter</p>
            <div className="mt-4">
              <WorkloadChart reports={reports} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:col-span-2">
            <h2 className="font-display font-semibold text-ink">Reports trend over time</h2>
            <p className="mt-0.5 text-xs text-ink/40">Submitted vs total reports per week</p>
            <div className="mt-4">
              <TasksTrendChart reports={reports} />
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-display font-semibold text-ink">Recent activity</h2>
          <p className="mt-0.5 text-xs text-ink/40">Latest submitted reports in the current filter</p>
          <div className="mt-2">
            {loading ? <p className="text-sm text-ink/40">Loading…</p> : <ActivityFeed reports={reports} />}
          </div>
        </div>

        {/* AI weekly summary */}
        <div className="mt-6">
          <TeamSummaryCard token={token} weekStartDate={currentWeek} />
        </div>
      </main>

      {/* Floating AI chat assistant */}
      <ChatWidget token={token} />
    </div>
  );
}