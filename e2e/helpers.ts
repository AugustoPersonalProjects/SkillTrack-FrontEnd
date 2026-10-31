import { expect, type Page } from "@playwright/test";

export const SENHA = "senha-de-teste";
const PRAZO_FUTURO = "2099-12-31";

// o banco não é limpo entre as execuções, então cada teste cria a própria conta
export const novoEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 100000)}@exemplo.com`;

export async function cadastrar(page: Page) {
  const email = novoEmail();
  await page.goto("/register");
  await page.getByLabel("Nome").fill("Pessoa de Teste");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByLabel("Confirmar senha").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return email;
}

export async function entrar(page: Page, email: string, senha = SENHA) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function criarSkill(page: Page, nome: string) {
  await page.getByRole("link", { name: "Skills", exact: true }).click();
  await page.getByRole("button", { name: "Nova skill" }).first().click();

  const dialogo = page.getByRole("dialog");
  await dialogo.getByLabel("Nome").fill(nome);
  await dialogo.getByLabel("Categoria").click();
  await page.getByRole("option", { name: "Backend" }).click();
  await dialogo.getByRole("button", { name: "Criar skill" }).click();

  await expect(page.getByRole("article").filter({ hasText: nome })).toBeVisible();
}

// com a página de Skills aberta
export async function registrarProgresso(page: Page, nomeSkill: string, porcentagem: number) {
  const card = page.getByRole("article").filter({ hasText: nomeSkill });
  await card.getByRole("button", { name: "Registrar progresso" }).click();
  await card.getByLabel("Progresso em porcentagem").fill(String(porcentagem));
  await card.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Progresso registrado.")).toBeVisible();
  await expect(card.getByText(`${porcentagem}%`)).toBeVisible();
}

export async function criarMeta(page: Page, titulo: string, nomeSkill: string) {
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
