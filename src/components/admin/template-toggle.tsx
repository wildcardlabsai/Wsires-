'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

export function TemplateActiveToggle({ templateId, isActive }: { templateId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function toggle(checked: boolean) {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: checked }),
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
      setLoading(false);
    }
  }

  return <Switch checked={isActive} onCheckedChange={toggle} disabled={loading} />;
}
