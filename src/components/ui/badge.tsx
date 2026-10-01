import * as React from 'react';
import { cn, getStatusBadgeStyle, getPriorityBadgeStyle } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'status' | 'priority' | 'default' | 'outline' | 'subtle';
  value?: string;
}

export function Badge({ className, variant = 'default', value, children, ...props }: BadgeProps) {
  let variantStyles = 'bg-slate-100 text-slate-800 border-slate-200';

  if (variant === 'status' && value) {
    variantStyles = getStatusBadgeStyle(value);
  } else if (variant === 'priority' && value) {
    variantStyles = getPriorityBadgeStyle(value);
  } else if (variant === 'outline') {
    variantStyles = 'bg-transparent border-slate-300 text-slate-700 dark:text-slate-300 dark:border-slate-700';
  } else if (variant === 'subtle') {
    variantStyles = 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
        variantStyles,
        className
      )}
      {...props}
    >
      {children || value}
    </span>
  );
}
