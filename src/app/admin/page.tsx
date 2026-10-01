'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Building,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  FolderKanban,
  Sliders,
  History,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getComplaints } from '@/services/complaints/complaints';
import { getAllUsers, getDepartments, getIssueCategories, getAuditLogs } from '@/services/admin/admin';
import { Complaint, Profile, Department, IssueCategory, AuditLog } from '@/types/database';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile, role, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadData = async () => {
    setLoading(true);

    const [cRes, uRes, dRes, catRes, aRes] = await Promise.all([
      getComplaints({ pageSize: 100 }),
      getAllUsers(),
      getDepartments(),
      getIssueCategories(),
      getAuditLogs(),
    ]);

    setComplaints(cRes.data);
    setUsers(uRes);
    setDepartments(dRes);
    setCategories(catRes);
    setAuditLogs(aRes);

    setLoading(false);
  };

  useEffect(() => {
    if (user && role === 'administrator') {
      loadData();
    }
  }, [user, role]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  // Access control check
  if (!user || role !== 'administrator') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          This section requires highest administrative authorization level.
        </p>
        <Link href="/login">
          <Button variant="primary">Sign In as Admin</Button>
        </Link>
      </div>
    );
  }

  const citizensCount = users.filter((u) => u.role === 'citizen').length;
  const officersCount = users.filter((u) => u.role === 'department_officer').length;
  const engineersCount = users.filter((u) => u.role === 'field_engineer').length;

  const openComplaintsCount = complaints.filter(
    (c) => c.status !== 'CLOSED' && c.status !== 'REJECTED'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const closedCount = complaints.filter((c) => c.status === 'CLOSED').length;
  const rejectedCount = complaints.filter((c) => c.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-950 rounded-2xl text-white shadow-lg">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            System Administration Console
          </span>
          <h1 className="text-2xl font-bold mt-1">Platform Master Controller</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time municipal health, multi-department analytics, audit logs, and user security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button size="sm" variant="secondary" className="bg-slate-800 text-slate-200">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/audit-logs">
            <Button size="sm" variant="outline" className="border-slate-800 text-slate-200">
              <History className="w-4 h-4 mr-1.5" />
              Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs text-slate-500 font-medium">Total Registered Users</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
          <span className="text-[11px] text-slate-400">
            {citizensCount} citizens · {officersCount + engineersCount} staff
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs text-slate-500 font-medium">Municipal Departments</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{departments.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% active</span>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
          <span className="text-xs text-blue-700 font-medium">Total Complaints</span>
          <p className="text-2xl font-bold text-blue-900 mt-1">{complaints.length}</p>
          <span className="text-[11px] text-blue-600">Across all wards</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-xs text-amber-700 font-medium">Active / Open</span>
          <p className="text-2xl font-bold text-amber-900 mt-1">{openComplaintsCount}</p>
          <span className="text-[11px] text-amber-600">In workflow</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-xs text-emerald-700 font-medium">Resolved & Closed</span>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{resolvedCount + closedCount}</p>
          <span className="text-[11px] text-emerald-600">{closedCount} archived</span>
        </div>

        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
          <span className="text-xs text-rose-700 font-medium">Rejected Reports</span>
          <p className="text-2xl font-bold text-rose-900 mt-1">{rejectedCount}</p>
          <span className="text-[11px] text-rose-600">Invalid / Duplicates</span>
        </div>
      </div>

      {/* Grid: Departments Overview & Latest Platform Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Department Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Municipal Departments Overview</CardTitle>
              <span className="text-xs text-slate-500">{departments.length} registered</span>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Department</th>
                      <th className="px-6 py-3 font-semibold">Code</th>
                      <th className="px-6 py-3 font-semibold">Contact Email</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3 font-semibold text-slate-800">{dept.name}</td>
                        <td className="px-6 py-3 font-mono font-bold text-sky-700">{dept.code}</td>
                        <td className="px-6 py-3 text-slate-500">{dept.contact_email || '—'}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Operational
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base">System Security & Audit Activity</CardTitle>
              <Link
                href="/admin/audit-logs"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No audit records logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 7).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Entity: {log.entity_type} · By:{' '}
                        {log.user?.full_name || 'System / Authorized Agent'}
                      </p>
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
