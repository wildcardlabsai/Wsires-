'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Send } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TICKET_STATUS } from '@/lib/status';
import { cn, formatDateTime, initials } from '@/lib/utils';
import type { SupportMessageRow, TicketStatus } from '@/types/database';

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting_for_customer', 'resolved'];

export function AdminTicketThread({
  ticketId,
  messages,
  status,
}: {
  ticketId: string;
  messages: SupportMessageRow[];
  status: TicketStatus;
}) {
  const router = useRouter();
  const [body, setBody] = React.useState('');
  const [isInternal, setIsInternal] = React.useState(false);
  const [nextStatus, setNextStatus] = React.useState<TicketStatus>(status);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, isInternal, status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not send reply.');
        return;
      }
      setBody('');
      router.refresh();
    } catch {
      setError('We couldn’t reach the server.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="space-y-5">
        {messages.map((message) => {
          const isAdmin = message.author_role === 'admin';
          return (
            <div key={message.id} className={cn('flex gap-3', isAdmin && 'flex-row-reverse')}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={isAdmin ? 'bg-cymru-600' : undefined}>{initials(message.author_name)}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'max-w-[80%] rounded-xl px-4 py-3',
                  message.is_internal ? 'bg-amber-50' : isAdmin ? 'bg-cymru-50' : 'bg-cream-100',
                )}
              >
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-charcoal-800">{message.author_name ?? (isAdmin ? 'Admin' : 'Customer')}</p>
                  {message.is_internal && (
                    <span className="inline-flex items-center gap-1 text-[0.625rem] font-medium uppercase tracking-wide text-amber-700">
                      <Lock className="h-2.5 w-2.5" /> Internal
                    </span>
                  )}
                  <p className="text-[0.6875rem] text-charcoal-400">{formatDateTime(message.created_at)}</p>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-charcoal-700">{message.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-5">
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply…" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="internal" checked={isInternal} onCheckedChange={(c) => setIsInternal(Boolean(c))} />
            <Label htmlFor="internal" className="text-sm font-normal text-charcoal-600">
              Internal note (not sent to customer)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as TicketStatus)}>
              <SelectTrigger className="h-9 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {TICKET_STATUS[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={send} loading={sending} loadingText="Sending…" disabled={!body.trim()}>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
