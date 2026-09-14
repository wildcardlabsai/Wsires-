'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Upload } from 'lucide-react';

import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';
import type { MediaRow } from '@/types/database';
import { ImageIcon } from 'lucide-react';

export function MediaLibrary({ initialMedia }: { initialMedia: MediaRow[] }) {
  const router = useRouter();
  const [media, setMedia] = React.useState(initialMedia);
  const [uploading, setUploading] = React.useState(false);
  const [kind, setKind] = React.useState<'photo' | 'gallery'>('photo');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);

      try {
        const response = await fetch('/api/media/upload', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) {
          toast.error('Upload failed', result.error ?? `Couldn’t upload ${file.name}`);
          continue;
        }
        setMedia((prev) => [result.data.media, ...prev]);
      } catch {
        toast.error('Upload failed', 'Couldn’t reach the server.');
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        toast.error('Could not delete', result.error);
        return;
      }
      setMedia((prev) => prev.filter((m) => m.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="gallery">Gallery image</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => inputRef.current?.click()} loading={uploading} loadingText="Uploading…">
          <Upload className="h-4 w-4" />
          Upload files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {media.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          className="mt-6"
          title="No media uploaded"
          description="Upload photos of your work, your team or your premises. They can be used in your gallery and around your website."
          action={{ label: 'Upload files', onClick: () => inputRef.current?.click() }}
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border border-border bg-white">
              <div className="relative aspect-square">
                {item.public_url ? (
                  <Image src={item.public_url} alt={item.alt_text ?? ''} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center bg-charcoal-50 text-charcoal-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${item.file_name}`}
                >
                  {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-charcoal-700">{item.file_name}</p>
                <p className="text-[0.6875rem] text-charcoal-400">{formatDate(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
