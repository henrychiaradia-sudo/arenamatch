'use client';

import * as React from 'react';

/**
 * Vídeo de fundo do hero. Renderiza no cliente para garantir muted+autoplay
 * de forma confiável. O `poster` (imagem) aparece imediatamente e permanece
 * caso o vídeo demore ou não carregue.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
