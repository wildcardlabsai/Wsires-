'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Mail, Pencil, PlayCircle, StickyNote } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import type { CustomerRow, CustomerStatus, PlanRow } from '@/types/database';

export function EditCustomerDialog({ customer, plans }: { customer: CustomerRow; plans: PlanRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    businessName: customer.business_name,
    contactName: customer.contact_name ?? '',
    email: customer.email,
    phone: customer.phone ?? '',
    planId: customer.plan_id ?? 'none',
    status: customer.status as CustomerStatus,
  });

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, planId: form.planId === 'none' ? null : form.planId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save changes.');
        return;
      }
      toast.success('Customer updated');
      setOpen(false);
      router.refresh();
    } catch {
      setError('We couldn’t reach the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormError message={error} />
          <Field label="Business name" htmlFor="businessName">
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </Field>
          <Field label="Contact name" htmlFor="contactName">
            <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" htmlFor="email">
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plan" htmlFor="planId">
              <Select value={form.planId} onValueChange={(v) => setForm({ ...form, planId: v })}>
                <SelectTrigger id="planId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No plan</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status" htmlFor="status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CustomerStatus })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={loading} loadingText="Saving…">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SuspendReactivateButton({ customerId, status }: { customerId: string; status: CustomerStatus }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const suspended = status === 'suspended';

  async function toggle() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/${suspended ? 'reactivate' : 'suspend'}`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error('Action failed', result.error);
        return;
      }
      toast.success(suspended ? 'Account reactivated' : 'Account suspended');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant={suspended ? 'accent' : 'outline'} onClick={toggle} loading={loading}>
      {suspended ? <PlayCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
      {suspended ? 'Reactivate' : 'Suspend'}
    </Button>
  );
}

export function SendEmailDialog({ customerId }: { customerId: string }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not send email.');
        return;
      }
      toast.success('Email sent');
      setOpen(false);
      setSubject('');
      setMessage('');
    } catch {
      setError('We couldn’t reach the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Mail className="h-3.5 w-3.5" /> Send email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send an email</DialogTitle>
          <DialogDescription>Sent directly to this customer, branded as CymruSites.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormError message={error} />
          <Field label="Subject" htmlFor="subject">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Message" htmlFor="message">
            <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={loading} loadingText="Sending…" disabled={!subject || message.length < 10}>
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddNoteForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [body, setBody] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function submit() {
    if (!body.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!response.ok) {
        const result = await response.json();
        toast.error('Could not save note', result.error);
        return;
      }
      setBody('');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Textarea
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a private note about this customer…"
        className="flex-1"
      />
      <Button onClick={submit} loading={loading} disabled={!body.trim()}>
        <StickyNote className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
}
