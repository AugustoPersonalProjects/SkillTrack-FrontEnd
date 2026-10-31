import { expect, test, type Page } from "@playwright/test";
import { cadastrar, entrar } from "./helpers";

const PRAZO_FUTURO = "2099-12-31";

async function criarSkill(page: Page, nome: string) {
  await page.getByRole("link", { name: "Skills", exact: true }).click();
  await page.getByRole("button", { name: "Nova skill" }).first().click();

  const dialogo = page.getByRole("dialog");
  await dialogo.getByLabel("Nome").fill(nome);
  await dialogo.getByLabel("Categoria").click();
  await page.getByRole("option", { name: "Backend" }).click();
  await dialogo.getByRole("button", { name: "Criar skill" }).click();

  await expect(page.getByRole("article").filter({ hasText: nome })).toBeVisible();
}

async function criarMeta(page: Page, titulo: string, nomeSkill: string) {
  await page.getByRole("link", { name: "Metas", exact: true }).click();
  await page.getByRole("button", { name: "Nova meta" }).first().click();

  const dialogo = page.getByRole("dialog");
  await dialogo.getByLabel("Título").fill(titulo);
  await dialogo.getByLabel("Skill").click();
  await page.getByRole("option", { name: nomeSkill }).click();
  await dialogo.getByLabel("Prazo").fill(PRAZO_FUTURO);
  await dialogo.getByRole("button", { name: "Criar meta" }).click();

  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
}

test("cadastro, login, skill, progresso e visão geral", async ({ page }) => {
  const email = await cadastrar(page);

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await entrar(page, email);

  await criarSkill(page, "Playwright");

  const card = page.getByRole("article").filter({ hasText: "Playwright" });
  await card.getByRole("button", { name: "Registrar progresso" }).click();
  await card.getByLabel("Progresso em porcentagem").fill("60");
  await card.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Progresso registrado.")).toBeVisible();
  await expect(card.getByText("60%")).toBeVisible();

  await page.getByRole("link", { name: "Visão geral" }).click();
  const secaoProgresso = page.locator("section").filter({ hasText: "Progresso por skill" });
  await expect(secaoProgresso.getByText("Playwright")).toBeVisible();
  await expect(secaoProgresso.getByText("60%")).toBeVisible();
});

test("meta concluída sai das próximas metas", async ({ page }) => {
  await cadastrar(page);
  await criarSkill(page, "Java");
  await criarMeta(page, "Estudar Spring", "Java");

  await page.getByRole("link", { name: "Visão geral" }).click();
  const proximasMetas = page.locator("section").filter({ hasText: "Próximas metas" });
  await expect(proximasMetas.getByText("Estudar Spring")).toBeVisible();

  await page.getByRole("link", { name: "Metas", exact: true }).click();
  await page.getByRole("button", { name: "Concluir" }).click();
  await expect(page.getByText('Meta "Estudar Spring" concluída.')).toBeVisible();

  await page.getByRole("link", { name: "Visão geral" }).click();
  await expect(proximasMetas.getByText("Nenhuma meta pendente.")).toBeVisible();
});

test("meta atrasada pode ser editada sem mudar o prazo", async ({ page }) => {
  const PRAZO_PASSADO = "2020-01-15";

  await cadastrar(page);
  await criarSkill(page, "Java");
  await criarMeta(page, "Meta antiga", "Java");

  // a API não permite criar meta com prazo passado, então a lista recebe o prazo já vencido
  await page.route("**/goals/user/*", async (route) => {
    const resposta = await route.fetch();
    const metas: { deadline: string }[] = await resposta.json();
    await route.fulfill({ response: resposta, json: metas.map((meta) => ({ ...meta, deadline: PRAZO_PASSADO })) });
  });

  const edicoes: { title: string; deadline: string }[] = [];
  await page.route("**/goals/*", async (route) => {
    if (route.request().method() !== "PUT") return route.fallback();
    edicoes.push(route.request().postDataJSON());
    await route.fulfill({ json: {} });
  });

  await page.getByRole("link", { name: "Skills", exact: true }).click();
  await page.getByRole("link", { name: "Metas", exact: true }).click();
  await expect(page.getByText(/Atrasada há/)).toBeVisible();
  await page.getByRole("button", { name: "Editar Meta antiga" }).click();

  const dialogo = page.getByRole("dialog");

  // trocar por outra data passada continua proibido
  await dialogo.getByLabel("Prazo").fill("2020-02-01");
  await dialogo.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(dialogo.getByText("O prazo deve ser hoje ou uma data futura.")).toBeVisible();
  expect(edicoes).toHaveLength(0);

  await dialogo.getByLabel("Prazo").fill(PRAZO_PASSADO);
  await dialogo.getByLabel("Título").fill("Meta renomeada");
  await dialogo.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Meta atualizada.")).toBeVisible();
  expect(edicoes).toHaveLength(1);
  expect(edicoes[0]).toMatchObject({ title: "Meta renomeada", deadline: PRAZO_PASSADO });

  // a tela recarrega a lista depois de salvar: espera essa requisição antes de fechar a página
  await page.unrouteAll({ behavior: "wait" });
});

test("sessão expirada volta ao login e limpa as notificações", async ({ page }) => {
  await cadastrar(page);
  await criarSkill(page, "Java");
  expect(await page.evaluate(() => localStorage.getItem("notifications"))).not.toBeNull();

  await page.evaluate(() => localStorage.setItem("token", "token-invalido"));
  await page.reload();

  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("notifications"))).toBeNull();
});
