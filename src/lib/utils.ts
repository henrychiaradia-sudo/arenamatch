import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Mescla classes do Tailwind de forma segura (resolve conflitos). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Gera as iniciais de um nome para avatares de fallback. */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Cria um slug URL-safe a partir de um texto (remove acentos). */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Restringe um número a um intervalo. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
