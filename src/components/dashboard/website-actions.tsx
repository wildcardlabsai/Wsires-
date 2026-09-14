'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, MessageSquareText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

export function ApproveButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function approve() {
    setLoading(true);
    try {
      const response = await fetch('/api/website/approve', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        toast.error('Could not approve', result.error);
        return;
      }
      toast.success('Website approved', 'We’re getting your domain connected next.');
      router.refresh();
    } catch {
      toast.error('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={approve} loading={loading} loadingText="Approving…">
      <CheckCircle2 className="h-4 w-4" />
      Approve this website
    </Button>
  );
}

export function RequestChangesButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/website/request-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not submit your request.');
        return;
      }
      toast.success('Changes requested', 'We’ll work through this and update you.');
      setOpen(false);
      setSummary('');
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
        <Button variant="outline">
          <MessageSquareText className="h-4 w-4" />
          Request changes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What would you like changed?</DialogTitle>
          <DialogDescription>
            Be as specific as you can — page, section and what you’d like it to say instead.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={6}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="On the homepage, please change the opening hours to 8am–6pm Monday to Friday, and add a photo of the new van to the gallery…"
        />
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={loading} loadingText="Sending…" disabled={summary.trim().length < 10}>
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
