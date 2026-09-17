'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import type { ChangeRequestStatus } from '@/types/database';

async function review(id: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/admin/change-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? 'Could not update that request.');
}

export function ChangeRequestActions({ requestId, status }: { requestId: string; status: ChangeRequestStatus }) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [loading, setLoading] = React.useState<string | null>(null);

  async function run(action: string, body: Record<string, unknown>) {
    setLoading(action);
    try {
      await review(requestId, body);
      toast.success('Updated');
      router.refresh();
      setRejectOpen(false);
    } catch (error) {
      toast.error('Could not update', error instanceof Error ? error.message : undefined);
    } finally {
      setLoading(null);
    }
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => run('approve', { action: 'approve' })} loading={loading === 'approve'}>
          <Check className="h-3.5 w-3.5" /> Approve
        </Button>
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject this request?</DialogTitle>
            </DialogHeader>
            <Textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why isn't this going ahead? (visible to your team only, for now)"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => run('reject', { action: 'reject', adminNotes: rejectReason || undefined })}
                loading={loading === 'reject'}
              >
                Reject request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <Button size="sm" variant="accent" onClick={() => run('applied', { action: 'applied' })} loading={loading === 'applied'}>
        <CheckCheck className="h-3.5 w-3.5" /> Mark as done
      </Button>
    );
  }

  return null;
}
