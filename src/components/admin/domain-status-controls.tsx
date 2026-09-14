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
import type { DnsStatus, DomainStatus, SslStatus } from '@/types/database';

const STATUSES: DomainStatus[] = ['pending', 'connected', 'verified', 'live', 'failed'];
const DNS_STATUSES: DnsStatus[] = ['pending', 'propagating', 'verified', 'failed'];
const SSL_STATUSES: SslStatus[] = ['pending', 'issuing', 'active', 'failed'];

export function DomainStatusControls({
  domainId,
  status,
  dnsStatus,
  sslStatus,
}: {
  domainId: string;
  status: DomainStatus;
  dnsStatus: DnsStatus;
  sslStatus: SslStatus;
}) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState(false);

  async function update(field: 'status' | 'dnsStatus' | 'sslStatus', value: string) {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error('Could not update', result.error);
        return;
      }
      toast.success('Domain updated');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(v) => update('status', v)} disabled={updating}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={dnsStatus} onValueChange={(v) => update('dnsStatus', v)} disabled={updating}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DNS_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              DNS: {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sslStatus} onValueChange={(v) => update('sslStatus', v)} disabled={updating}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SSL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              SSL: {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
