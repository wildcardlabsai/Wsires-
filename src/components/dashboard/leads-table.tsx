'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { LEAD_STATUS } from '@/lib/status';
import { formatRelative } from '@/lib/utils';
import { telHref } from '@/lib/utils';
import type { LeadRow, LeadStatus } from '@/types/database';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost'];

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState<string | null>(null);

  async function updateStatus(id: string, status: LeadStatus) {
    setUpdating(id);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const result = await response.json();
        toast.error('Could not update', result.error);
        return;
      }
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-subtle">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium text-charcoal-900">{lead.name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-cymru-700">
                      <Mail className="h-3 w-3" /> {lead.email}
                    </a>
                  )}
                  {lead.phone && (
                    <a href={telHref(lead.phone) ?? '#'} className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-cymru-700">
                      <Phone className="h-3 w-3" /> {lead.phone}
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="line-clamp-2 text-sm text-charcoal-600">{lead.message}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-charcoal-500">{formatRelative(lead.created_at)}</TableCell>
              <TableCell>
                <Select
                  value={lead.status}
                  onValueChange={(value) => updateStatus(lead.id, value as LeadStatus)}
                  disabled={updating === lead.id}
                >
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue>
                      <Badge variant={LEAD_STATUS[lead.status].variant} size="sm">
                        {LEAD_STATUS[lead.status].label}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {LEAD_STATUS[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
