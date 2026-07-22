'use client';

import * as React from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, cn } from '@/lib/utils';

type Result = { ok: boolean; error?: string };

interface ImageUploadProps {
  userId: string;
  bucket: 'avatars' | 'covers';
  kind: string;
  currentUrl: string | null;
  variant: 'avatar' | 'cover';
  fallbackText?: string;
  onSaved: (url: string) => Promise<Result>;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUpload({
  userId,
  bucket,
  kind,
  currentUrl,
  variant,
  fallbackText,
  onSaved,
}: ImageUploadProps) {
  const [url, setUrl] = React.useState<string | null>(currentUrl);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Envie um arquivo de imagem.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Imagem muito grande (máx. 5 MB).');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (upErr) {
        toast.error('Falha no upload', { description: upErr.message });
        return;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = data.publicUrl;
      const res = await onSaved(publicUrl);
      if (!res.ok) {
        toast.error('Não foi possível salvar', { description: res.error });
        return;
      }
      setUrl(publicUrl);
      toast.success('Imagem atualizada!');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={cn(variant === 'cover' && 'w-full')}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        aria-label="Enviar imagem"
      />
      {variant === 'avatar' ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative rounded-full"
          disabled={loading}
        >
          <Avatar className="h-24 w-24 border-4 border-background shadow">
            {url ? <AvatarImage src={url} alt="" /> : null}
            <AvatarFallback className="text-lg">{getInitials(fallbackText)}</AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/40 transition-colors hover:bg-muted"
          disabled={loading}
        >
          {url ? (
            <Image src={url} alt="" fill className="object-cover" sizes="100vw" />
          ) : (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" /> Enviar imagem de capa
            </span>
          )}
          {loading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
