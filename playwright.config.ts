import { defineConfig, devices } from "@playwright/test";

const API_URL = process.env.E2E_API_URL ?? "http://localhost:8080";
const FRONT_PORT = 5174;

// A API precisa estar rodando. O front sobe aqui, em uma porta própria e apontando para API_URL,
// para que os testes nunca usem a API de um .env local nem criem dados em produção.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${FRONT_PORT}`,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${FRONT_PORT} --strictPort`,
    url: `http://localhost:${FRONT_PORT}`,
    reuseExistingServer: false,
    env: { VITE_API_URL: API_URL },
  },
});
