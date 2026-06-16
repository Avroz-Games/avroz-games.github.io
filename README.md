# Avroz Games — Marketplace

Marketplace profissional de jogos, consoles e acessórios com painel administrativo, pagamento PIX com desconto e cálculo de frete via Correios.

**Repositório:** https://github.com/Avroz-Games/avroz-games.github.io  
**Site:** https://avroz-games.github.io/

## Funcionalidades

### Loja (Cliente)
- Catálogo responsivo com busca, filtros e 20 categorias
- Simulador de frete Correios na página do produto
- Checkout em 3 etapas com PIX (10% OFF) e QR Code
- Tema dark gaming com identidade Avroz Games

### Painel Admin (`/admin`)
- CRUD de produtos com upload de fotos
- Margem automática de 45% sobre custo
- Gestão de pedidos e configurações da loja
- Status de conexão Supabase em tempo real

---

## GitHub Pages

O site é publicado automaticamente a cada push na `main` via GitHub Actions.

1. O workflow faz build e publica na branch `gh-pages`
2. URL: **https://avroz-games.github.io/**
3. Secrets opcionais (Settings → Secrets → Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Supabase (backend na nuvem)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute no SQL Editor: `schema.sql` → `storage.sql` → `seed.sql`
3. Crie usuário admin em **Authentication → Users**
4. Copie `.env.example` → `.env` e preencha as chaves
5. Ou execute: `.\scripts\configure.ps1`

---

## Instalação local

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## Credenciais demo (modo local)

| Campo   | Valor        |
|---------|--------------|
| Usuário | `admin`      |
| Senha   | `avroz2024`  |

## Licença

Projeto privado — Avroz Games.
