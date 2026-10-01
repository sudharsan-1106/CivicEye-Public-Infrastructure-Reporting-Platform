'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  Users,
  Building,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getComplaints } from '@/services/complaints/complaints';
import { getFieldEngineers } from '@/services/admin/admin';
import { Complaint, ComplaintStatus, Profile } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default function OfficerDashboardPage() {
  const router = useRouter();
  const { user, profile, role, isLoading: authLoading } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [engineers, setEngineers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Department statistics
  const [stats, setStats] = useState({
    total: 0,
    pendingVerification: 0,
    assigned: 0,
    inProgress: 0,
    awaitingReview: 0,
    closed: 0,
  });

  const departmentId = profile?.department_id;

  const loadData = async () => {
    setLoading(true);

    const [complaintRes, engineerRes] = await Promise.all([
      getComplaints({
        departmentId: departmentId || undefined,
        status: statusFilter,
        search: searchTerm,
        pageSize: 50,
      }),
      getFieldEngineers(departmentId || undefined),
    ]);

    setComplaints(complaintRes.data);
    setEngineers(engineerRes);

    // Compute metrics
    const allDeptComplaints = await getComplaints({
      departmentId: departmentId || undefined,
      pageSize: 200,
    });

    if (allDeptComplaints.data) {
      const data = allDeptComplaints.data;
      setStats({
        total: data.length,
        pendingVerification: data.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_VERIFICATION').length,
        assigned: data.filter((c) => c.status === 'ASSIGNED').length,
        inProgress: data.filter((c) => c.status === 'IN_PROGRESS').length,
        awaitingReview: data.filter((c) => c.status === 'RESOLVED').length,
        closed: data.filter((c) => c.status === 'CLOSED').length,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, profile, statusFilter]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  // Access control check
  if (!user || (role !== 'department_officer' && role !== 'administrator')) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This portal is reserved for authorized Department Officers and Administrators.
        </p>
        <Link href="/login">
          <Button variant="primary">Staff Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="ambient-glow glow-cyan w-[400px] h-[400px] -top-10 left-10 opacity-25 pointer-events-none" />

      {/* Officer Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/15 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-800/60">
              Department Officer Console
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-medium">
              {profile?.department?.name || 'Municipal Infrastructure Command'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Officer {profile?.full_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage departmental grievance verification, assign field engineers, and review resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/complaints/new">
            <Button size="sm" variant="glass" className="font-medium">
              File Official Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Pipeline Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Dept Total</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">Verify</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">{stats.pendingVerification}</p>
        </div>
        <div className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-purple-700 font-semibold uppercase tracking-wider">Assigned</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-800 mt-1">{stats.assigned}</p>
        </div>
        <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider">In Progress</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 mt-1">{stats.inProgress}</p>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">Review</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">{stats.awaitingReview}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-100/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">Closed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{stats.closed}</p>
        </div>
      </div>

      {/* Verification Queue & Complaints Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Complaints Queue */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Department Complaints Queue</CardTitle>

              <div className="flex flex-wrap items-center gap-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadData();
                  }}
                  className="relative"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search ref or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-200 w-40 sm:w-48 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-9 px-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted (New)</option>
                  <option value="UNDER_VERIFICATION">Under Verification</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved (Pending Review)</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-slate-400 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-xs">Loading queue...</span>
                </div>
              ) : complaints.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={CheckCircle2}
                    title="Queue Empty"
                    description="No complaints found matching this filter criteria in your department."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Reference</th>
                        <th className="px-6 py-3 font-semibold">Title & Citizen</th>
                        <th className="px-6 py-3 font-semibold">Priority</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold">Date Filed</th>
                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {complaints.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          onClick={() => router.push(`/complaints/${item.id}`)}
                        >
                          <td className="px-6 py-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                            {item.complaint_reference}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <span className="font-semibold text-slate-900 block truncate">
                              {item.title}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              By {item.citizen?.full_name || 'Citizen'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="priority" value={item.priority} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="status" value={item.status} />
                          </td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <Link
                              href={`/complaints/${item.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1"
                            >
                              Manage <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Engineers in Department */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm">Department Field Engineers</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-3">
              {engineers.length === 0 ? (
                <p className="text-slate-400 italic">No engineers currently registered in this department.</p>
              ) : (
                <div className="space-y-3">
                  {engineers.map((eng) => (
                    <div
                      key={eng.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                          {eng.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{eng.full_name}</p>
                          <p className="text-[11px] text-slate-500">{eng.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
