'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Field } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StepProps } from '../wizard-context';

export function StepContent({ draft, update, errors }: StepProps) {
  return (
    <div className="space-y-10">
      <Field
        label="About your business"
        htmlFor="aboutText"
        error={errors.aboutText}
        hint="Leave blank and we’ll write a first draft from your business description for you to review."
      >
        <Textarea
          rows={5}
          value={draft.aboutText}
          onChange={(e) => update({ aboutText: e.target.value })}
          placeholder="Started in 2015, we've grown from a one-van operation to a team of four fully qualified engineers…"
        />
      </Field>

      <TeamSection draft={draft} update={update} />
      <TestimonialsSection draft={draft} update={update} />
      <FaqSection draft={draft} update={update} />
      <OpeningHoursSection draft={draft} update={update} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="WhatsApp number"
          htmlFor="whatsappNumber"
          error={errors.whatsappNumber}
          hint="Leave blank to use your main phone number."
        >
          <Input value={draft.whatsappNumber} onChange={(e) => update({ whatsappNumber: e.target.value })} />
        </Field>
      </div>

      <div>
        <Label>Social media links</Label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Facebook URL"
            value={draft.socialLinks.facebook ?? ''}
            onChange={(e) => update({ socialLinks: { ...draft.socialLinks, facebook: e.target.value } })}
          />
          <Input
            placeholder="Instagram URL"
            value={draft.socialLinks.instagram ?? ''}
            onChange={(e) => update({ socialLinks: { ...draft.socialLinks, instagram: e.target.value } })}
          />
        </div>
      </div>
    </div>
  );
}

function TeamSection({ draft, update }: Pick<StepProps, 'draft' | 'update'>) {
  const add = () => update({ teamMembers: [...draft.teamMembers, { name: '', role: '', bio: '' }] });
  const set = (i: number, patch: Partial<(typeof draft.teamMembers)[number]>) => {
    const next = [...draft.teamMembers];
    next[i] = { ...next[i]!, ...patch };
    update({ teamMembers: next });
  };
  const remove = (i: number) => update({ teamMembers: draft.teamMembers.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>Team (optional)</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add person
        </Button>
      </div>
      {draft.teamMembers.length === 0 ? (
        <p className="mt-2 text-sm text-charcoal-500">Add the people customers might meet — optional.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {draft.teamMembers.map((member, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border bg-white p-4">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <Input placeholder="Name" value={member.name} onChange={(e) => set(i, { name: e.target.value })} />
                <Input placeholder="Role" value={member.role ?? ''} onChange={(e) => set(i, { role: e.target.value })} />
              </div>
              <button type="button" onClick={() => remove(i)} className="text-charcoal-300 hover:text-destructive" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialsSection({ draft, update }: Pick<StepProps, 'draft' | 'update'>) {
  const add = () => update({ testimonials: [...draft.testimonials, { quote: '', author: '', location: '' }] });
  const set = (i: number, patch: Partial<(typeof draft.testimonials)[number]>) => {
    const next = [...draft.testimonials];
    next[i] = { ...next[i]!, ...patch };
    update({ testimonials: next });
  };
  const remove = (i: number) => update({ testimonials: draft.testimonials.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>Testimonials (optional)</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add testimonial
        </Button>
      </div>
      {draft.testimonials.length === 0 ? (
        <p className="mt-2 text-sm text-charcoal-500">
          Got a review from a happy customer? Add it here — or send it to us later.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {draft.testimonials.map((testimonial, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <Textarea
                  rows={2}
                  placeholder="What did they say?"
                  value={testimonial.quote}
                  onChange={(e) => set(i, { quote: e.target.value })}
                  className="flex-1"
                />
                <button type="button" onClick={() => remove(i)} className="mt-1 text-charcoal-300 hover:text-destructive" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Input placeholder="Their name" value={testimonial.author} onChange={(e) => set(i, { author: e.target.value })} />
                <Input placeholder="Location (optional)" value={testimonial.location ?? ''} onChange={(e) => set(i, { location: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FaqSection({ draft, update }: Pick<StepProps, 'draft' | 'update'>) {
  const add = () => update({ faqs: [...draft.faqs, { question: '', answer: '' }] });
  const set = (i: number, patch: Partial<(typeof draft.faqs)[number]>) => {
    const next = [...draft.faqs];
    next[i] = { ...next[i]!, ...patch };
    update({ faqs: next });
  };
  const remove = (i: number) => update({ faqs: draft.faqs.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>Frequently asked questions (optional)</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add question
        </Button>
      </div>
      {draft.faqs.length === 0 ? (
        <p className="mt-2 text-sm text-charcoal-500">
          The questions you answer on the phone every week make a great FAQ page.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {draft.faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <Input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => set(i, { question: e.target.value })}
                  className="flex-1"
                />
                <button type="button" onClick={() => remove(i)} className="mt-1 text-charcoal-300 hover:text-destructive" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Textarea
                className="mt-2"
                rows={2}
                placeholder="Answer"
                value={faq.answer}
                onChange={(e) => set(i, { answer: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OpeningHoursSection({ draft, update }: Pick<StepProps, 'draft' | 'update'>) {
  const set = (i: number, patch: Partial<(typeof draft.openingHours)[number]>) => {
    const next = [...draft.openingHours];
    next[i] = { ...next[i]!, ...patch };
    update({ openingHours: next });
  };

  return (
    <div>
      <Label>Opening hours</Label>
      <div className="mt-3 space-y-2">
        {draft.openingHours.map((hours, i) => (
          <div key={hours.day} className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5">
            <span className="w-24 shrink-0 text-sm font-medium text-charcoal-800">{hours.day}</span>
            {hours.closed ? (
              <span className="flex-1 text-sm text-charcoal-400">Closed</span>
            ) : (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="time"
                  value={hours.opens ?? ''}
                  onChange={(e) => set(i, { opens: e.target.value })}
                  className="h-9 w-28"
                />
                <span className="text-charcoal-400">–</span>
                <Input
                  type="time"
                  value={hours.closes ?? ''}
                  onChange={(e) => set(i, { closes: e.target.value })}
                  className="h-9 w-28"
                />
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Checkbox
                id={`closed-${i}`}
                checked={hours.closed}
                onCheckedChange={(checked) => set(i, { closed: Boolean(checked) })}
              />
              <Label htmlFor={`closed-${i}`} className="text-xs font-normal text-charcoal-500">
                Closed
              </Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
