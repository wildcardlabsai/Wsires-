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
import type { WebsiteTemplateRow } from '@/types/database';

const NONE = '__none__';

export function TemplateControl({
  websiteId,
  templateId,
  templates,
}: {
  websiteId: string;
  templateId: string | null;
  templates: WebsiteTemplateRow[];
}) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState(false);

  async function update(value: string) {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/websites/${websiteId}/template`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: value === NONE ? null : value }),
      });
      if (!response.ok) {
        const result = await response.json();
        toast.error('Could not update template', result.error);
        return;
      }
      toast.success('Template updated');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Select value={templateId ?? NONE} onValueChange={update} disabled={updating}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="No template assigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No preference / unassigned</SelectItem>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
