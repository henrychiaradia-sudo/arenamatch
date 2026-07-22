# Segurança e privacidade — ArenaMatch

## Princípios

- **Menor privilégio**: RLS habilitada em todas as tabelas; o cliente nunca é a
  fonte da verdade.
- **Validação dupla**: Zod no cliente e no servidor (Server Actions/handlers).
- **Segredos**: apenas variáveis de ambiente; **nenhuma chave secreta no
  frontend**. A `service_role` só é usada em código de servidor/scripts.

## Autenticação

- Supabase Auth (e-mail/senha), confirmação de e-mail, recuperação/redefinição.
- Proteção de rotas no `middleware.ts` + `requireSession`/`requireRole` nos
  Server Components.
- `getUser()` (revalida o token no servidor de auth) em vez de confiar apenas
  na sessão local.

## RLS (Row Level Security)

- Habilitada em 100% das tabelas do schema `public`.
- Políticas por papel e por posse; funções `SECURITY DEFINER` (`is_admin`,
  `owns_company`, `are_connected`, `is_conversation_member`) previnem recursão.
- Dados sensíveis (mensagens, favoritos, negociações, documentos) restritos às
  partes envolvidas e a administradores.

## Documentos privados

- Buckets `documents` e `evidence` são **privados**. O acesso ocorre apenas por
  **URLs assinadas com expiração** — nunca por URL pública permanente.
- Upload restrito à pasta do próprio usuário (`"<user_id>/..."`).
- Validar tipo e tamanho de arquivo no cliente e no servidor. **Não** permitir
  anexos executáveis.

## Boas práticas aplicadas

- Sanitização e validação de entradas (Zod).
- `poweredByHeader: false`.
- Trilha de **auditoria** (`audit_logs`) para ações administrativas.
- Tratamento de erros sem vazar detalhes internos.
- *Rate limiting* recomendado na borda (Vercel/edge) — fase futura.

## Criar um administrador

O papel `admin` não é selecionável no cadastro público. Para promover um
usuário existente (via SQL, com a service role ou no SQL Editor do Supabase):

```sql
update public.profiles set role = 'admin' where id = '<user_uuid>';
```

## Notas do MVP (a endurecer para produção)

- **Notificações**: a política RLS de inserção em `notifications` permite que
  qualquer usuário autenticado crie uma notificação (necessário para notificar a
  outra parte em interesse/mensagem, já que os fluxos são disparados pelo
  servidor). Endurecimento recomendado: mover a criação para uma função
  `SECURITY DEFINER` dedicada ou para a `service_role`.
- **E-mail**: `src/lib/email.ts` define a interface de envio (desativada por
  padrão). Notificações por e-mail são um ponto de integração futuro.
- **Bloqueio de usuários** e **assinatura eletrônica** seguem no roadmap.

## LGPD e privacidade

- **Consentimento** registrado: `terms_versions` + `terms_acceptances` (data,
  versão, IP).
- **Campos públicos vs. privados**: perfis expõem apenas dados públicos;
  documentos e dados sensíveis são restritos.
- **Direitos do titular**: exclusão de conta (soft delete + fluxo) e exportação
  de dados (prevista no roadmap).
- **Bloqueio e denúncia**: `reports` + bloqueio de usuários.

> ⚠️ Os textos de Termos e Privacidade são **demonstrativos** e devem ser
> revisados por profissionais especializados antes de uso em produção. Nenhuma
> conformidade jurídica é garantida automaticamente.
