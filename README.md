# 🚀 Sistema de Gerenciamento de Equipe

Este é um projeto de um painel de controle (dashboard) completo para gerenciamento de equipes, desenvolvido com Next.js, TypeScript e Tailwind CSS. A interface foi construída utilizando componentes de alta qualidade do Shadcn/ui.

## ✨ Funcionalidades

O sistema foi projetado para ser uma solução completa, incluindo:

-   **Autenticação de Usuário:** Sistema de login seguro para diferentes níveis de acesso (Membro, Gerente, Admin).
-   **Dashboard Principal:** Uma visão geral com estatísticas, métricas de desempenho e atividades recentes da equipe.
-   **Gerenciamento de Perfil:** Os usuários podem visualizar e atualizar suas informações pessoais.
-   **Configurações da Aplicação:** Permite personalizar a experiência do usuário, como a troca de tema (Claro, Escuro e Padrão do Sistema).
-   **Funcionalidades Restritas (Versão Completa):**
    -   Gerenciamento de Tarefas (Kanban board)
    -   Administração de Equipes
    -   Página de Analytics
    -   Geração de Relatórios

## 🛠️ Tecnologias Utilizadas

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
-   **Ícones:** [Lucide React](https://lucide.dev/)
-   **Autenticação:** Baseada em Cookies com Next.js Route Handlers

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar a aplicação em seu ambiente de desenvolvimento.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Instale as dependências:**
    (Escolha o gerenciador de pacotes de sua preferência)
    ```bash
    npm install
    ```
    ou
    ```bash
    yarn install
    ```
    ou
    ```bash
    pnpm install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse a aplicação:**
    Abra seu navegador e acesse `http://localhost:3000`.

## 🖥️ Telas Disponíveis na Demonstração

Para fins de demonstração e avaliação, esta versão do projeto tem as seguintes telas ativas:

-   **/login**: Página de autenticação.
-   **/dashboard**: Painel principal após o login.
-   **/profile**: Página de perfil do usuário.
-   **/settings**: Página de configurações da aplicação.

As demais seções foram temporariamente desativadas e redirecionam para o dashboard.
