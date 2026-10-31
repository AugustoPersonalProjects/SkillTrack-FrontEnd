import { useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { profileService } from "../../services/profileService";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import Alert, { type AlertMessage } from "../ui/Alert";
import { buttonPrimary, inputClass, labelClass } from "../ui/styles";
import ProfileSection from "./ProfileSection";

export default function EmailForm() {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      updateUser(await profileService.changeEmail({ email, senha_atual: senhaAtual }));
      setEmail("");
      setSenhaAtual("");
      setMessage({ type: "success", text: "E-mail alterado. Use o novo endereço no próximo login." });
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao alterar o e-mail.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileSection id="perfil-email" title="E-mail" description={`O e-mail atual é ${user?.email}.`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={message} onClose={() => setMessage(null)} />

        <div>
          <label htmlFor="email-novo" className={labelClass}>
            Novo e-mail
          </label>
          <input
            id="email-novo"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            maxLength={150}
            required
          />
        </div>

        <div>
          <label htmlFor="email-senha-atual" className={labelClass}>
            Senha atual
          </label>
          <input
            id="email-senha-atual"
            type="password"
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Salvando..." : "Alterar e-mail"}
        </button>
      </form>
    </ProfileSection>
  );
}
