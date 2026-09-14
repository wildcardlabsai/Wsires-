'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { WEBSITE_STATUS_OPTIONS } from '@/lib/status';
import type { WebsiteStatus } from '@/types/database';

export function WebsiteStatusControl({ websiteId, status }: { websiteId: string; status: WebsiteStatus }) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState(false);

  async function updateStatus(next: string) {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/websites/${websiteId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, notifyCustomer: true }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error('Could not update status', result.error);
        return;
      }
      toast.success('Status updated', 'The customer has been notified where appropriate.');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Select value={status} onValueChange={updateStatus} disabled={updating}>
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {WEBSITE_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
