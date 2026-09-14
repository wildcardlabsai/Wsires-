'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

export function AdminAllowlistEditor({ emails }: { emails: string[] }) {
  const router = useRouter();
  const [list, setList] = React.useState(emails);
  const [input, setInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function persist(next: string[]) {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'admin_email_allowlist', value: next, groupName: 'private' }),
      });
      if (!response.ok) {
        const result = await response.json();
        toast.error('Could not save', result.error);
        return;
      }
      setList(next);
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  function add() {
    const value = input.trim().toLowerCase();
    if (!value || list.includes(value)) return;
    persist([...list, value]);
    setInput('');
  }

  function remove(email: string) {
    persist(list.filter((e) => e !== email));
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="admin@cymrusites.co.uk"
          disabled={saving}
        />
        <Button type="button" variant="outline" onClick={add} disabled={saving}>
          Add
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-charcoal-500">
          No admin emails configured — new signups always become customers. Add an address below to have that
          person become an admin automatically when they sign up.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {list.map((email) => (
            <li key={email} className="flex items-center justify-between rounded-md bg-cream-100 px-3 py-2 text-sm">
              {email}
              <button type="button" onClick={() => remove(email)} className="text-charcoal-400 hover:text-destructive" disabled={saving}>
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
