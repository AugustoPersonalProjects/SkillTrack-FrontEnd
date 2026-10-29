import { useEffect, useState } from "react";
import Dialog, { DialogFooter } from "../ui/Dialog";
import Select from "../ui/Select";
import Alert from "../ui/Alert";
import { buttonPrimary, buttonSecondary, inputClass, labelClass } from "../ui/styles";
import { Perfil, type Usuario } from "../../types/interfaces";
import { adminService } from "../../services/adminService";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

const PERFIL_OPTIONS = [
  { value: Perfil.USER, label: "Usuário" },
  { value: Perfil.ADMIN, label: "Administrador" },
];

interface UserFormDialogProps {
  open: boolean;
  // usuário em edição; ausente para cadastrar um novo
  user?: Usuario | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export default function UserFormDialog({ open, user, onClose, onSaved }: UserFormDialogProps) {
  const isEditing = Boolean(user);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", perfil: Perfil.USER as Perfil });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      nome: user?.nome ?? "",
      email: user?.email ?? "",
      senha: "",
      perfil: user?.perfil ?? Perfil.USER,
    });
    setError("");
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.nome.trim().length < 3) return setError("O nome deve ter pelo menos 3 caracteres.");
    if (!isEditing && form.senha.length < 6) return setError("A senha deve ter pelo menos 6 caracteres.");
    if (isEditing && form.senha && form.senha.length < 6) {
      return setError("A nova senha deve ter pelo menos 6 caracteres.");
    }

    setSaving(true);
    try {
      const data = { ...form, nome: form.nome.trim() };
      if (user) {
        await adminService.updateUsuario(user.id_usuario, data);
        onSaved("Usuário atualizado.");
      } else {
        await adminService.createUsuario(data);
        onSaved("Usuário cadastrado.");
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Erro ao salvar o usuário."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar usuário" : "Novo usuário"}
      description={
        isEditing
          ? "Alterar o e-mail encerra a sessão atual desse usuário."
          : "O usuário poderá entrar com o e-mail e a senha definidos aqui."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert message={error ? { type: "error", text: error } : null} />

        <div>
          <label htmlFor="user-nome" className={labelClass}>
            Nome
          </label>
          <input
            id="user-nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={inputClass}
            maxLength={150}
            required
          />
        </div>
        <div>
          <label htmlFor="user-email" className={labelClass}>
            E-mail
          </label>
          <input
            id="user-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            maxLength={150}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="user-senha" className={labelClass}>
              {isEditing ? "Nova senha" : "Senha"}
            </label>
            <input
              id="user-senha"
              type="password"
              autoComplete="new-password"
              placeholder={isEditing ? "Manter a atual" : "Mínimo de 6 caracteres"}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className={inputClass}
              required={!isEditing}
            />
          </div>
          <div>
            <label htmlFor="user-perfil" className={labelClass}>
              Perfil
            </label>
            <Select
              id="user-perfil"
              value={form.perfil}
              onChange={(perfil) => setForm({ ...form, perfil })}
              options={PERFIL_OPTIONS}
            />
          </div>
        </div>

        <DialogFooter>
          <button type="button" onClick={onClose} className={buttonSecondary}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={buttonPrimary}>
            {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar"}
          </button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
