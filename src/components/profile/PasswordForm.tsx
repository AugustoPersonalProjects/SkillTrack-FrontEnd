import { useState } from "react";
import { profileService } from "../../services/profileService";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import Alert, { type AlertMessage } from "../ui/Alert";
import { buttonPrimary, inputClass, labelClass } from "../ui/styles";
import ProfileSection from "./ProfileSection";

const EMPTY_FORM = { senhaAtual: "", novaSenha: "", confirmarSenha: "" };

export default function PasswordForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // mesma regra da API
    if (form.novaSenha.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    if (form.novaSenha !== form.confirmarSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    setSaving(true);
    try {
      await profileService.changePassword({ senha_atual: form.senhaAtual, nova_senha: form.novaSenha });
      setForm(EMPTY_FORM);
      setMessage({ type: "success", text: "Senha alterada. As sessões abertas em outros dispositivos foram encerradas." });
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao alterar a senha.") });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "senhaAtual", label: "Senha atual", autoComplete: "current-password", placeholder: "" },
    { name: "novaSenha", label: "Nova senha", autoComplete: "new-password", placeholder: "Mínimo de 6 caracteres" },
    { name: "confirmarSenha", label: "Confirmar nova senha", autoComplete: "new-password", placeholder: "" },
  ] as const;

  return (
    <ProfileSection
      id="perfil-senha"
      title="Senha"
      description="Ao trocar a senha, as sessões abertas em outros dispositivos são encerradas."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={message} onClose={() => setMessage(null)} />

        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={`senha-${field.name}`} className={labelClass}>
              {field.label}
            </label>
            <input
              id={`senha-${field.name}`}
              type="password"
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        ))}

        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Salvando..." : "Alterar senha"}
        </button>
      </form>
    </ProfileSection>
  );
}
