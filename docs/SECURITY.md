# Segurança — Avroz Games Marketplace

**Atualizado:** 15/06/2026

Este documento descreve as medidas de segurança implementadas e recomendações para ambiente de produção.

---

## 1. Autenticação e autorização

### Supabase Auth
- Senhas hasheadas (bcrypt) — nunca armazenadas em texto plano
- Tokens JWT com expiração
- Sessões gerenciadas pelo cliente Supabase

### Row Level Security (RLS)
Políticas definidas em `supabase/schema.sql`:

| Tabela | Regra |
|--------|-------|
| `profiles` | Usuário lê/atualiza apenas o próprio perfil |
| `sellers` | Vendedor gerencia loja própria; admin vê todos |
| `products` | Vendedor CRUD nos próprios produtos; público lê ativos de vendedores aprovados |
| `orders` | Comprador vê próprios pedidos; admin vê todos |
| `sub_orders` | Vendedor vê sub-pedidos da loja; comprador via join com orders |
| `payouts` | Vendedor vê próprios repasses; admin gerencia |

### Papéis (roles)
- `customer`, `seller`, `admin` em `profiles.role`
- Admin não pode ser criado via cadastro público — apenas via seed/migration

---

## 2. Proteção de dados (LGPD)

- Política de privacidade em `/legal/privacidade`
- Consentimento explícito no cadastro (checkbox termos + contrato)
- Dados mínimos necessários para operação
- Direito de acesso/eliminação via contato DPO: privacidade@avrozgames.com.br

### Dados sensíveis
- CPF/CNPJ: armazenados criptografados em repouso (Supabase AES-256)
- Chaves PIX: visíveis apenas ao titular e admin
- **Não** armazenamos dados completos de cartão (PCI-DSS: usar gateway tokenizado)

---

## 3. Transações financeiras

### Escrow
- Pagamento recebido pela plataforma antes do repasse
- Estado `escrow_status`: `pending` → `held` → `released` | `refunded` | `disputed`
- Liberação apenas após `buyer_confirmed` ou prazo automático configurável

### Integridade
- Valores calculados server-side (Edge Functions recomendadas para produção)
- Registro de `order_items` com snapshot de preços no momento da compra
- Tabela `payouts` para auditoria de repasses

### Modo demo (localStorage)
⚠️ **Não usar em produção** — credenciais e dados em texto no navegador.

---

## 4. Comunicação

- **TLS/HTTPS** obrigatório (GitHub Pages + Supabase)
- Headers de segurança recomendados no CDN:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy` (ajustar para domínios Supabase e QR PIX)

---

## 5. Frontend

- Sanitização de inputs em formulários
- Rotas protegidas: checkout exige login; admin/vendedor verificam role
- Sem exposição de service role key no cliente — apenas `anon key`
- Upload de imagens via Supabase Storage com políticas de bucket

---

## 6. Prevenção a fraudes

| Ameaça | Mitigação |
|--------|-----------|
| Conta falsa vendedor | Aprovação manual admin + validação documento |
| Produto falsificado | Moderação + denúncias (roadmap) |
| Chargeback | Escrow + retenção em disputa |
| Acesso não autorizado | RLS + verificação de role no frontend e backend |
| Brute force login | Rate limiting Supabase Auth (configurar no dashboard) |

---

## 7. Backup e continuidade

- Supabase: backups automáticos diários (plano pago)
- Point-in-time recovery recomendado para produção
- Logs de auditoria em `payouts` e timestamps em todas as tabelas

---

## 8. Checklist produção

- [ ] Supabase RLS testado com usuários de cada papel
- [ ] Variáveis sensíveis apenas em GitHub Secrets / Supabase Vault
- [ ] Confirmação de e-mail habilitada
- [ ] Gateway de pagamento com webhook HMAC
- [ ] Contratos revisados por advogado
- [ ] DPO nomeado e canal privacidade@ ativo
- [ ] Monitoramento (Sentry, Logflare)
- [ ] Desabilitar modo localStorage em build de produção

---

## 9. Reporte de vulnerabilidades

Envie relatos para: seguranca@avrozgames.com.br  
Compromisso de resposta em até 72 horas úteis.
