# 🧠 SkillTrack — Front-end

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
- **Modo escuro**: alternado pelo botão na barra superior; segue o tema do sistema até ser escolhido manualmente
- **Layout responsivo**: no celular, a navegação vira um menu lateral
- **Administração** (perfil ADMIN): resumo do sistema, lista de usuários com busca e filtro por perfil, cadastro, edição de perfil e exclusão de usuários, detalhe com as skills e metas de cada usuário e gestão de categorias
- **Componentes de interface** feitos à mão, inspirados no [shadcn/ui](https://ui.shadcn.com): Select com navegação por teclado, Dialog para formulários e confirmação de exclusão

> Para acessar a área de administração, a conta precisa ter o perfil ADMIN. Veja as variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` no README da API.

## 🧰 Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios (autenticação JWT)

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

---

👨‍💻 Desenvolvido por Augusto Lopes Lyra — FIAP

🤖 Este projeto foi desenvolvido com auxílio de Inteligência Artificial no deploy, no versionamento e em partes do código (interface do front-end e cálculo do dashboard).
