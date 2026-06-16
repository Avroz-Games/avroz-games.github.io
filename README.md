# Avroz Games — Marketplace

Marketplace profissional de jogos, consoles e acessórios com painel administrativo, pagamento PIX com desconto e cálculo de frete via Correios.

## Funcionalidades

### Loja (Cliente)
- Catálogo responsivo com busca, filtros e categorias
- Página de produto com galeria de fotos e características
- Carrinho de compras
- Checkout em 3 etapas (dados → frete → pagamento)
- **PIX com 10% de desconto** automático
- **Frete Correios** calculado antes da compra (PAC, SEDEX, SEDEX 12)
- Integração com **ViaCEP** para preenchimento automático de endereço

### Painel Admin
- Login seguro (`/admin`)
- Dashboard com métricas
- CRUD completo de produtos com upload de fotos
- Preço de custo + **margem automática de 45%**
- Dimensões para cálculo de frete
- Gestão de pedidos
- Configurações da loja (PIX, CEP origem, margens)

## Credenciais Demo

| Campo    | Valor       |
|----------|-------------|
| Usuário  | `admin`     |
| Senha    | `avroz2024` |

## Instalação

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

## Deploy no GitHub Pages

1. Crie um repositório no GitHub
2. Faça push do código para a branch `main`
3. Em **Settings → Pages**, selecione **GitHub Actions** como source
4. O workflow `.github/workflows/deploy.yml` fará o deploy automaticamente

> **Importante:** O site será publicado em `https://avroz-games.github.io/site/` após ativar GitHub Pages com source **GitHub Actions**.

## Estrutura

```
src/
├── components/     # Header, Footer, ProductCard, AdminLayout
├── context/        # Auth, Cart, Products
├── pages/          # Home, Products, Cart, Checkout
├── pages/admin/    # Login, Dashboard, Products, Orders, Settings
├── services/       # Storage, ViaCEP, Shipping (Correios)
└── types/          # TypeScript interfaces
```

## Tecnologias

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 3
- React Router 7
- Lucide Icons
- LocalStorage (persistência local — ideal para demo/GitHub Pages)

## Próximos Passos (Refinamentos)

- [ ] Backend real (Supabase, Firebase ou API própria)
- [ ] Gateway de pagamento PIX (Mercado Pago, PagSeguro)
- [ ] Credenciais oficiais Correios (CWS API)
- [ ] Notificações por e-mail/WhatsApp
- [ ] Autenticação de clientes
- [ ] Rastreamento de pedidos

## Licença

Projeto privado — Avroz Games.
