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
import type { SiteLanguageMode } from '@/types/database';

export function LanguageModeControl({ websiteId, languageMode }: { websiteId: string; languageMode: SiteLanguageMode }) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState(false);

  async function update(next: string) {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/websites/${websiteId}/language`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageMode: next }),
      });
      if (!response.ok) {
        const result = await response.json();
        toast.error('Could not update', result.error);
        return;
      }
      toast.success('Language updated');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Select value={languageMode} onValueChange={update} disabled={updating}>
      <SelectTrigger className="h-8 w-40 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English only</SelectItem>
        <SelectItem value="cy">Welsh only</SelectItem>
        <SelectItem value="bilingual">Bilingual (EN/CY)</SelectItem>
      </SelectContent>
    </Select>
  );
}
