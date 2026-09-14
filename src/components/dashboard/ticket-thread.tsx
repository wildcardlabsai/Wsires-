'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime, initials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SupportMessageRow } from '@/types/database';

export function TicketThread({ ticketId, messages }: { ticketId: string; messages: SupportMessageRow[] }) {
  const router = useRouter();
  const [body, setBody] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function send() {
    if (body.trim().length === 0) return;
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not send your reply.');
        return;
      }
      setBody('');
      router.refresh();
    } catch {
      setError('We couldn’t reach the server. Please try again.');
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
                <AvatarFallback className={isAdmin ? 'bg-cymru-600' : undefined}>
                  {initials(message.author_name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn('max-w-[80%] rounded-xl px-4 py-3', isAdmin ? 'bg-cymru-50' : 'bg-cream-100')}>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-charcoal-800">
                    {message.author_name ?? (isAdmin ? 'CymruSites' : 'You')}
                  </p>
                  <p className="text-[0.6875rem] text-charcoal-400">{formatDateTime(message.created_at)}</p>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-charcoal-700">{message.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-border pt-5">
        {error && <p className="mb-2 text-sm font-medium text-destructive">{error}</p>}
        <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply…" />
        <div className="mt-3 flex justify-end">
          <Button onClick={send} loading={sending} loadingText="Sending…" disabled={body.trim().length === 0}>
            <Send className="h-4 w-4" />
            Send reply
          </Button>
        </div>
      </div>
    </div>
  );
}
