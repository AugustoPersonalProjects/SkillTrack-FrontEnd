import { expect, test, type Locator, type Page } from "@playwright/test";
import { cadastrar, criarMeta, criarSkill, entrar, registrarProgresso } from "./helpers";

// só valem com a API iniciada com ADMIN_EMAIL e ADMIN_PASSWORD iguais a estas variáveis
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_SENHA = process.env.E2E_ADMIN_PASSWORD!;
const TEM_ADMIN = Boolean(ADMIN_EMAIL && ADMIN_SENHA);

const MES_ATUAL = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  month: "long",
  year: "numeric",
}).format(new Date());

async function abrirPainel(page: Page) {
  await entrar(page, ADMIN_EMAIL, ADMIN_SENHA);
  await page.getByRole("link", { name: "Painel" }).click();
  await expect(page).toHaveURL(/\/admin\/painel$/);
}

// o banco é compartilhado com os outros testes, então o valor é conferido sem esperar um número exato
async function valorDaColuna(secao: Locator, coluna: number) {
  const linha = secao.getByRole("row", { name: new RegExp(MES_ATUAL) });
  return Number(await linha.getByRole("cell").nth(coluna).textContent());
}

test.describe("painel de administração", () => {
  test.skip(!TEM_ADMIN, "precisa de E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD");

  test("mostra os indicadores, os gráficos e as tabelas", async ({ page, browser }) => {
    const contexto = await browser.newContext();
    const outraPessoa = await contexto.newPage();
    await cadastrar(outraPessoa);
    await criarSkill(outraPessoa, "Skill do painel");
    await registrarProgresso(outraPessoa, "Skill do painel", 40);
    await criarMeta(outraPessoa, "Meta do painel", "Skill do painel");
    await contexto.close();

    await abrirPainel(page);
    await expect(page.getByRole("heading", { name: "Painel", level: 1 })).toBeVisible();
    await expect(page.getByText("Usuários ativos")).toBeVisible();

    const novosUsuarios = page.getByRole("region", { name: "Novos usuários" });
    await expect(novosUsuarios.locator(".recharts-surface")).toBeVisible();
    await novosUsuarios.getByRole("button", { name: "Ver tabela" }).click();
    expect(await valorDaColuna(novosUsuarios, 1)).toBeGreaterThan(0);
    await novosUsuarios.getByRole("button", { name: "Ver gráfico" }).click();

    // o tooltip também abre pelo teclado
    await novosUsuarios.locator(".recharts-surface").focus();
    await page.keyboard.press("ArrowRight");
    await expect(novosUsuarios.locator(".recharts-tooltip-wrapper")).toContainText("Novos usuários");

    const registros = page.getByRole("region", { name: "Skills e metas criadas" });
    await expect(registros.getByText("Metas concluídas")).toBeVisible();
    await registros.getByRole("button", { name: "Ver tabela" }).click();
    expect(await valorDaColuna(registros, 1)).toBeGreaterThan(0);
    expect(await valorDaColuna(registros, 2)).toBeGreaterThan(0);

    const atividade = page.getByRole("region", { name: "Atividade" });
    await expect(atividade.locator(".recharts-surface")).toBeVisible();

    await expect(page.getByRole("region", { name: "Situação das metas" }).getByText("Em andamento")).toBeVisible();
    await expect(page.getByRole("region", { name: "Skills por nível" }).getByText("Iniciante")).toBeVisible();
    await expect(page.getByRole("region", { name: "Skills por categoria" }).getByText("Backend")).toBeVisible();

    await page.getByRole("region", { name: "Usuários mais ativos" }).getByRole("link").first().click();
    await expect(page).toHaveURL(/\/admin\/usuarios\/\d+$/);
  });

  test("mostra o erro da API na tela", async ({ page }) => {
    await page.route("**/admin/dashboard", (route) =>
      route.fulfill({ status: 500, json: { error: "Erro interno do servidor", message: "Ocorreu um erro inesperado." } })
    );

    await abrirPainel(page);

    await expect(page.getByText("Ocorreu um erro inesperado.")).toBeVisible();
  });

  test("uma falha ao baixar a página do painel não derruba o resto do app", async ({ page }) => {
    await page.route("**/pages/admin/AdminDashboard*", (route) => route.abort());

    await abrirPainel(page);
    await expect(page.getByText(/Não foi possível abrir o painel/)).toBeVisible();

    await page.getByRole("link", { name: "Categorias" }).click();
    await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();
  });
});

test("usuário comum não abre o painel", async ({ page }) => {
  await cadastrar(page);
  await expect(page.getByRole("link", { name: "Painel" })).toHaveCount(0);

  await page.goto("/admin/painel");

  await expect(page).toHaveURL(/\/dashboard$/);
});
