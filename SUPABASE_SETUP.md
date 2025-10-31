# 🚀 Guia Completo - Deploy com Supabase + Vercel

## Por que Supabase?
- ✅ Tier gratuito generoso (500 MB de banco, sem hibernação)
- ✅ PostgreSQL gerenciado (não precisa configurar nada)
- ✅ URL pública funcionando sempre
- ✅ Interface visual para gerenciar dados
- ✅ Backups automáticos

---

## 📋 Passo a Passo Completo

### **Passo 1: Criar Projeto no Supabase**

1. Acesse: **https://supabase.com**
2. Clique em **"Start your project"** ou **"Sign In"**
3. Faça login com GitHub (recomendado)
4. Clique em **"New Project"**
5. Preencha:
   - **Name:** `ustore-management` (ou o nome que preferir)
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** Escolha a mais próxima (ex: South America - São Paulo)
   - **Pricing Plan:** Free
6. Clique em **"Create new project"**
7. ⏳ Aguarde 1-2 minutos enquanto o banco é criado

---

### **Passo 2: Obter Connection String**

1. No dashboard do projeto, vá em **Settings** (⚙️ no menu lateral)
2. Clique em **Database** no menu lateral
3. Role até **"Connection String"**
4. Selecione a aba **"URI"** ou **"Connection Pooling"** (recomendado para Vercel)
5. Copie a string que parece com:
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
6. **IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou

**Exemplo final:**
```
postgresql://postgres.abcdefgh:SuaSenhaSuperForte123@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

### **Passo 3: Configurar .env Local**

Cole a connection string no seu arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres.xxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
GEMINI_API_KEY="AIzaSyDPoeptaPuYqe1UggnFMjHSfS3kNO5JJYY"
```

✅ **Salve o arquivo!**

---

### **Passo 4: Criar Tabelas no Supabase**

Abra o terminal e execute:

```bash
# 1. Gerar Prisma Client
pnpm prisma generate

# 2. Criar as tabelas no banco Supabase
pnpm prisma db push
```

✅ Você deve ver: **"Your database is now in sync with your Prisma schema"**

---

### **Passo 5: Popular o Banco com Dados Iniciais**

```bash
pnpm run db:seed
```

✅ Isso criará usuários de exemplo:
- **Admin:** admin@admin.com / admin123
- **Manager:** manager@manager.com / manager123
- **Member:** member@member.com / member123

---

### **Passo 6: Testar Localmente**

```bash
# Rodar o servidor de desenvolvimento
pnpm dev
```

Acesse: **http://localhost:3000/login**

Tente fazer login com: `admin@admin.com` / `admin123`

✅ Se funcionar, está tudo certo!

---

### **Passo 7: Configurar Vercel**

1. Acesse: **https://vercel.com**
2. Vá no seu projeto **Ustore-Management-App**
3. Clique em **Settings**
4. No menu lateral, clique em **Environment Variables**
5. Adicione as variáveis:

#### Variável 1: DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** Cole a connection string do Supabase (mesma do .env)
- **Environment:** Selecione **Production**, **Preview** e **Development**
- Clique em **Save**

#### Variável 2: GEMINI_API_KEY
- **Key:** `GEMINI_API_KEY`
- **Value:** `AIzaSyDPoeptaPuYqe1UggnFMjHSfS3kNO5JJYY`
- **Environment:** Selecione **Production**, **Preview** e **Development**
- Clique em **Save**

---

### **Passo 8: Fazer Deploy**

No terminal, execute:

```bash
# 1. Adicionar mudanças
git add .

# 2. Commit
git commit -m "feat: configurar Supabase como banco de dados"

# 3. Push (vai disparar o deploy automático)
git push origin main
```

⏳ Aguarde 2-3 minutos enquanto a Vercel faz o deploy

---

### **Passo 9: Verificar Deploy**

1. Acesse a URL do seu projeto na Vercel (ex: `ustore-management.vercel.app`)
2. Vá para `/login`
3. Faça login com: `admin@admin.com` / `admin123`

✅ **Sucesso!** Seu app está no ar!

---

## 🔍 Visualizar Dados no Supabase

1. No dashboard do Supabase, clique em **Table Editor** (ícone de tabela)
2. Você verá suas tabelas: `User`, `Task`, `Team`, `Comment`
3. Clique em qualquer tabela para ver/editar os dados
4. Use **SQL Editor** para executar queries personalizadas

---

## 📊 Monitoramento

### No Supabase:
- **Database** > **Database Settings:** Uso de armazenamento
- **Reports:** Estatísticas de uso

### Na Vercel:
- **Deployments:** Histórico de deploys
- **Analytics:** Visitantes e performance
- **Logs:** Erros em tempo real

---

## 🆘 Troubleshooting

### ❌ "Can't reach database server"
**Solução:**
1. Verifique se copiou a senha correta
2. Use a connection string com **Connection Pooling** (porta 6543)
3. Confirme que o projeto Supabase está ativo

### ❌ "prisma db push" falha
**Solução:**
```bash
# Tentar com flag de reset
pnpm prisma db push --force-reset
```

### ❌ Erro de autenticação no login
**Solução:**
1. Verifique se o seed rodou com sucesso
2. Confirme os dados no Table Editor do Supabase
3. Rode o seed novamente se necessário

### ❌ Deploy falha na Vercel
**Solução:**
1. Vá em **Deployments** > Clique no deploy falhado
2. Veja os logs para identificar o erro
3. Confirme que as variáveis de ambiente estão corretas
4. Faça um novo deploy: **Deployments** > **Redeploy**

---

## 🎯 Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Connection string copiada e senha substituída
- [ ] Arquivo `.env` atualizado localmente
- [ ] `prisma db push` executado com sucesso
- [ ] `pnpm run db:seed` executado com sucesso
- [ ] App funciona localmente (http://localhost:3000)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Push feito para o repositório
- [ ] Deploy na Vercel concluído com sucesso
- [ ] Login funcionando no site em produção

---

## 🔐 Segurança

⚠️ **NUNCA commite o arquivo `.env` no Git!**

Verifique se `.env` está no `.gitignore`:

```bash
# Ver conteúdo do .gitignore
cat .gitignore | grep .env
```

Se não estiver, adicione:
```
.env
.env.local
.env*.local
```

---

## 📚 Recursos Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## 🎉 Pronto!

Seu app está rodando com:
- ✅ **Frontend:** Vercel (Edge Network global)
- ✅ **Banco de Dados:** Supabase (PostgreSQL gerenciado)
- ✅ **Deploy:** Automático via Git push

**Qualquer dúvida, consulte este guia! 🚀**
