/**
 * Assets de demonstração da home.
 * Imagens: Unsplash (licença gratuita). Vídeo: Mixkit (uso livre, sem atribuição).
 * URLs verificadas. Podem ser substituídas por assets próprios no futuro.
 */
const unsplash = (photo: string, w = 1200, extra = 'fit=crop') =>
  `https://images.unsplash.com/${photo}?auto=format&${extra}&w=${w}&q=80`;

// Vídeo ilustrativo de esporte (fundo do hero).
export const HERO_VIDEO = 'https://assets.mixkit.co/videos/40766/40766-360.mp4';
// Imagem "poster" exibida antes/caso o vídeo não carregue.
export const HERO_POSTER = unsplash('photo-1461896836934-ffe607ba8211', 1600);

// Fotos (retratos) para os cards de atletas em destaque.
export const ATHLETE_PHOTOS = [
  unsplash('photo-1727094141271-9bea5bc8c757', 640),
  unsplash('photo-1480179087180-d9f0ec044897', 640),
  unsplash('photo-1547941126-3d5322b218b0', 640),
  unsplash('photo-1571008887538-b36bb32f4571', 640),
];

// Imagens de apoio para faixas/CTA.
export const IMG_CTA = unsplash('photo-1594882645126-14020914d58d', 1400);
export const IMG_BAND = unsplash('photo-1581889470536-467bdbe30cd0', 1400);
