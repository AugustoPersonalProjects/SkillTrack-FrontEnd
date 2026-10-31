import { expect, type Page } from "@playwright/test";

export const SENHA = "senha-de-teste";

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
