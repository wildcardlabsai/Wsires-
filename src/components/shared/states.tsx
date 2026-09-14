import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Loader2, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  secondaryAction?: { label: string; href: string };
  className?: string;
  compact?: boolean;
}

/** Never show a blank screen — say what goes here and how to add it. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-charcoal-200 bg-cream-100/60 px-6 text-center',
        compact ? 'py-10' : 'py-16',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-subtle ring-1 ring-border">
          <Icon className="h-5 w-5 text-charcoal-400" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-semibold text-charcoal-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-charcoal-500">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {action &&
            (action.href ? (
              <Button asChild size="sm">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          {secondaryAction && (
            <Button asChild size="sm" variant="outline">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Error state                                                         */
/* ------------------------------------------------------------------ */

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryHref?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this just now. Please try again — if it keeps happening, get in touch and we’ll look into it.',
  onRetry,
  retryHref,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/70 px-6 py-12 text-center',
        className,
      )}
      role="alert"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-subtle ring-1 ring-red-200">
        <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-red-800/80">{description}</p>
      {(onRetry || retryHref) && (
        <div className="mt-6">
          {onRetry ? (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href={retryHref!}>Try again</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading states                                                      */
/* ------------------------------------------------------------------ */

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-16 text-sm text-charcoal-500', className)}>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span role="status">{label}</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: columns }).map((__, j) => (
            <Skeleton key={j} className={cn('h-12', j === 0 ? 'w-1/3' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-3 h-3 w-full" />
        </Card>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-16" />
        </Card>
      ))}
    </div>
  );
}
