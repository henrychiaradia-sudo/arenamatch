import { test, expect } from '@playwright/test';

/**
 * Smoke tests dos fluxos públicos (não exigem banco populado).
 * Execute com: npm run test:e2e  (requer o app rodando / webServer configurado).
 */

test('home carrega e exibe a proposta de valor', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Cadastre-se/i }).first()).toBeVisible();
});

test('navegação para "Como funciona"', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Como funciona' }).first().click();
  await expect(page).toHaveURL(/\/como-funciona/);
});

test('explorar atletas mostra filtros', async ({ page }) => {
  await page.goto('/explorar/atletas');
  await expect(page.getByRole('button', { name: /Filtrar/i })).toBeVisible();
});

test('cadastro exibe seleção de papel', async ({ page }) => {
  await page.goto('/cadastro');
  await expect(page.getByText('Sou atleta')).toBeVisible();
  await expect(page.getByText('Represento uma empresa')).toBeVisible();
  await expect(page.getByText('Sou gestor de projeto')).toBeVisible();
});

test('rota protegida redireciona para /entrar', async ({ page }) => {
  await page.goto('/painel');
  await expect(page).toHaveURL(/\/entrar/);
});

/**
 * Fluxos autenticados (exigem seed + Supabase configurado). Ativar quando o
 * ambiente de teste tiver banco populado (senha demo: demo1234).
 *
 * Fluxo 1 — Atleta se cadastra, completa o perfil, encontra oportunidade e se candidata.
 * Fluxo 2 — Empresa se cadastra, publica oportunidade, encontra atleta e envia interesse.
 * Fluxo 3 — Atleta aceita conexão e inicia conversa.
 * Fluxo 4 — Empresa cria negociação e altera o pipeline.
 * Fluxo 5 — Administrador verifica um perfil.
 */
test.describe('Fluxos autenticados (requerem seed)', () => {
  test.skip(true, 'Habilitar com Supabase configurado e banco populado.');

  test('Fluxo 1 — atleta se candidata a uma oportunidade', async () => {
    // login como marina@demo.arenamatch.com → /explorar/oportunidades → candidatar-se
  });
});
