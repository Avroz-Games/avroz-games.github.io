# Avroz Games — Marketplace Multi-Vendedor

Marketplace estilo Mercado Livre para produtos gamer: vendedores independentes, **comissão 25%**, pagamento em **escrow** e painéis para comprador, vendedor e admin.

**Site:** https://avroz-games.github.io/  
**Repositório:** https://github.com/Avroz-Games/avroz-games.github.io

---

## Funcionalidades

### Comprador
- Cadastro/login, catálogo multi-vendedor, carrinho e checkout seguro
- PIX com desconto, frete Correios por vendedor
- Confirmação de recebimento libera repasse ao vendedor (escrow)

### Vendedor
- Cadastro de loja (aprovação admin), CRUD de produtos
- Painel de pedidos, rastreio e repasses

### Admin
- Dashboard, moderação de produtos, aprovação de vendedores
- Gestão de pedidos/escrow e configurações da plataforma

### Jurídico
- Termos, privacidade (LGPD), contratos comprador e vendedor em `/legal/*`

---

## Produção (deploy)

1. **Supabase:** execute `supabase/schema.sql` → `storage.sql` → `seed.sql`
2. **Secrets GitHub:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. **Deploy:** push na `main` → GitHub Actions publica em `gh-pages`

Guia completo: **[docs/DEPLOY.md](docs/DEPLOY.md)**

Setup automatizado:
```powershell
.\scripts\setup-production.ps1
```

Documentação:
- [docs/APPLICATION.md](docs/APPLICATION.md) — funcionalidades e arquitetura
- [docs/SECURITY.md](docs/SECURITY.md) — segurança e LGPD

---

## Desenvolvimento local

```bash
npm install
copy .env.example .env   # preencha Supabase
npm run dev
```

Sem `.env`, o app roda em **modo demo** (localStorage) — apenas para desenvolvimento.

### Contas demo (modo local)

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | admin@avrozgames.com.br | avroz2024 |
| Comprador | cliente@demo.com | demo1234 |
| Vendedor | vendedor1@demo.com | demo1234 |

---

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Loja |
| `/entrar`, `/cadastro` | Auth |
| `/minha-conta` | Pedidos do comprador |
| `/vendedor` | Painel vendedor |
| `/admin` | Painel admin |
| `/legal/termos` | Termos de uso |

---

## Licença

Projeto privado — Avroz Games.
