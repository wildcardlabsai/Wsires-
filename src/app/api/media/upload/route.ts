import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  ALLOWED_ATTACHMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  validateUpload,
} from '@/lib/validation/schemas';

/**
 * File upload for logos, photos and support attachments.
 *
 * Accepts multipart/form-data with `file`, and an optional `kind`
 * (logo | photo | gallery | attachment) and `websiteId`. Files are stored
 * under `<customerId>/<uuid>-<filename>` so storage policies (which check
 * the first path segment against the caller's customer id) apply cleanly.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const { actor, customer } = await requireApiCustomer();

    const ip = clientIp(request);
    const limit = checkRateLimit(`upload:${customer.id}:${ip}`, { limit: 30, windowMs: 10 * 60_000 });
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many uploads — please slow down a moment.' }, { status: 429 });
    }

    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const form = await request.formData();
    const file = form.get('file');
    const kind = String(form.get('kind') ?? 'photo');
    const websiteId = form.get('websiteId') ? String(form.get('websiteId')) : null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    const allowed = kind === 'attachment' ? ALLOWED_ATTACHMENT_TYPES : ALLOWED_IMAGE_TYPES;
    const validation = validateUpload(
      { name: file.name, type: file.type, size: file.size },
      { allowed, maxBytes: MAX_UPLOAD_BYTES },
    );
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const bucket = kind === 'logo' ? 'logos' : kind === 'attachment' ? 'attachments' : 'media';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
    const path = `${customer.id}/${crypto.randomUUID()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('[media upload] storage error', uploadError);
      return NextResponse.json({ error: 'Could not upload that file. Please try again.' }, { status: 500 });
    }

    let publicUrl: string | null = null;
    if (bucket !== 'attachments') {
      publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }

    const { data: media, error: insertError } = await supabase
      .from('media')
      .insert({
        customer_id: customer.id,
        website_id: websiteId,
        uploaded_by: actor.userId,
        bucket,
        storage_path: path,
        public_url: publicUrl,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        kind: kind as 'logo' | 'photo' | 'gallery' | 'attachment',
      })
      .select('*')
      .single();

    if (insertError || !media) {
      return NextResponse.json({ error: 'Uploaded, but we could not save the record.' }, { status: 500 });
    }

    return NextResponse.json({ data: { media } });
  });
}
