import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import AuthLayout from "../components/layout/AuthLayout";
import Alert from "../components/ui/Alert";
import { buttonPrimary, inputClass, labelClass } from "../components/ui/styles";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // mesmas regras do cadastro na API
    if (formData.nome.trim().length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres");
      return;
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        nome: formData.nome.trim(),
        email: formData.email,
        senha: formData.senha,
      });

      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(result.message || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fields = [
    { name: "nome", label: "Nome", type: "text", autoComplete: "name", placeholder: "Seu nome completo" },
    { name: "email", label: "E-mail", type: "email", autoComplete: "email", placeholder: "voce@exemplo.com" },
    { name: "senha", label: "Senha", type: "password", autoComplete: "new-password", placeholder: "Mínimo de 6 caracteres" },
    { name: "confirmarSenha", label: "Confirmar senha", type: "password", autoComplete: "new-password", placeholder: "" },
  ] as const;

  return (
    <AuthLayout
      title="Criar conta"
      description="Cadastre-se para começar a registrar suas skills e metas."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={error ? { type: "error", text: error } : null} />

        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className={labelClass}>
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
        ))}

        <button type="submit" disabled={isLoading} className={`${buttonPrimary} w-full`}>
          {isLoading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </AuthLayout>
  );
}
