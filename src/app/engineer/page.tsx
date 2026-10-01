'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  MapPin,
  Search,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getComplaints } from '@/services/complaints/complaints';
import { Complaint, ComplaintStatus } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default function FieldEngineerDashboardPage() {
  const router = useRouter();
  const { user, profile, role, isLoading: authLoading } = useAuth();

  const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Engineer stats
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingStart: 0,
    inProgress: 0,
    resolved: 0,
  });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const res = await getComplaints({
      engineerId: user.id,
      status: statusFilter,
      search: searchTerm,
      pageSize: 50,
    });

    setAssignedComplaints(res.data);

    // Compute stats
    const allAssigned = await getComplaints({
      engineerId: user.id,
      pageSize: 100,
    });

    if (allAssigned.data) {
      const data = allAssigned.data;
      setStats({
        totalAssigned: data.length,
        pendingStart: data.filter((c) => c.status === 'ASSIGNED').length,
        inProgress: data.filter((c) => c.status === 'IN_PROGRESS').length,
        resolved: data.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, statusFilter]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  // Access control
  if (!user || (role !== 'field_engineer' && role !== 'administrator')) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This portal is reserved for authorized Field Engineers.
        </p>
        <Link href="/login">
          <Button variant="primary">Field Engineer Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="ambient-glow glow-cyan w-[400px] h-[400px] -top-10 left-10 opacity-25 pointer-events-none" />

      {/* Engineer Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 rounded-3xl text-white shadow-xl shadow-indigo-900/15 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            Field Operations Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Engineer {profile?.full_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Inspect assigned infrastructure defects, report progress, and submit photo resolution proof.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <span className="text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md">
            Dept: {profile?.department?.name || 'Assigned Division'}
          </span>
        </div>
      </div>

      {/* Engineer Statistics */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Assigned Orders</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">{stats.totalAssigned}</p>
        </div>
        <div className="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">Pending Dispatch</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1.5">{stats.pendingStart}</p>
        </div>
        <div className="p-5 rounded-2xl border border-blue-200/80 bg-blue-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider">Under Repair</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 mt-1.5">{stats.inProgress}</p>
        </div>
        <div className="p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">Completed Repairs</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1.5">{stats.resolved}</p>
        </div>
      </div>

      {/* Assigned Tasks Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Assigned Work Orders</CardTitle>

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
                placeholder="Search reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-200 w-44 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-2 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Work Statuses</option>
              <option value="ASSIGNED">New Assignment</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-xs">Loading work orders...</span>
            </div>
          ) : assignedComplaints.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Wrench}
                title="No Work Orders"
                description="No assigned complaints found matching this criteria."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Reference</th>
                    <th className="px-6 py-3 font-semibold">Defect Title</th>
                    <th className="px-6 py-3 font-semibold">Location</th>
                    <th className="px-6 py-3 font-semibold">Priority</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedComplaints.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => router.push(`/complaints/${item.id}`)}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                        {item.complaint_reference}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="priority" value={item.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="status" value={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/complaints/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1"
                        >
                          Execute Work <ArrowRight className="w-3 h-3" />
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
  );
}
