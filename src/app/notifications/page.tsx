'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notifications/notifications';
import { Notification } from '@/types/database';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getUserNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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
        <h2 className="text-xl font-bold">Please Sign In</h2>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifs = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500">
            Real-time updates regarding your filed complaints, verification status, and engineer progress.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Bell}
                title="No Notifications"
                description={
                  filter === 'unread'
                    ? "You've read all your notifications!"
                    : 'You will receive notifications whenever your complaint status changes or an engineer is assigned.'
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !item.is_read
                      ? 'bg-sky-50/40 dark:bg-sky-950/20'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {formatDate(item.created_at)} ({formatRelativeTime(item.created_at)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!item.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Mark read
                      </Button>
                    )}
                    {item.complaint_id && (
                      <Link href={`/complaints/${item.complaint_id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Grievance <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
