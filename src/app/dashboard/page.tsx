'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  Loader2,
  Calendar,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getComplaints } from '@/services/complaints/complaints';
import { Complaint, ComplaintStatus } from '@/types/database';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default function CitizenDashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [totalCount, setTotalCount] = useState(0);

  // Real Database Counts
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const res = await getComplaints({
      citizenId: user.id,
      search: searchTerm,
      status: selectedStatus,
      pageSize: 20,
    });

    setComplaints(res.data);
    setTotalCount(res.total);

    // Compute stats from full user list
    const allRes = await getComplaints({
      citizenId: user.id,
      pageSize: 100,
    });

    if (allRes.data) {
      setStats({
        total: allRes.data.length,
        submitted: allRes.data.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_VERIFICATION').length,
        inProgress: allRes.data.filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length,
        resolved: allRes.data.filter((c) => c.status === 'RESOLVED').length,
        closed: allRes.data.filter((c) => c.status === 'CLOSED').length,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Dashboard</h2>
        <p className="text-xs text-slate-500">
          Please log in to track your reported civic infrastructure issues and notifications.
        </p>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="ambient-glow glow-cyan w-[400px] h-[400px] -top-10 left-10 opacity-25 pointer-events-none" />

      {/* Welcome Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl shadow-indigo-900/15 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            Citizen Grievance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {profile?.full_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Track and monitor the status of all your public infrastructure reports.
          </p>
        </div>

        <Link href="/complaints/new" className="relative z-10 shrink-0">
          <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100 shadow-md font-semibold border-none">
            <PlusCircle className="w-4 h-4 mr-2 text-sky-600" />
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Real Statistics Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">{stats.total}</p>
        </div>
        <div className="p-5 rounded-2xl border border-sky-200/80 bg-sky-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-xs text-sky-700 font-semibold uppercase tracking-wider">Under Review</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-800 mt-1.5">{stats.submitted}</p>
        </div>
        <div className="p-5 rounded-2xl border border-purple-200/80 bg-purple-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-xs text-purple-700 font-semibold uppercase tracking-wider">In Progress</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-800 mt-1.5">{stats.inProgress}</p>
        </div>
        <div className="p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow">
          <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Resolved</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1.5">{stats.resolved}</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-100/70 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Closed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1.5">{stats.closed}</p>
        </div>
      </div>

      {/* Complaints List with Real Filters */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">My Submitted Complaints</CardTitle>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              <input
                type="text"
                placeholder="Search reference or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 w-48 sm:w-56"
              />
            </form>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="h-9 px-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="pt-4 p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-xs">Loading complaints...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FileText}
                title="No Complaints Found"
                description={
                  searchTerm || selectedStatus !== 'ALL'
                    ? 'No complaints match your active filter criteria.'
                    : "You haven't filed any infrastructure reports yet. If you notice a broken streetlight, pothole, or garbage dump, report it now!"
                }
                actionLabel="Report Infrastructure Issue"
                actionHref="/complaints/new"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Reference</th>
                    <th className="px-6 py-3 font-semibold">Issue Title</th>
                    <th className="px-6 py-3 font-semibold">Category</th>
                    <th className="px-6 py-3 font-semibold">Department</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Date Filed</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
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
                      <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {item.category?.name || 'General'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {item.department?.name || 'Pending'}
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
                          View Details <ArrowRight className="w-3 h-3" />
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
