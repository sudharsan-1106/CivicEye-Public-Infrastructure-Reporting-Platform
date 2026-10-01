'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Notification } from '@/types/database';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notifications/notifications';
import { formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await getUserNotifications(user.id);
    setNotifications(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifs();

    // Supabase Realtime subscription for incoming notifications
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      const uniqueId = Math.random().toString(36).substring(2, 9) + '-' + Date.now();
      const channelName = `user-notif-${user.id}-${uniqueId}`;
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload?.new) {
              setNotifications((prev) => [payload.new as Notification, ...prev]);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime notification subscription warning:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-2 z-50 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium dark:text-sky-400"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center p-6 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !notif.is_read ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        title="Mark as read"
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 dark:text-slate-400 line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                    {notif.complaint_id && (
                      <Link
                        href={`/complaints/${notif.complaint_id}`}
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 dark:text-sky-400"
                      >
                        View Issue <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 p-2 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium dark:hover:text-slate-200"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
