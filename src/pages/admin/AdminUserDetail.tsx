import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import { skillService } from "../../services/skillService";
import { goalService } from "../../services/goalService";
import { categoryService } from "../../services/categoryService";
import { useAuth } from "../../contexts/useAuth";
import { Perfil, type Category, type Goal, type Skill, type Usuario } from "../../types/interfaces";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { getLatestPercentage } from "../../utils/progress";
import { SKILL_LEVEL_BADGE, SKILL_LEVEL_LABELS } from "../../utils/skillLevel";
import { describeDeadline, getGoalStatus, GOAL_STATUS_BADGE } from "../../utils/goalStatus";
import Spinner from "../../components/ui/Spinner";
import Alert, { type AlertMessage } from "../../components/ui/Alert";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import UserFormDialog from "../../components/admin/UserFormDialog";
import { buttonDanger, buttonSecondary, cardClass } from "../../components/ui/styles";

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className={cardClass}>
      <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <span className="rounded bg-zinc-100 px-1.5 text-xs tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<Usuario | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      const [userData, skillsData, goalsData, categoriesData] = await Promise.all([
        adminService.getUsuario(userId),
        skillService.getUserSkills(userId),
        goalService.getUserGoals(userId),
        categoryService.getCategories(),
      ]);
      setUser(userData);
      setSkills(skillsData);
      setGoals(goalsData);
      setCategories(categoriesData);
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Não foi possível carregar o usuário.") });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    try {
      await adminService.deleteUsuario(userId);
      navigate("/admin/usuarios", { replace: true });
    } catch (error) {
      setConfirmDelete(false);
      setMessage({ type: "error", text: getApiErrorMessage(error, "Erro ao excluir o usuário.") });
    }
  };

  if (loading) return <Spinner />;

  const backLink = (
    <Link
      to="/admin/usuarios"
      className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      <ArrowLeft className="h-4 w-4" /> Usuários
    </Link>
  );

  if (!user) {
    return (
      <div className="space-y-6">
        {backLink}
        <Alert message={message ?? { type: "error", text: "Usuário não encontrado." }} />
      </div>
    );
  }

  const isSelf = user.id_usuario === currentUser?.id_usuario;
  const completedGoals = goals.filter((g) => g.completed).length;
  const averageProgress = skills.length
    ? Math.round(skills.reduce((sum, s) => sum + getLatestPercentage(s), 0) / skills.length)
    : 0;
  const getCategoryName = (categoryId: number) =>
    categories.find((c) => c.id_category === categoryId)?.name ?? "Sem categoria";
  const getSkillName = (skillId: number) => skills.find((s) => s.id_skill === skillId)?.name ?? "—";

  const stats = [
    { label: "Skills", value: String(skills.length) },
    { label: "Progresso médio", value: `${averageProgress}%` },
    { label: "Metas", value: String(goals.length) },
    { label: "Metas concluídas", value: String(completedGoals) },
  ];

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.nome} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{user.nome}</h1>
              {user.perfil === Perfil.ADMIN && (
                <Badge className="gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </Badge>
              )}
            </div>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {user.email}
              {user.data_criacao && ` · desde ${new Date(user.data_criacao).toLocaleDateString("pt-BR")}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFormOpen(true)} className={buttonSecondary}>
            <Pencil className="h-4 w-4" /> Editar
          </button>
          {!isSelf && (
            <button onClick={() => setConfirmDelete(true)} className={buttonDanger}>
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
          )}
        </div>
      </div>

      <Alert message={message} onClose={() => setMessage(null)} />

      <dl className={`${cardClass} grid grid-cols-2 divide-zinc-200 dark:divide-zinc-800 lg:grid-cols-4 lg:divide-x`}>
        {stats.map((stat) => (
          <div key={stat.label} className="px-5 py-4">
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section title="Skills" count={skills.length}>
          {skills.length === 0 ? (
            <p className="px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">Nenhuma skill cadastrada.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {skills.map((skill) => {
                const percentage = getLatestPercentage(skill);
                return (
                  <li key={skill.id_skill} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{skill.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{getCategoryName(skill.category_id)}</p>
                      </div>
                      <Badge className={SKILL_LEVEL_BADGE[skill.level]}>{SKILL_LEVEL_LABELS[skill.level]}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-1.5 rounded-full bg-emerald-600" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                        {percentage}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="Metas" count={goals.length}>
          {goals.length === 0 ? (
            <p className="px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">Nenhuma meta cadastrada.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {goals.map((goal) => {
                const badge = GOAL_STATUS_BADGE[getGoalStatus(goal)];
                return (
                  <li key={goal.id_goal} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {getSkillName(goal.skill_id)} · {describeDeadline(goal)}
                      </p>
                    </div>
                    <Badge className={badge.className}>{badge.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>

      <UserFormDialog
        open={formOpen}
        user={user}
        onClose={() => setFormOpen(false)}
        onSaved={async (text) => {
          setFormOpen(false);
          await load();
          setMessage({ type: "success", text });
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir usuário?"
        description={`${user.nome} e todos os dados dele (${skills.length} skills e ${goals.length} metas) serão excluídos permanentemente.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
