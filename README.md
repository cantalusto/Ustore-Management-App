# 🚀 uStore - Sistema de Gerenciamento de Equipes

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

##  

Um painel de controle (dashboard) completo e inovador para gerenciamento de equipes e tarefas, desenvolvido com as tecnologias mais modernas do mercado. A interface foi construída utilizando componentes de alta qualidade do Shadcn/ui, e o sistema conta com uma API robusta para todas as operações.

## ✨ Funcionalidades Principais

O sistema foi projetado para ser uma solução completa e inovadora, com funcionalidades inteligentes que variam de acordo com o nível de acesso do usuário (Admin, Gerente, Membro).

### 🤖 Inovações Inteligentes
- **Criação de Tarefas com IA:** Integração com Google Gemini para criar tarefas automaticamente a partir de linguagem natural.
- **Dashboard Inteligente:** Métricas de desempenho em tempo real com insights automáticos.
- **Drag & Drop Avançado:** Experiência fluida de arrastar e soltar no quadro Kanban.

### 🔐 Autenticação e Segurança
- **Autenticação Segura:** Sistema de login baseado em cookies com senhas criptografadas.
- **Controle de Acesso Granular:** Permissões específicas para cada tipo de usuário.

### 📊 Gestão Visual e Eficiente
- **Quadro Kanban Interativo:** Visualização intuitiva com colunas personalizáveis (A Fazer, Em Progresso, Revisão, Concluído).
- **Análises com Gráficos:** Dashboard analítico com visualizações de distribuição de tarefas e tendências.
- **Relatórios Exportáveis:** Geração automática de relatórios em Excel para análise de desempenho.

## 🚀 Tecnologias Utilizadas

* **Framework:** Next.js 14+ com App Router
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL com Prisma ORM
* **Estilização:** Tailwind CSS
* **UI Components:** Shadcn/ui
* **Autenticação:** Cookies + bcryptjs
* **Inteligência Artificial:** Google Gemini API
* **Drag & Drop:** @dnd-kit
* **Ícones:** Lucide React
* **Gráficos:** Chart.js

## 🛠️ Instalação e Configuração

Siga os passos abaixo para implementar esta solução inovadora em seu ambiente.

### Pré-requisitos
* Node.js 18+ e pnpm
* Instância PostgreSQL em execução
* Chave API do Google Gemini

### Passos Rápidos de Implementação

1. **Clone o Repositório:**
```bash
git clone https://github.com/cantalusto/ustore-system.git
cd ustore-system
```

2. **Instale as Dependências:**
```bash
pnpm install
```

3. **Configure as Variáveis de Ambiente:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
GEMINI_API_KEY="SUA_CHAVE_API_AQUI"
```

4. **Execute o Setup do Banco:**
```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

5. **Inicie o Sistema:**
```bash
pnpm run dev
```

6. **Acesse a Inovação:**
```
http://localhost:3000
```

## 🎮 Como Usar o Sistema

### 👥 Usuários de Teste
O sistema vem pré-configurado com três perfis para demonstração:

| Perfil | Credenciais | Permissões |
|--------|-------------|------------|
| **Administrador** | `admin@company.com` / `admin123` | Acesso total ao sistema |
| **Gerente** | `manager@company.com` / `manager123` | Gestão de equipes e tarefas |
| **Membro** | `member@company.com` / `member123` | Visualização e tarefas atribuídas |

### 🚀 Primeiros Passos
1. **Faça login** com uma das credenciais acima
2. **Explore o Dashboard** com métricas em tempo real
3. **Crie tarefas com IA** usando linguagem natural
4. **Organize projetos** com o quadro Kanban drag & drop
5. **Gere relatórios** automáticos para análise

## 👥 Autores

**[Lucas Cantarelli Lustosa]**

---

Feito com ❤️, Next.js e Inteligência Artificial.