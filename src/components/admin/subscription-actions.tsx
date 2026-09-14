'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

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
import { toast } from '@/components/ui/use-toast';

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function cancel() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        toast.error('Could not cancel subscription', result.error);
        return;
      }
      toast.success('Subscription cancelled');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-destructive hover:bg-red-50">
          <XCircle className="h-3.5 w-3.5" /> Cancel subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this subscription?</DialogTitle>
          <DialogDescription>
            This ends billing immediately. The customer will be notified by email.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep subscription
          </Button>
          <Button variant="destructive" onClick={cancel} loading={loading} loadingText="Cancelling…">
            Cancel subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
