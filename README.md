# Avroz Games — Marketplace

Marketplace profissional de jogos, consoles e acessórios com painel administrativo, pagamento PIX com desconto e cálculo de frete via Correios.

**Repositório:** https://github.com/Avroz-Games/site  
**Site (GitHub Pages):** https://avroz-games.github.io/site/

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

## Configuração rápida

### 1. GitHub Pages (site online)

1. Acesse **https://github.com/Avroz-Games/site/settings/pages**
2. Em **Build and deployment → Source**, selecione **GitHub Actions**
3. O workflow fará deploy automaticamente a cada push na `main`
4. URL final: **https://avroz-games.github.io/site/**

### 2. Supabase (backend na nuvem)

#### Criar projeto
1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Anote a **Project URL** e **anon public key** (Settings → API)

#### Executar SQL (SQL Editor do Supabase)
Execute nesta ordem:
```
supabase/schema.sql   → tabelas e permissões
supabase/storage.sql  → bucket de imagens
supabase/seed.sql     → produtos demo + configurações
```

#### Criar usuário admin
1. **Authentication → Users → Add user**
2. E-mail e senha do administrador
3. Use essas credenciais em `/admin`

#### Configurar localmente
```powershell
.\scripts\configure.ps1
npm run dev
```

Ou copie `.env.example` → `.env` e preencha:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

#### Configurar no GitHub Pages (produção)
Em **https://github.com/Avroz-Games/site/settings/secrets/actions**, adicione:

| Secret | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon public |

Depois faça um push ou reexecute o workflow **Deploy to GitHub Pages**.

---

## Modos de operação

| Modo | Quando | Login admin |
|------|--------|-------------|
| **Local** | Sem `.env` | `admin` / `avroz2024` |
| **Supabase** | Com `.env` configurado | E-mail/senha do Supabase Auth |

---

## Instalação local

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
├── components/     # UI, Logo, ShippingCalculator
├── context/        # Auth, Cart, Products
├── services/       # api.ts (Supabase + fallback local)
├── pages/          # Loja + Admin
supabase/
├── schema.sql      # Tabelas e RLS
├── storage.sql     # Bucket de imagens
└── seed.sql        # Dados iniciais
scripts/
└── configure.ps1   # Assistente de configuração
```

## Tecnologias

- React 18 + TypeScript + Vite 6
- Tailwind CSS 3
- Supabase (Auth, Database, Storage)
- GitHub Pages + GitHub Actions

## Licença

Projeto privado — Avroz Games.
