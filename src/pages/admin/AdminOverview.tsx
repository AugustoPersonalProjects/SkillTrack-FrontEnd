import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, Pencil, Trash2, ShieldCheck, Layers, Target, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../contexts/useAuth";
import { Perfil, type AdminResumo, type AdminUsuarioResumo } from "../../types/interfaces";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import Alert, { type AlertMessage } from "../../components/ui/Alert";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import UserFormDialog from "../../components/admin/UserFormDialog";
import { buttonDanger, buttonGhost, buttonPrimary, cardClass, inputClass } from "../../components/ui/styles";

type PerfilFilter = "ALL" | Perfil;

const PERFIL_FILTER_OPTIONS: { value: PerfilFilter; label: string }[] = [
  { value: "ALL", label: "Todos os perfis" },
  { value: Perfil.USER, label: "Usuários" },
  { value: Perfil.ADMIN, label: "Administradores" },
];

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: number; hint: string; icon: LucideIcon }) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">{value}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
    </div>
  );
}

const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR");

export default function AdminOverview() {
  const { user: currentUser } = useAuth();
  const [resumo, setResumo] = useState<AdminResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AlertMessage | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [perfilFilter, setPerfilFilter] = useState<PerfilFilter>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUsuarioResumo | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUsuarioResumo | null>(null);

  const loadResumo = useCallback(async () => {
    try {
      setResumo(await adminService.getResumo());
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Não foi possível carregar os dados.") });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumo();
  }, [loadResumo]);

  const openForm = (user: AdminUsuarioResumo | null) => {
    setEditingUser(user);
    setFormOpen(true);
    setMessage(null);
  };

  const handleSaved = async (text: string) => {
    setFormOpen(false);
    await loadResumo();
    setMessage({ type: "success", text });
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await adminService.deleteUsuario(deletingUser.id_usuario);
      await loadResumo();
      setMessage({ type: "success", text: `Usuário ${deletingUser.nome} excluído.` });
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao excluir o usuário.") });
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading) return <Spinner />;

  const usuarios = resumo?.usuarios ?? [];
  const term = searchTerm.trim().toLowerCase();
  const filteredUsers = usuarios.filter(
    (u) =>
      (!term || u.nome.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) &&
      (perfilFilter === "ALL" || u.perfil === perfilFilter)
  );
  const hasFilters = term !== "" || perfilFilter !== "ALL";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Acompanhe as contas cadastradas e gerencie perfis de acesso."
        action={
          <button onClick={() => openForm(null)} className={buttonPrimary}>
            <Plus className="h-4 w-4" /> Novo usuário
          </button>
        }
      />

      <Alert message={message} onClose={() => setMessage(null)} />

      {resumo && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Usuários"
            value={resumo.totalUsuarios}
            hint={`${resumo.totalAdmins} ${resumo.totalAdmins === 1 ? "administrador" : "administradores"}`}
            icon={Users}
          />
          <StatCard label="Skills" value={resumo.totalSkills} hint={`${resumo.totalProgress} registros de progresso`} icon={Layers} />
          <StatCard label="Metas" value={resumo.totalGoals} hint={`${resumo.completedGoals} concluídas`} icon={Target} />
          <StatCard label="Categorias" value={resumo.totalCategories} hint="Disponíveis para as skills" icon={Tags} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-9`}
            aria-label="Buscar usuários"
          />
        </div>
        <Select
          value={perfilFilter}
          onChange={setPerfilFilter}
          options={PERFIL_FILTER_OPTIONS}
          className="sm:w-48"
          aria-label="Filtrar por perfil"
        />
        {hasFilters && (
          <button
            onClick={() => {
              setSearchTerm("");
              setPerfilFilter("ALL");
            }}
            className={buttonGhost}
          >
            Limpar
          </button>
        )}
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState icon={Search} title="Nenhum usuário encontrado" description="Nenhum usuário corresponde aos filtros aplicados." />
      ) : (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 text-right font-medium">Skills</th>
                <th className="px-4 py-3 text-right font-medium">Metas</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredUsers.map((u) => {
                const isSelf = u.id_usuario === currentUser?.id_usuario;
                return (
                  <tr key={u.id_usuario} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3">
                      <Link to={`/admin/usuarios/${u.id_usuario}`} className="group flex items-center gap-3">
                        <Avatar name={u.nome} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                            {u.nome}
                            {isSelf && <span className="ml-1.5 text-xs font-normal text-zinc-400">(você)</span>}
                          </p>
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{u.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {u.perfil === Perfil.ADMIN ? (
                        <Badge className="gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          <ShieldCheck className="h-3.5 w-3.5" /> Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Usuário</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{u.totalSkills}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {u.completedGoals}/{u.totalGoals}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {u.data_criacao ? formatDate(u.data_criacao) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openForm(u)}
                          className={`${buttonGhost} px-2 py-1.5`}
                          title="Editar"
                          aria-label={`Editar ${u.nome}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          disabled={isSelf}
                          className={`${buttonDanger} px-2 py-1.5`}
                          title={isSelf ? "Você não pode excluir a própria conta por aqui" : "Excluir"}
                          aria-label={`Excluir ${u.nome}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        A coluna Metas mostra concluídas / total. Clique em um usuário para ver as skills e metas dele.
      </p>

      <UserFormDialog open={formOpen} user={editingUser} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

      <ConfirmDialog
        open={deletingUser !== null}
        title="Excluir usuário?"
        description={
          deletingUser
            ? `${deletingUser.nome} e todos os dados dele (${deletingUser.totalSkills} skills e ${deletingUser.totalGoals} metas) serão excluídos permanentemente.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
}
