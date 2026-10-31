import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";
import { cadastrar, entrar, novoEmail, SENHA } from "./helpers";

const NOVA_SENHA = "nova-senha-de-teste";

// só valem com a API iniciada com ADMIN_EMAIL e ADMIN_PASSWORD iguais a estas variáveis
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_SENHA = process.env.E2E_ADMIN_PASSWORD;

const linkDoPerfil = (page: Page) => page.getByRole("link", { name: /Meu perfil/ });

async function abrirPerfil(page: Page) {
  await linkDoPerfil(page).click();
  await expect(page).toHaveURL(/\/perfil$/);
}

// outro dispositivo: uma sessão do navegador sem o localStorage da primeira
async function abrirOutroDispositivo(browser: Browser) {
  const contexto = await browser.newContext();
  return contexto.newPage();
}

// os botões de opção ficam escondidos visualmente: quem usa a tela clica no rótulo deles
const escolher = (secao: Locator, opcao: string) => secao.locator("label", { hasText: opcao }).click();

const temaSalvo = (page: Page) =>
  page.waitForResponse((resposta) => resposta.url().endsWith("/usuarios/me/tema") && resposta.ok());

test("personaliza nome, bio e cor do avatar", async ({ page }) => {
  await cadastrar(page);
  await abrirPerfil(page);

  const dados = page.getByRole("region", { name: "Dados pessoais" });
  await dados.getByLabel("Nome").fill("Pessoa Renomeada");
  await dados.getByLabel("Bio").fill("Estudando testes de ponta a ponta.");
  await escolher(dados, "Violeta");
  await dados.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(dados.getByText("Perfil atualizado.")).toBeVisible();

  const avatarDoMenu = linkDoPerfil(page).locator("span[aria-hidden]");
  await expect(linkDoPerfil(page)).toContainText("Pessoa Renomeada");
  await expect(avatarDoMenu).toHaveClass(/bg-violet-100/);

  await page.reload();
  await expect(dados.getByLabel("Nome")).toHaveValue("Pessoa Renomeada");
  await expect(dados.getByLabel("Bio")).toHaveValue("Estudando testes de ponta a ponta.");
  await expect(dados.getByLabel("Violeta")).toBeChecked();
  await expect(avatarDoMenu).toHaveClass(/bg-violet-100/);
});

test("trocar o e-mail exige a senha e não encerra a sessão", async ({ page }) => {
  await cadastrar(page);
  await abrirPerfil(page);

  const secao = page.getByRole("region", { name: "E-mail" });
  const email = novoEmail();
  await secao.getByLabel("Novo e-mail").fill(email);
  await secao.getByLabel("Senha atual").fill("senha-errada");
  await secao.getByRole("button", { name: "Alterar e-mail" }).click();

  // a senha errada mostra o erro e não leva ao login
  await expect(secao.getByText("A senha atual está incorreta.")).toBeVisible();
  await expect(page).toHaveURL(/\/perfil$/);

  await secao.getByLabel("Senha atual").fill(SENHA);
  await secao.getByRole("button", { name: "Alterar e-mail" }).click();
  await expect(secao.getByText(/E-mail alterado/)).toBeVisible();
  await expect(linkDoPerfil(page)).toContainText(email);

  await page.reload();
  await expect(page).toHaveURL(/\/perfil$/);
  await expect(linkDoPerfil(page)).toContainText(email);

  await page.getByRole("button", { name: "Sair" }).click();
  await entrar(page, email);
});

test("trocar a senha mantém esta sessão e encerra as outras", async ({ page, browser }) => {
  const email = await cadastrar(page);
  const outroDispositivo = await abrirOutroDispositivo(browser);
  await entrar(outroDispositivo, email);

  await abrirPerfil(page);
  const secao = page.getByRole("region", { name: "Senha" });
  await secao.getByLabel("Senha atual").fill(SENHA);
  await secao.getByLabel("Nova senha", { exact: true }).fill(NOVA_SENHA);
  await secao.getByLabel("Confirmar nova senha").fill("outra-senha");
  await secao.getByRole("button", { name: "Alterar senha" }).click();
  await expect(secao.getByText("As senhas não coincidem.")).toBeVisible();

  await secao.getByLabel("Confirmar nova senha").fill(NOVA_SENHA);
  await secao.getByRole("button", { name: "Alterar senha" }).click();
  await expect(secao.getByText(/Senha alterada/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Meu perfil" })).toBeVisible();

  await outroDispositivo.reload();
  await expect(outroDispositivo).toHaveURL(/\/login$/);
  await entrar(outroDispositivo, email, NOVA_SENHA);

  await outroDispositivo.context().close();
});

test("o tema escolhido acompanha a conta em outro dispositivo", async ({ page, browser }) => {
  const email = await cadastrar(page);
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  const salvouEscuro = temaSalvo(page);
  await page.getByRole("button", { name: "Ativar modo escuro" }).click();
  await salvouEscuro;
  await expect(html).toHaveClass(/dark/);

  const outroDispositivo = await abrirOutroDispositivo(browser);
  await entrar(outroDispositivo, email);
  await expect(outroDispositivo.locator("html")).toHaveClass(/dark/);

  await abrirPerfil(outroDispositivo);
  const aparencia = outroDispositivo.getByRole("region", { name: "Aparência" });
  await expect(aparencia.getByLabel("Escuro")).toBeChecked();

  const salvouClaro = temaSalvo(outroDispositivo);
  await escolher(aparencia, "Claro");
  await salvouClaro;
  await expect(outroDispositivo.locator("html")).not.toHaveClass(/dark/);

  // o primeiro dispositivo recebe a nova escolha ao abrir o app de novo
  await page.reload();
  await expect(html).not.toHaveClass(/dark/);

  await outroDispositivo.context().close();
});

test("sem tema escolhido na conta, cada navegador mantém o seu", async ({ page, browser }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Ativar modo escuro" }).click();

  const email = await cadastrar(page);
  await expect(page.locator("html")).toHaveClass(/dark/);

  const outroDispositivo = await abrirOutroDispositivo(browser);
  await entrar(outroDispositivo, email);
  await expect(outroDispositivo.locator("html")).not.toHaveClass(/dark/);

  await outroDispositivo.context().close();
});

test("em Sistema, o tema segue a configuração do dispositivo", async ({ page }) => {
  await cadastrar(page);
  await abrirPerfil(page);
  const html = page.locator("html");
  const aparencia = page.getByRole("region", { name: "Aparência" });

  const salvouClaro = temaSalvo(page);
  await escolher(aparencia, "Claro");
  await salvouClaro;

  await page.emulateMedia({ colorScheme: "dark" });
  const salvouSistema = temaSalvo(page);
  await escolher(aparencia, "Sistema");
  await salvouSistema;
  await expect(html).toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();

  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(aparencia.getByLabel("Sistema")).toBeChecked();
  await expect(html).not.toHaveClass(/dark/);
});

test("admin gerencia as outras contas, mas altera as próprias credenciais só em Meu perfil", async ({ page, browser }) => {
  test.skip(!ADMIN_EMAIL || !ADMIN_SENHA, "precisa de E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD");

  const outroDispositivo = await abrirOutroDispositivo(browser);
  const email = await cadastrar(outroDispositivo);

  await entrar(page, ADMIN_EMAIL!, ADMIN_SENHA!);
  await page.getByRole("link", { name: "Usuários" }).click();
  const busca = page.getByLabel("Buscar usuários");
  const dialogo = page.getByRole("dialog");

  await busca.fill(ADMIN_EMAIL!);
  await page.getByRole("button", { name: /^Editar / }).click();
  await expect(dialogo.getByLabel("E-mail")).toBeDisabled();
  await expect(dialogo.getByLabel("Nova senha")).toBeDisabled();
  await dialogo.getByRole("button", { name: "Cancelar" }).click();

  // definir a senha de outra conta encerra as sessões dela
  await busca.fill(email);
  await page.getByRole("button", { name: "Editar Pessoa de Teste" }).click();
  await dialogo.getByLabel("Nova senha").fill(NOVA_SENHA);
  await dialogo.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Usuário atualizado.")).toBeVisible();

  await outroDispositivo.reload();
  await expect(outroDispositivo).toHaveURL(/\/login$/);
  await entrar(outroDispositivo, email, NOVA_SENHA);
  await outroDispositivo.context().close();

  // POST /usuarios continua disponível para o ADMIN
  const emailNovaConta = novoEmail();
  await page.getByRole("button", { name: "Novo usuário" }).click();
  await dialogo.getByLabel("Nome").fill("Conta do Painel");
  await dialogo.getByLabel("E-mail").fill(emailNovaConta);
  await dialogo.getByLabel("Senha").fill(SENHA);
  await dialogo.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByText("Usuário cadastrado.")).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await entrar(page, emailNovaConta);
});
