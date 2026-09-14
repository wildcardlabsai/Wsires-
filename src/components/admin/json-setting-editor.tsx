'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Pencil } from 'lucide-react';

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

/**
 * Edits one `settings` row as raw JSON.
 *
 * Deliberately not a bespoke form per content type: the marketing content
 * tree (testimonials, FAQs, industries, portfolio…) is nested and varied
 * enough that a validated JSON editor covers every field honestly, without
 * hand-building a dozen different form layouts that would drift from the
 * underlying shape. Non-technical edits (pricing, individual FAQ answers)
 * are still just editing text inside familiar `"key": "value"` pairs.
 */
export function JsonSettingEditor({
  settingKey,
  label,
  description,
  value,
  groupName = 'content',
}: {
  settingKey: string;
  label: string;
  description?: string;
  value: unknown;
  groupName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setText(JSON.stringify(value, null, 2));
  }, [open, value]);

  async function save() {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError('That isn’t valid JSON — check for a missing comma or bracket.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value: parsed, groupName }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save.');
        return;
      }
      toast.success('Saved', `${label} has been updated.`);
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
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          className="font-mono text-xs"
          spellCheck={false}
        />
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} loadingText="Saving…">
            <Check className="h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
