import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import AuthLayout from "../components/layout/AuthLayout";
import Alert from "../components/ui/Alert";
import { buttonPrimary, inputClass, labelClass } from "../components/ui/styles";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, senha);
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Erro ao fazer login. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Entrar"
      description="Acesse sua conta para acompanhar suas skills e metas."
      footer={
        <>
          Não tem uma conta?{" "}
          <Link to="/register" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={error ? { type: "error", text: error } : null} />

        <div>
          <label htmlFor="email" className={labelClass}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="senha" className={labelClass}>
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <button type="submit" disabled={isLoading} className={`${buttonPrimary} w-full`}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
