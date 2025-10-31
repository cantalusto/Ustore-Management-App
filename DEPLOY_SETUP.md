# Guia de Configuração de Deploy - Vercel + Railway

## Problema Resolvido

O erro ocorria porque:
1. O script `postinstall` executava o seed durante o build na Vercel
2. A URL do banco usava `postgres.railway.internal` (URL interna do Railway)

## Soluções Aplicadas

### 1. Removido seed do `postinstall`
- ❌ Antes: `"postinstall": "prisma generate && pnpm run db:seed"`
- ✅ Agora: `"postinstall": "prisma generate"`
- O seed será executado manualmente quando necessário

### 2. Script de build atualizado
- ✅ `"build": "prisma generate && next build"`
- Garante que o Prisma Client seja gerado antes do build

## Configuração do Banco de Dados

### Para Railway (Obter URL Pública)

1. Acesse seu projeto no Railway
2. Vá em **PostgreSQL** > **Variables**
3. Copie as seguintes variáveis:
   - `PGHOST` (ex: `junction.proxy.rlwy.net`)
   - `PGPORT` (ex: `12345`)
   - `PGUSER` (ex: `postgres`)
   - `PGPASSWORD`
   - `PGDATABASE` (ex: `railway`)

4. Monte a URL no formato:
   ```
   postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```

**Exemplo:**
```
postgresql://postgres:qIyGQpeTRIcMrWMciCkhnTRqJbpBjiLS@junction.proxy.rlwy.net:12345/railway
```

### Para Vercel (Configurar Variáveis de Ambiente)

1. Acesse seu projeto na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as variáveis:

| Nome | Valor | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` (URL pública do Railway) | Production, Preview, Development |
| `GEMINI_API_KEY` | Sua chave da API Gemini | Production, Preview, Development |

⚠️ **IMPORTANTE:** Use a URL **pública** (junction.proxy.rlwy.net), não a interna (.railway.internal)

### Para Desenvolvimento Local

Atualize o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@junction.proxy.rlwy.net:PORT/railway"
GEMINI_API_KEY="your-api-key"
```

## Executar Seed Manualmente

Se precisar popular o banco de dados:

```bash
pnpm run db:seed
```

Ou executar diretamente no Railway:
```bash
# Via Railway CLI
railway run pnpm run db:seed
```

## Verificar Build Local

Antes de fazer deploy:

```bash
# 1. Instalar dependências
pnpm install

# 2. Gerar Prisma Client
pnpm prisma generate

# 3. Testar build
pnpm run build

# 4. Testar produção local
pnpm start
```

## Checklist de Deploy

- [ ] URL do banco no Railway está pública (junction.proxy.rlwy.net)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build local funciona sem erros
- [ ] Banco de dados tem dados (rode o seed se necessário)
- [ ] Commit e push das alterações

## URLs Importantes

### Railway
- URL Interna: `postgres.railway.internal:5432` (só funciona DENTRO do Railway)
- URL Pública: `junction.proxy.rlwy.net:PORT` (funciona de qualquer lugar)

### Diferenças

| Tipo | URL | Uso |
|------|-----|-----|
| Interna | `postgres.railway.internal` | Serviços rodando DENTRO do Railway |
| Pública | `junction.proxy.rlwy.net` | Vercel, desenvolvimento local, etc. |

## Troubleshooting

### Erro: "Can't reach database server"
- ✅ Verifique se está usando a URL pública do Railway
- ✅ Confirme que a porta está correta
- ✅ Teste a conexão localmente primeiro

### Erro: "Authentication failed"
- ✅ Verifique usuário e senha
- ✅ Confirme que o banco está ativo no Railway

### Build falha na Vercel
- ✅ Verifique as variáveis de ambiente na Vercel
- ✅ Confirme que `postinstall` não executa seed
- ✅ Teste build local primeiro
