import * as React from 'react';
import Link from 'next/link';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200/90 bg-white/70 backdrop-blur-sm shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 ring-8 ring-sky-50/60 dark:ring-sky-950/20 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1.5 mb-6 leading-relaxed dark:text-slate-400">{description}</p>
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button size="sm" variant="primary" className="shadow-xs shadow-sky-500/20">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="primary" onClick={onAction} className="shadow-xs shadow-sky-500/20">
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
