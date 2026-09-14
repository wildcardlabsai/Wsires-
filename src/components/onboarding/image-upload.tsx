'use client';

import * as React from 'react';
import Image from 'next/image';
import { Loader2, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  kind: 'logo' | 'photo' | 'gallery';
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label: string;
  hint?: string;
}

export function ImageUpload({ kind, value, onChange, multiple = false, label, hint }: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);

      try {
        const response = await fetch('/api/media/upload', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) {
          toast.error('Upload failed', result.error ?? `Couldn’t upload ${file.name}.`);
          continue;
        }
        if (result.data.media.public_url) uploaded.push(result.data.media.public_url);
      } catch {
        toast.error('Upload failed', `Couldn’t reach the server while uploading ${file.name}.`);
      }
    }

    onChange(multiple ? [...value, ...uploaded] : uploaded.length > 0 ? [uploaded[0]!] : value);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function remove(url: string) {
    onChange(value.filter((v) => v !== url));
  }

  return (
    <div>
      <p className="text-sm font-medium text-charcoal-800">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-charcoal-500">{hint}</p>}

      <div className={cn('mt-3 grid gap-3', multiple ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1')}>
        {value.map((url) => (
          <div
            key={url}
            className={cn(
              'group relative overflow-hidden rounded-lg border border-border bg-white',
              multiple ? 'aspect-square' : 'flex h-28 items-center justify-center p-4',
            )}
          >
            <Image
              src={url}
              alt=""
              fill={multiple}
              width={multiple ? undefined : 160}
              height={multiple ? undefined : 80}
              className={multiple ? 'object-cover' : 'max-h-20 w-auto object-contain'}
              unoptimized
            />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-charcoal-300 bg-cream-100/60 text-charcoal-500 transition-colors hover:border-charcoal-400 hover:text-charcoal-700',
              multiple ? 'aspect-square' : 'h-28',
            )}
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Upload'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
