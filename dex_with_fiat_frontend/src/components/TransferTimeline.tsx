'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw, Loader2 } from 'lucide-react';

export type TransferStatus =
  | 'initiated'
  | 'pending'
  | 'success'
  | 'failed'
  | 'reversed';

export interface StatusEvent {
  status: TransferStatus;
  timestamp: Date;
  label?: string;
}

interface TransferTimelineProps {
  /** Ordered list of status transitions from oldest to newest */
  events: StatusEvent[];
  /** Whether a poll is currently in-flight */
  isPolling?: boolean;
}

const STATUS_META: Record<
  TransferStatus,
  { icon: React.ReactNode; color: string; defaultLabel: string }
> = {
  initiated: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-blue-400 border-blue-400 bg-blue-400/10',
    defaultLabel: 'Transfer initiated',
  },
  pending: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    color: 'text-amber-400 border-amber-400 bg-amber-400/10',
    defaultLabel: 'Pending bank processing',
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-400 border-green-400 bg-green-400/10',
    defaultLabel: 'Transfer successful',
  },
  failed: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-400 border-red-400 bg-red-400/10',
    defaultLabel: 'Transfer failed',
  },
  reversed: {
    icon: <RefreshCw className="w-4 h-4" />,
    color: 'text-purple-400 border-purple-400 bg-purple-400/10',
    defaultLabel: 'Transfer reversed',
  },
};

function formatEventTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * TransferTimeline — renders an ordered vertical timeline of payout status
 * transitions.  Each node shows a status icon, a human-readable label, and
 * the local timestamp of the transition.
 *
 * Usage:
 * ```tsx
 * <TransferTimeline
 *   events={[
 *     { status: 'initiated', timestamp: new Date() },
 *     { status: 'pending',   timestamp: new Date() },
 *   ]}
 *   isPolling
 * />
 * ```
 */
export default function TransferTimeline({
  events,
  isPolling = false,
}: TransferTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="theme-text-muted text-xs text-center py-4">
        No status events yet.
      </p>
    );
  }

  return (
    <div className="relative" aria-label="Transfer status timeline">
      {/* Vertical connector line */}
      <span
        className="absolute left-[19px] top-5 bottom-5 w-px bg-[var(--color-border)]"
        aria-hidden="true"
      />

      <ol className="space-y-4">
        {events.map((event, idx) => {
          const meta = STATUS_META[event.status];
          const isLast = idx === events.length - 1;

          return (
            <li key={`${event.status}-${idx}`} className="flex items-start gap-3">
              {/* Status icon badge */}
              <span
                className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center ${meta.color}`}
              >
                {meta.icon}
              </span>

              {/* Label + timestamp */}
              <div className={`flex-1 pb-1 ${isLast ? 'font-medium' : ''}`}>
                <p
                  className={`text-sm ${
                    isLast ? 'theme-text-primary' : 'theme-text-secondary'
                  }`}
                >
                  {event.label ?? meta.defaultLabel}
                </p>
                <p className="theme-text-muted text-[11px] mt-0.5">
                  {formatEventTime(event.timestamp)}
                </p>
              </div>
            </li>
          );
        })}

        {/* Live polling indicator appended after the last real event */}
        {isPolling && (
          <li className="flex items-start gap-3 opacity-60">
            <span className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full border border-dashed border-gray-500 flex items-center justify-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
            </span>
            <div className="flex-1 pb-1">
              <p className="theme-text-muted text-sm">Checking status…</p>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}
