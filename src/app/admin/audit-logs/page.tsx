'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Search, ArrowLeft, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getAuditLogs } from '@/services/admin/admin';
import { AuditLog } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default function AdminAuditLogsPage() {
  const { user, role, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
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

  if (!user || role !== 'administrator') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Unauthorized Access</h2>
        <p className="text-xs text-slate-500">Administrator privileges required.</p>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.entity_type.toLowerCase().includes(term) ||
      log.user?.full_name.toLowerCase().includes(term) ||
      log.user?.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">System Security Audit Logs</h1>
        <p className="text-xs text-slate-500">
          Permanent immutable record of municipal grievance transitions, assignments, and administrative actions.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Audit Trail ({logs.length})</CardTitle>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="Search action or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-200 w-52 sm:w-64"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-xs">Loading audit trail...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={History}
                title="No Audit Records"
                description="No system security logs match your search."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Timestamp</th>
                    <th className="px-6 py-3 font-semibold">Action Trigger</th>
                    <th className="px-6 py-3 font-semibold">Authorized Agent</th>
                    <th className="px-6 py-3 font-semibold">Target Entity</th>
                    <th className="px-6 py-3 font-semibold">Metadata / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 whitespace-nowrap font-sans">
                        <span className="font-semibold block">{log.user?.full_name || 'System / Batch'}</span>
                        <span className="text-[10px] text-slate-400 block">{log.user?.role || 'authorized'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {log.entity_type}: {log.entity_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-sm">
                        <pre className="text-[10px] bg-slate-100 p-1.5 rounded overflow-x-auto max-h-16">
                          {JSON.stringify(log.metadata, null, 1)}
                        </pre>
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
