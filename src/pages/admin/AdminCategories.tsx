import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { categoryService } from "../../services/categoryService";
import type { Category } from "../../types/interfaces";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import Alert, { type AlertMessage } from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import Dialog, { DialogFooter } from "../../components/ui/Dialog";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import {
  buttonDanger,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  cardClass,
  inputClass,
  labelClass,
} from "../../components/ui/styles";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AlertMessage | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setCategories(await categoryService.getCategories());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (category: Category | null) => {
    setEditing(category);
    setForm({ name: category?.name ?? "", description: category?.description ?? "" });
    setFormError("");
    setMessage(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("O nome é obrigatório.");

    setSaving(true);
    try {
      const data = { name: form.name.trim(), description: form.description.trim() || undefined };
      if (editing) {
        await categoryService.updateCategory(editing.id_category, data);
      } else {
        await categoryService.createCategory(data);
      }
      setFormOpen(false);
      await load();
      setMessage({ type: "success", text: editing ? "Categoria atualizada." : "Categoria criada." });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Erro ao salvar a categoria."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await categoryService.deleteCategory(deleting.id_category);
      await load();
      setMessage({ type: "success", text: `Categoria ${deleting.name} excluída.` });
    } catch (error) {
      // a API recusa excluir categorias com skills vinculadas
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao excluir a categoria.") });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Áreas de conhecimento disponíveis para os usuários classificarem as skills."
        action={
          <button onClick={() => openForm(null)} className={buttonPrimary}>
            <Plus className="h-4 w-4" /> Nova categoria
          </button>
        }
      />

      <Alert message={message} onClose={() => setMessage(null)} />

      {categories.length === 0 ? (
        <EmptyState icon={Tags} title="Nenhuma categoria" description="Crie categorias para os usuários organizarem as skills." />
      ) : (
        <ul className={`${cardClass} divide-y divide-zinc-100 dark:divide-zinc-800`}>
          {categories.map((category) => (
            <li key={category.id_category} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{category.name}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{category.description || "Sem descrição"}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => openForm(category)}
                  className={`${buttonGhost} px-2 py-1.5`}
                  title="Editar"
                  aria-label={`Editar ${category.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleting(category)}
                  className={`${buttonDanger} px-2 py-1.5`}
                  title="Excluir"
                  aria-label={`Excluir ${category.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar categoria" : "Nova categoria"}
        description="As categorias aparecem para todos os usuários no cadastro de skills."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert message={formError ? { type: "error", text: formError } : null} />
          <div>
            <label htmlFor="category-name" className={labelClass}>
              Nome
            </label>
            <input
              id="category-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              maxLength={100}
              required
            />
          </div>
          <div>
            <label htmlFor="category-description" className={labelClass}>
              Descrição <span className="font-normal text-zinc-400">(opcional)</span>
            </label>
            <textarea
              id="category-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              rows={2}
              maxLength={255}
            />
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setFormOpen(false)} className={buttonSecondary}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className={buttonPrimary}>
              {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar categoria"}
            </button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir categoria?"
        description={
          deleting
            ? `A categoria ${deleting.name} será excluída. Categorias com skills vinculadas não podem ser excluídas.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
