import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { profileService } from "../../services/profileService";
import { CorAvatar } from "../../types/interfaces";
import { AVATAR_COLOR_CLASSES, AVATAR_COLOR_LABELS, AVATAR_COLORS } from "../../utils/avatarColor";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import Alert, { type AlertMessage } from "../ui/Alert";
import Avatar from "../ui/Avatar";
import { buttonPrimary, inputClass, labelClass } from "../ui/styles";
import Section from "../ui/Section";

const BIO_MAX_LENGTH = 280;

export default function ProfileForm() {
  const { user, updateUser } = useAuth();
  const nomeAtual = user?.nome ?? "";
  const bioAtual = user?.bio ?? "";
  const corAtual = user?.cor_avatar ?? CorAvatar.ESMERALDA;

  const [form, setForm] = useState({ nome: nomeAtual, bio: bioAtual, cor_avatar: corAtual });
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [saving, setSaving] = useState(false);

  // a sessão é atualizada em segundo plano ao abrir o app, e o formulário acompanha esses dados
  useEffect(() => {
    setForm({ nome: nomeAtual, bio: bioAtual, cor_avatar: corAtual });
  }, [nomeAtual, bioAtual, corAtual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (form.nome.trim().length < 3) {
      setMessage({ type: "error", text: "O nome deve ter pelo menos 3 caracteres." });
      return;
    }

    setSaving(true);
    try {
      updateUser(await profileService.updateProfile({ ...form, nome: form.nome.trim() }));
      setMessage({ type: "success", text: "Perfil atualizado." });
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao salvar o perfil.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Dados pessoais" description="Como você aparece no SkillTrack.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={message} onClose={() => setMessage(null)} />

        <div className="flex items-center gap-4">
          <Avatar name={form.nome} color={form.cor_avatar} size="lg" />
          <fieldset className="min-w-0">
            <legend className={labelClass}>Cor do avatar</legend>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((cor) => {
                const selected = form.cor_avatar === cor;
                return (
                  <label
                    key={cor}
                    title={AVATAR_COLOR_LABELS[cor]}
                    className={`relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-white has-focus-visible:ring-2 has-focus-visible:ring-emerald-600/60 dark:ring-offset-zinc-900 ${AVATAR_COLOR_CLASSES[cor]} ${
                      selected ? "ring-2 ring-emerald-600" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="cor_avatar"
                      value={cor}
                      checked={selected}
                      onChange={() => setForm({ ...form, cor_avatar: cor })}
                      className="sr-only"
                    />
                    <span className="sr-only">{AVATAR_COLOR_LABELS[cor]}</span>
                    {selected && <Check className="h-4 w-4" />}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div>
          <label htmlFor="perfil-nome" className={labelClass}>
            Nome
          </label>
          <input
            id="perfil-nome"
            autoComplete="name"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={inputClass}
            maxLength={150}
            required
          />
        </div>

        <div>
          <label htmlFor="perfil-bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="perfil-bio"
            rows={3}
            placeholder="Conte um pouco sobre você e o que está aprendendo."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className={inputClass}
            maxLength={BIO_MAX_LENGTH}
          />
          <p className="mt-1 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {form.bio.length}/{BIO_MAX_LENGTH}
          </p>
        </div>

        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </Section>
  );
}
