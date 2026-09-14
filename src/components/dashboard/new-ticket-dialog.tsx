'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TICKET_CATEGORY_LABELS } from '@/lib/status';

const CATEGORIES = Object.keys(TICKET_CATEGORY_LABELS);

export function NewTicketDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [subject, setSubject] = React.useState('');
  const [category, setCategory] = React.useState('website_changes');
  const [message, setMessage] = React.useState('');

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, message }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not create your ticket.');
        return;
      }
      setOpen(false);
      setSubject('');
      setMessage('');
      router.push(`/dashboard/support/${result.data.ticket.id}`);
      router.refresh();
    } catch {
      setError('We couldn’t reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New support request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormError message={error} />
          <Field label="Subject" htmlFor="subject" required>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {TICKET_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Message" htmlFor="message" required>
            <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={loading} loadingText="Sending…" disabled={!subject || message.length < 10}>
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
