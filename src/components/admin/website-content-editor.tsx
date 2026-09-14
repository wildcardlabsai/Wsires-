'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Languages } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import type { WebsiteContentRow } from '@/types/database';

/**
 * Lets an admin author the Welsh (`cy`) version of one content section on a
 * bilingual website, by editing its data as JSON — mirroring the English
 * version's shape so the same section renderer displays it correctly.
 */
export function WelshContentEditor({
  websiteId,
  enSection,
  cySection,
}: {
  websiteId: string;
  enSection: WebsiteContentRow;
  cySection?: WebsiteContentRow;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(() => JSON.stringify(cySection?.data ?? enSection.data, null, 2));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setText(JSON.stringify(cySection?.data ?? enSection.data, null, 2));
  }, [open, cySection, enSection]);

  async function save() {
    setError(null);
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(text);
    } catch {
      setError('That isn’t valid JSON — check for a missing comma or bracket.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/websites/${websiteId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: enSection.page_id,
          sectionKey: enSection.section_key,
          sectionType: enSection.section_type,
          locale: 'cy',
          data: parsedData,
          sortOrder: enSection.sort_order,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save.');
        return;
      }
      toast.success('Welsh content saved');
      setOpen(false);
      router.refresh();
    } catch {
      setError('We couldn’t reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Languages className="h-3.5 w-3.5" />
          Welsh {cySection ? 'content' : '— not added'}
          {cySection && (
            <Badge variant="success" size="sm" className="ml-1">
              <Check className="h-2.5 w-2.5" />
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Welsh content — {enSection.section_key}</DialogTitle>
          <DialogDescription>
            Match the field names used in the English version below. Leave fields the same shape — only translate
            the text values.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-charcoal-400">English (reference)</p>
            <Textarea value={JSON.stringify(enSection.data, null, 2)} readOnly rows={12} className="bg-charcoal-50 font-mono text-xs" />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-charcoal-400">Welsh</p>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="font-mono text-xs" spellCheck={false} />
          </div>
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} loadingText="Saving…">
            Save Welsh content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
