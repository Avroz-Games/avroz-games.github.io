# Deploy em Produção — Avroz Games Marketplace

**Site:** https://avroz-games.github.io/  
**Repositório:** https://github.com/Avroz-Games/avroz-games.github.io

---

## Checklist rápido

- [ ] Projeto Supabase criado
- [ ] SQL executado (`schema.sql` → `storage.sql` → `seed.sql`)
- [ ] Usuário admin criado no Supabase Auth
- [ ] Secrets configurados no GitHub
- [ ] Push na branch `main` (deploy automático)
- [ ] Site acessível com login/cadastro funcionando

---

## 1. Supabase (banco + auth)

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Anote **Project URL** e **anon public key** (Settings → API)
3. No **SQL Editor**, execute nesta ordem:
   - `supabase/schema.sql`
   - `supabase/storage.sql`
   - `supabase/seed.sql`

### Criar admin
1. **Authentication → Users → Add user**
   - E-mail: `admin@avrozgames.com.br`
   - Senha forte (guarde em local seguro)
2. O `seed.sql` promove esse e-mail para `role = admin`
3. Se o perfil não existir, faça login uma vez no site ou rode:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@avrozgames.com.br';
   ```

### Auth settings (recomendado)
- **Authentication → Providers → Email**: habilitar confirmação de e-mail em produção
- **Authentication → URL Configuration**: Site URL = `https://avroz-games.github.io`

---

## 2. GitHub Secrets (obrigatório para produção)

No repositório: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | chave anon do Supabase |

### Via script (PowerShell + GitHub CLI autenticado)
```powershell
.\scripts\setup-production.ps1
```

### Via CLI manual
```bash
gh secret set VITE_SUPABASE_URL -R Avroz-Games/avroz-games.github.io -b"https://SEU-PROJETO.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY -R Avroz-Games/avroz-games.github.io -b"SUA-ANON-KEY"
```

---

## 3. Deploy automático

Cada push na branch `main` dispara `.github/workflows/deploy.yml`:

1. `npm ci` + `npm run build` (com secrets Supabase)
2. Publica `dist/` na branch `gh-pages`
3. GitHub Pages serve em https://avroz-games.github.io/

### Deploy manual
```bash
npm run build
npx gh-pages -d dist
```

---

## 4. Verificação pós-deploy

1. Abra https://avroz-games.github.io/
2. **Cadastre-se** como comprador — deve criar perfil no Supabase
3. **Cadastre-se** como vendedor → complete loja → admin aprova em `/admin/vendedores`
4. Faça uma compra teste → confirme recebimento em `/minha-conta`
5. Admin: `/admin` com `admin@avrozgames.com.br`

---

## 5. Desenvolvimento local

```powershell
copy .env.example .env
npm install
npm run dev
```

Ou: `.\scripts\configure.ps1`

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Tela "Configuração pendente" | Adicione secrets GitHub e redeploy |
| Erro ao cadastrar | Verifique trigger `handle_new_user` no schema |
| Checkout falha | Reexecute policies de checkout no schema.sql |
| Imagens não sobem | Execute `storage.sql` |
