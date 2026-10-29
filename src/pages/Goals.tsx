import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Target, Check, Pencil, Trash2, Calendar } from "lucide-react";
import { goalService } from "../services/goalService";
import { skillService } from "../services/skillService";
import type { Goal, Skill } from "../types/interfaces";
import { useAuth } from "../contexts/useAuth";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { parseLocalDate, todayLocalISO } from "../utils/date";
import PageHeader from "../components/ui/PageHeader";
import Alert, { type AlertMessage } from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import {
  buttonDanger,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  cardClass,
  inputClass,
  labelClass,
} from "../components/ui/styles";

type GoalStatus = "pending" | "overdue" | "completed";
type StatusFilter = "all" | GoalStatus;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Em andamento" },
  { value: "overdue", label: "Atrasadas" },
  { value: "completed", label: "Concluídas" },
];

const emptyForm = { title: "", description: "", deadline: "", skillId: 0 };

// Dias entre hoje e o prazo (negativo quando o prazo já passou)
const getDaysUntil = (deadline: string) =>
  Math.round(
    (parseLocalDate(deadline).getTime() - parseLocalDate(todayLocalISO()).getTime()) / (1000 * 60 * 60 * 24)
  );

const getStatus = (goal: Goal): GoalStatus => {
  if (goal.completed) return "completed";
  if (goal.deadline && getDaysUntil(goal.deadline) < 0) return "overdue";
  return "pending";
};

const describeDeadline = (goal: Goal) => {
  if (!goal.deadline) return "Sem prazo";
  const days = getDaysUntil(goal.deadline);
  if (goal.completed) return `Prazo ${parseLocalDate(goal.deadline).toLocaleDateString("pt-BR")}`;
  if (days < 0) return `Atrasada há ${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"}`;
  if (days === 0) return "Vence hoje";
  return `${days} ${days === 1 ? "dia restante" : "dias restantes"}`;
};

const STATUS_BADGE: Record<GoalStatus, { label: string; className: string }> = {
  pending: { label: "Em andamento", className: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
  overdue: { label: "Atrasada", className: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" },
  completed: {
    label: "Concluída",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
};

export default function Goals() {
  const { user } = useAuth();
  const userId = user?.id_usuario ?? 0;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState<AlertMessage | null>(null);

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [skillFilter, setSkillFilter] = useState(0);

  const loadGoals = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await goalService.getUserGoals(userId);
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      setMessage({ type: "error", text: "Não foi possível carregar as metas." });
      setGoals([]);
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [, skillsData] = await Promise.all([loadGoals(), skillService.getUserSkills(userId)]);
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      } catch (error) {
        console.error("Erro ao carregar skills:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadGoals, userId]);

  const getSkillName = (skillId: number) => skills.find((s) => s.id_skill === skillId)?.name ?? "Skill removida";

  const openNewForm = () => {
    setEditingGoal(null);
    setFormData(emptyForm);
    setShowForm(true);
    setMessage(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      deadline: goal.deadline || "",
      skillId: goal.skill_id,
    });
    setShowForm(true);
    setMessage(null);
  };

  const closeForm = () => {
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.title.trim()) return setMessage({ type: "error", text: "O título é obrigatório." });
    if (!formData.skillId) return setMessage({ type: "error", text: "Selecione uma skill." });
    if (!formData.deadline) return setMessage({ type: "error", text: "Informe o prazo." });
    // datas "yyyy-MM-dd" podem ser comparadas como texto
    if (formData.deadline < todayLocalISO()) {
      return setMessage({ type: "error", text: "O prazo deve ser hoje ou uma data futura." });
    }

    const goalData = {
      title: formData.title.trim(),
      description: formData.description,
      deadline: formData.deadline,
      skill_id: formData.skillId,
      user_id: userId,
    };

    try {
      if (editingGoal) {
        await goalService.updateGoal(editingGoal.id_goal, goalData);
        setMessage({ type: "success", text: "Meta atualizada." });
      } else {
        await goalService.createGoal(goalData);
        setMessage({ type: "success", text: "Meta criada." });
      }
      closeForm();
      await loadGoals();
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao salvar a meta.") });
    }
  };

  const handleComplete = async (goal: Goal) => {
    try {
      setMessage(null);
      await goalService.completeGoal(goal.id_goal);
      setMessage({ type: "success", text: `Meta "${goal.title}" concluída.` });
      await loadGoals();
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao concluir a meta.") });
    }
  };

  const handleDelete = async (goal: Goal) => {
    if (!confirm(`Excluir a meta "${goal.title}"?`)) return;
    try {
      setMessage(null);
      await goalService.deleteGoal(goal.id_goal);
      setMessage({ type: "success", text: "Meta excluída." });
      await loadGoals();
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao excluir a meta.") });
    }
  };

  const term = searchTerm.trim().toLowerCase();
  // busca e skill filtram a lista; o status é aplicado por último para as abas mostrarem a contagem de cada um
  const searchedGoals = goals.filter(
    (goal) =>
      (!term || goal.title?.toLowerCase().includes(term) || goal.description?.toLowerCase().includes(term)) &&
      (!skillFilter || goal.skill_id === skillFilter)
  );
  const countByStatus = (status: StatusFilter) =>
    status === "all" ? searchedGoals.length : searchedGoals.filter((g) => getStatus(g) === status).length;
  const filteredGoals = searchedGoals
    .filter((goal) => statusFilter === "all" || getStatus(goal) === statusFilter)
    // pendentes primeiro, ordenadas pelo prazo mais próximo
    .sort(
      (a, b) =>
        Number(a.completed) - Number(b.completed) || (a.deadline || "9999").localeCompare(b.deadline || "9999")
    );

  const hasFilters = term !== "" || skillFilter !== 0 || statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSkillFilter(0);
    setStatusFilter("all");
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas"
        description="Defina objetivos para suas skills e acompanhe os prazos."
        action={
          <button onClick={openNewForm} className={buttonPrimary} disabled={skills.length === 0}>
            <Plus className="h-4 w-4" /> Nova meta
          </button>
        }
      />

      <Alert message={message} onClose={() => setMessage(null)} />

      {showForm && (
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4 p-5`}>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {editingGoal ? "Editar meta" : "Nova meta"}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="goal-title" className={labelClass}>
                Título
              </label>
              <input
                id="goal-title"
                type="text"
                placeholder="Ex.: Concluir o curso de Spring Security"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                maxLength={150}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="goal-description" className={labelClass}>
                Descrição <span className="font-normal text-zinc-400">(opcional)</span>
              </label>
              <textarea
                id="goal-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClass}
                rows={2}
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="goal-skill" className={labelClass}>
                Skill
              </label>
              <select
                id="goal-skill"
                value={formData.skillId}
                onChange={(e) => setFormData({ ...formData, skillId: Number(e.target.value) })}
                className={inputClass}
                required
              >
                <option value={0}>Selecione</option>
                {skills.map((skill) => (
                  <option key={skill.id_skill} value={skill.id_skill}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="goal-deadline" className={labelClass}>
                Prazo
              </label>
              <input
                id="goal-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={inputClass}
                min={todayLocalISO()}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className={buttonPrimary}>
              {editingGoal ? "Salvar alterações" : "Criar meta"}
            </button>
            <button type="button" onClick={closeForm} className={buttonSecondary}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {goals.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800" role="tablist">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-emerald-600 text-zinc-900 dark:text-zinc-100"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {tab.label}
                  <span className="rounded bg-zinc-100 px-1.5 text-xs tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {countByStatus(tab.value)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                placeholder="Buscar por título ou descrição"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9`}
                aria-label="Buscar metas"
              />
            </div>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(Number(e.target.value))}
              className={`${inputClass} sm:w-56`}
              aria-label="Filtrar por skill"
            >
              <option value={0}>Todas as skills</option>
              {skills.map((skill) => (
                <option key={skill.id_skill} value={skill.id_skill}>
                  {skill.name}
                </option>
              ))}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className={buttonGhost}>
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta cadastrada"
          description={
            skills.length === 0
              ? "Cadastre uma skill antes de criar metas para ela."
              : "Defina objetivos com prazo para as suas skills."
          }
          action={
            skills.length > 0 &&
            !showForm && (
              <button onClick={openNewForm} className={buttonPrimary}>
                <Plus className="h-4 w-4" /> Nova meta
              </button>
            )
          }
        />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma meta encontrada"
          description="Nenhuma meta corresponde aos filtros aplicados."
          action={
            <button onClick={clearFilters} className={buttonSecondary}>
              Limpar filtros
            </button>
          }
        />
      ) : (
        <ul className={`${cardClass} divide-y divide-zinc-100 dark:divide-zinc-800`}>
          {filteredGoals.map((goal) => {
            const status = getStatus(goal);
            const badge = STATUS_BADGE[status];

            return (
              <li key={goal.id_goal} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm font-semibold ${
                        goal.completed
                          ? "text-zinc-500 line-through dark:text-zinc-500"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {goal.title}
                    </h3>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                  </div>
                  {goal.description && goal.description !== goal.title && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{goal.description}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{getSkillName(goal.skill_id)}</span>
                    <span className={`flex items-center gap-1 ${status === "overdue" ? "text-red-600 dark:text-red-400" : ""}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      {describeDeadline(goal)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!goal.completed && (
                    <>
                      <button onClick={() => handleComplete(goal)} className={`${buttonSecondary} py-1.5`}>
                        <Check className="h-4 w-4" /> Concluir
                      </button>
                      <button
                        onClick={() => handleEdit(goal)}
                        className={`${buttonGhost} px-2 py-1.5`}
                        title="Editar"
                        aria-label={`Editar ${goal.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(goal)}
                    className={`${buttonDanger} px-2 py-1.5`}
                    title="Excluir"
                    aria-label={`Excluir ${goal.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
