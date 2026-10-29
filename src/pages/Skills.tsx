import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Layers, TrendingUp } from "lucide-react";
import { skillService } from "../services/skillService";
import { categoryService } from "../services/categoryService";
import { progressService } from "../services/progressService";
import { type Skill, type SkillRequest, type Category, SkillLevel } from "../types/interfaces";
import { useAuth } from "../contexts/useAuth";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { getLatestPercentage } from "../utils/progress";
import { SKILL_LEVELS, SKILL_LEVEL_BADGE, SKILL_LEVEL_LABELS } from "../utils/skillLevel";
import PageHeader from "../components/ui/PageHeader";
import Alert, { type AlertMessage } from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Dialog, { DialogFooter } from "../components/ui/Dialog";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  buttonDanger,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  cardClass,
  inputClass,
  labelClass,
} from "../components/ui/styles";

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

const emptyForm = (userId: number): SkillRequest => ({
  name: "",
  description: "",
  categoryId: 0,
  level: SkillLevel.BEGINNER,
  userId,
});

export default function Skills() {
  const { user } = useAuth();
  const userId = user?.id_usuario ?? 0;
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<SkillRequest>(emptyForm(userId));
  const [message, setMessage] = useState<AlertMessage | null>(null);
  // erros do formulário aparecem dentro do diálogo
  const [formError, setFormError] = useState("");
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [levelFilter, setLevelFilter] = useState<SkillLevel | "">("");

  // skill com o formulário de progresso aberto e o valor digitado
  const [progressSkillId, setProgressSkillId] = useState<number | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const loadSkills = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await skillService.getUserSkills(userId);
      setSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      setMessage({ type: "error", text: "Não foi possível carregar as skills." });
      setSkills([]);
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [, data] = await Promise.all([loadSkills(), categoryService.getCategories()]);
      setCategories(data);
      setLoading(false);
    };
    load();
  }, [loadSkills]);

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id_category === id)?.name ?? "Sem categoria";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("O nome da skill é obrigatório.");
      return;
    }
    if (!formData.categoryId) {
      setFormError("Selecione uma categoria.");
      return;
    }

    // a skill sempre pertence ao usuário logado
    const skillData = { ...formData, name: formData.name.trim(), userId };

    try {
      if (editingSkill) {
        await skillService.updateSkill(editingSkill.id_skill, skillData);
        setMessage({ type: "success", text: "Skill atualizada." });
      } else {
        await skillService.createSkill(skillData);
        setMessage({ type: "success", text: "Skill criada." });
      }
      closeForm();
      await loadSkills();
    } catch (error: unknown) {
      setFormError(getApiErrorMessage(error, "Erro ao salvar a skill."));
    }
  };

  const openNewForm = () => {
    setEditingSkill(null);
    setFormData(emptyForm(userId));
    setFormError("");
    setShowForm(true);
    setMessage(null);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || "",
      categoryId: skill.category_id,
      level: skill.level,
      userId,
    });
    setFormError("");
    setShowForm(true);
    setMessage(null);
  };

  const closeForm = () => {
    setEditingSkill(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deletingSkill) return;
    try {
      await skillService.deleteSkill(deletingSkill.id_skill);
      await loadSkills();
      setMessage({ type: "success", text: "Skill excluída." });
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao excluir a skill.") });
    } finally {
      setDeletingSkill(null);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c.id_category, label: c.name }));
  const levelOptions = SKILL_LEVELS.map((level) => ({ value: level, label: SKILL_LEVEL_LABELS[level] }));

  const openProgressForm = (skill: Skill) => {
    setProgressSkillId(skill.id_skill);
    setProgressValue(getLatestPercentage(skill));
    setMessage(null);
  };

  const handleSaveProgress = async (skillId: number) => {
    if (!Number.isInteger(progressValue) || progressValue < 0 || progressValue > 100) {
      setMessage({ type: "error", text: "O progresso deve ser um número inteiro entre 0 e 100." });
      return;
    }

    try {
      await progressService.createProgress({ skill_id: skillId, percentage: progressValue });
      setProgressSkillId(null);
      await loadSkills();
      setMessage({ type: "success", text: "Progresso registrado." });
    } catch (error: unknown) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao registrar o progresso.") });
    }
  };

  const hasFilters = searchTerm !== "" || categoryFilter !== 0 || levelFilter !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter(0);
    setLevelFilter("");
  };

  const term = searchTerm.trim().toLowerCase();
  const filteredSkills = skills.filter(
    (skill) =>
      (!term ||
        skill.name.toLowerCase().includes(term) ||
        skill.description?.toLowerCase().includes(term)) &&
      (!categoryFilter || skill.category_id === categoryFilter) &&
      (!levelFilter || skill.level === levelFilter)
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Gerencie suas habilidades e registre o seu progresso."
        action={
          <button onClick={openNewForm} className={buttonPrimary}>
            <Plus className="h-4 w-4" /> Nova skill
          </button>
        }
      />

      <Alert message={message} onClose={() => setMessage(null)} />

      <Dialog
        open={showForm}
        onClose={closeForm}
        title={editingSkill ? "Editar skill" : "Nova skill"}
        description="Defina a categoria e o seu nível atual nesta habilidade."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert message={formError ? { type: "error", text: formError } : null} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="skill-name" className={labelClass}>
                Nome
              </label>
              <input
                id="skill-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Ex.: Spring Boot, React, Docker"
                maxLength={100}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="skill-description" className={labelClass}>
                Descrição <span className="font-normal text-zinc-400">(opcional)</span>
              </label>
              <textarea
                id="skill-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClass}
                rows={2}
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="skill-category" className={labelClass}>
                Categoria
              </label>
              <Select
                id="skill-category"
                value={formData.categoryId}
                onChange={(categoryId) => setFormData({ ...formData, categoryId })}
                options={categoryOptions}
                placeholder="Selecione"
              />
            </div>

            <div>
              <label htmlFor="skill-level" className={labelClass}>
                Nível
              </label>
              <Select
                id="skill-level"
                value={formData.level}
                onChange={(level) => setFormData({ ...formData, level })}
                options={levelOptions}
              />
            </div>
          </div>

          <DialogFooter>
            <button type="button" onClick={closeForm} className={buttonSecondary}>
              Cancelar
            </button>
            <button type="submit" className={buttonPrimary}>
              {editingSkill ? "Salvar alterações" : "Criar skill"}
            </button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deletingSkill !== null}
        title="Excluir skill?"
        description={
          deletingSkill
            ? `A skill ${deletingSkill.name} será excluída junto com as metas e os registros de progresso dela.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingSkill(null)}
      />

      {skills.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Buscar por nome ou descrição"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-9`}
              aria-label="Buscar skills"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: 0, label: "Todas as categorias" }, ...categoryOptions]}
            className="sm:w-48"
            aria-label="Filtrar por categoria"
          />
          <Select<SkillLevel | "">
            value={levelFilter}
            onChange={setLevelFilter}
            options={[{ value: "", label: "Todos os níveis" }, ...levelOptions]}
            className="sm:w-44"
            aria-label="Filtrar por nível"
          />
          {hasFilters && (
            <button onClick={clearFilters} className={buttonGhost}>
              Limpar
            </button>
          )}
        </div>
      )}

      {skills.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhuma skill cadastrada"
          description="Cadastre as habilidades que você quer desenvolver e registre o progresso de cada uma."
          action={
            !showForm && (
              <button onClick={openNewForm} className={buttonPrimary}>
                <Plus className="h-4 w-4" /> Nova skill
              </button>
            )
          }
        />
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma skill encontrada"
          description="Nenhuma skill corresponde aos filtros aplicados."
          action={
            <button onClick={clearFilters} className={buttonSecondary}>
              Limpar filtros
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {filteredSkills.length} de {skills.length} skills
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSkills.map((skill) => {
              const percentage = getLatestPercentage(skill);

              return (
                <article key={skill.id_skill} className={`${cardClass} flex flex-col p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{getCategoryName(skill.category_id)}</p>
                    </div>
                    <Badge className={SKILL_LEVEL_BADGE[skill.level]}>{SKILL_LEVEL_LABELS[skill.level]}</Badge>
                  </div>

                  {skill.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{skill.description}</p>
                  )}

                  <div className="mt-auto pt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">Progresso</span>
                      <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-1.5 rounded-full bg-emerald-600" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {plural(skill.progress_history?.length || 0, "registro", "registros")} ·{" "}
                      {plural(skill.goals?.length || 0, "meta", "metas")}
                    </p>

                    {progressSkillId === skill.id_skill && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={progressValue}
                          onChange={(e) => setProgressValue(Number(e.target.value))}
                          className={`${inputClass} w-20 py-1.5`}
                          aria-label="Progresso em porcentagem"
                          autoFocus
                        />
                        <span className="text-sm text-zinc-500">%</span>
                        <button onClick={() => handleSaveProgress(skill.id_skill)} className={`${buttonPrimary} py-1.5`}>
                          Salvar
                        </button>
                        <button onClick={() => setProgressSkillId(null)} className={`${buttonGhost} py-1.5`}>
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <button onClick={() => openProgressForm(skill)} className={`${buttonGhost} px-2 py-1.5`}>
                      <TrendingUp className="h-4 w-4" /> Registrar progresso
                    </button>
                    <button
                      onClick={() => handleEdit(skill)}
                      className={`${buttonGhost} ml-auto px-2 py-1.5`}
                      title="Editar"
                      aria-label={`Editar ${skill.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSkill(skill)}
                      className={`${buttonDanger} px-2 py-1.5`}
                      title="Excluir"
                      aria-label={`Excluir ${skill.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
