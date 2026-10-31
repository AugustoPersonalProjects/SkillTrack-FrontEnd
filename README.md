# 🧠 SkillTrack — Front-end

[![CI](https://github.com/AugustoPersonalProjects/SkillTrack-FrontEnd/actions/workflows/ci.yml/badge.svg)](https://github.com/AugustoPersonalProjects/SkillTrack-FrontEnd/actions/workflows/ci.yml)
[![CodeQL](https://github.com/AugustoPersonalProjects/SkillTrack-FrontEnd/actions/workflows/codeql.yml/badge.svg)](https://github.com/AugustoPersonalProjects/SkillTrack-FrontEnd/actions/workflows/codeql.yml)

Interface web do **SkillTrack**, sistema de gestão de habilidades profissionais. Permite cadastrar skills, definir metas de aprendizado e acompanhar o progresso.

A API (Java + Spring Boot) está no repositório [SkillTrack](https://github.com/AugustoPersonalProjects/SkillTrack).

## 🌐 Em produção

| Camada | Plataforma | URL |
|--------|------------|-----|
| Front-end | Vercel | https://skill-track-front-end.vercel.app |
| API | Render | https://skilltrack-qohl.onrender.com |
| Banco de dados | Aiven (MySQL) | — |

> ℹ️ A API usa o plano gratuito do Render, que suspende o serviço após ~15 minutos sem uso. O primeiro acesso depois disso pode levar até um minuto.

## ✨ Funcionalidades

- **Visão geral**: estatísticas, progresso por skill, próximas metas e registros recentes, vindos do endpoint `/dashboard` da API
- **Skills**: cadastro, edição e exclusão, registro de progresso e filtros por texto, categoria e nível
- **Metas**: cadastro, edição, conclusão e exclusão, com filtros por status (em andamento, atrasadas, concluídas), skill e texto
- **Perfil**: nome, bio e cor do avatar, além da troca de e-mail e de senha com a confirmação da senha atual. Trocar a senha encerra as sessões abertas nos outros dispositivos
- **Modo escuro**: alternado pelo botão na barra superior ou em Meu perfil. A escolha fica salva na conta e acompanha o usuário em outros dispositivos; sem uma escolha, segue o tema do sistema
- **Layout responsivo**: no celular, a navegação vira um menu lateral
- **Administração** (perfil ADMIN): painel com indicadores e gráficos, lista de usuários com busca e filtro por perfil, cadastro, edição de perfil e exclusão de usuários, detalhe com as skills e metas de cada usuário e gestão de categorias
- **Painel de administração**: usuários novos e ativos, progresso médio, atividade por semana, situação das metas, skills por categoria e por nível e usuários mais ativos. Cada gráfico tem uma versão em tabela, responde ao teclado e usa cores validadas para daltonismo nos dois temas
- **Componentes de interface** feitos à mão, inspirados no [shadcn/ui](https://ui.shadcn.com): Select com navegação por teclado, Dialog para formulários e confirmação de exclusão

> Para acessar a área de administração, a conta precisa ter o perfil ADMIN. Veja as variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` no README da API.

## 🧰 Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios (autenticação JWT)
- Recharts (gráficos do painel, carregados só por quem abre a página)
- Vitest e Playwright (testes)

## ▶️ Executando localmente

Com a API rodando em `http://localhost:8080`:

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

## ⚙️ Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | `http://localhost:8080` | URL base da API |

Para configurar localmente, copie `.env.example` para `.env`.

## 🧪 Testes

```bash
npm test                              # regras de utils/, com Vitest
npx playwright install chromium       # só na primeira vez
npm run test:e2e                      # fluxo principal no navegador, com Playwright
```

Os testes de ponta a ponta precisam da API rodando em um banco local, pois criam contas de teste a cada execução. Use `E2E_API_URL` se ela não estiver em `http://localhost:8080`. O front sobe sozinho na porta 5174, sem usar o `VITE_API_URL` de um `.env` local.

Como criam várias contas a partir do mesmo IP, esses testes precisam do limite de tentativas desligado na API. O `spring-boot:run` já faz isso; em outros casos, inicie a API com `RATE_LIMIT_ENABLED=false`.

O teste do painel de administração só roda com `E2E_ADMIN_EMAIL` e `E2E_ADMIN_PASSWORD` iguais às variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` da API. Sem elas, ele é pulado.

A cada push em `main` e em cada pull request, o GitHub Actions roda o lint, os testes e o build, e faz a análise de segurança com o CodeQL. Os testes de ponta a ponta usam a versão da API que está na branch principal do repositório dela.

## ☁️ Deploy (Vercel)

1. Importe este repositório na Vercel (framework **Vite**).
2. Em **Environment Variables**, defina `VITE_API_URL` com a URL pública da API (`https://skilltrack-qohl.onrender.com`).
3. Faça o deploy e adicione a URL gerada em `CORS_ALLOWED_ORIGINS` na API.

O arquivo `vercel.json` redireciona todas as rotas para o `index.html`, permitindo acessar e recarregar páginas como `/dashboard` diretamente.

## 📜 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Verificação de tipos e build de produção |
| `npm run lint` | Análise estática com ESLint |
| `npm run preview` | Pré-visualização do build |
| `npm test` | Testes unitários |
| `npm run test:e2e` | Testes de ponta a ponta |

---

👨‍💻 Desenvolvido por Augusto Lopes Lyra — FIAP

🤖 Este projeto foi desenvolvido com auxílio de Inteligência Artificial no deploy, no versionamento e em partes do código (interface do front-end, área de administração e cálculo do dashboard).
