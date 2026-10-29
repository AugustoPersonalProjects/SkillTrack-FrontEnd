import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Target, TrendingUp, CircleDashed, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { dashboardService } from "../services/dashboardService";
import { skillService } from "../services/skillService";
import type { DashboardData, Goal } from "../types/interfaces";
import { parseLocalDate, todayLocalISO } from "../utils/date";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { buttonPrimary, cardClass } from "../components/ui/styles";

const formatDate = (date: string) => parseLocalDate(date).toLocaleDateString("pt-BR");

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: LucideIcon }) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
    </div>
  );
}

function SectionCard({ title, link, children }: { title: string; link?: { to: string; label: string }; children: React.ReactNode }) {
  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        {link && (
          <Link
            to={link.to}
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {link.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function GoalStatus({ goal }: { goal: Goal }) {
  if (goal.completed) {
    return <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Concluída</span>;
  }
  if (goal.deadline && goal.deadline < todayLocalISO()) {
    return <span className="text-xs font-medium text-red-600 dark:text-red-400">Atrasada</span>;
  }
  return <span className="text-xs text-zinc-500 dark:text-zinc-400">Em andamento</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [skillNames, setSkillNames] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!user?.id_usuario) return;

    try {
      setLoading(true);
      setError("");
      // as estatísticas vêm prontas da API; as skills só são usadas para exibir o nome nos registros
      const [dashboard, skills] = await Promise.all([
        dashboardService.getDashboard(),
        skillService.getUserSkills(user.id_usuario),
      ]);
      setData(dashboard);
      setSkillNames(new Map(skills.map((s) => [s.id_skill, s.name])));
    } catch (err) {
      console.error("Erro ao carregar o dashboard:", err);
      setError("Não foi possível carregar o dashboard. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }, [user?.id_usuario]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <Spinner />;

  const firstName = user?.nome?.split(" ")[0] || "";

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Visão geral" />
        <Alert message={{ type: "error", text: error || "Dados indisponíveis." }} />
      </div>
    );
  }

  const skillsProgress = data.skillNames
    .map((name, i) => ({ name, value: Math.round(data.skillProgressValues[i] ?? 0) }))
    .sort((a, b) => b.value - a.value);
  const skillsWithoutProgress = skillsProgress.filter((s) => s.value === 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        description={firstName ? `Olá, ${firstName}. Este é o resumo da sua evolução.` : "Resumo da sua evolução."}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Skills" value={String(data.totalSkills)} hint="Habilidades cadastradas" icon={Layers} />
        <StatCard label="Metas" value={String(data.totalGoals)} hint="Metas cadastradas" icon={Target} />
        <StatCard
          label="Progresso médio"
          value={`${Math.round(data.averageProgress)}%`}
          hint="Média de todos os registros"
          icon={TrendingUp}
        />
        <StatCard
          label="Sem progresso"
          value={String(skillsWithoutProgress)}
          hint="Skills ainda sem registro"
          icon={CircleDashed}
        />
      </div>

      {data.totalSkills === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhuma skill cadastrada"
          description="Cadastre sua primeira skill para começar a acompanhar o seu progresso."
          action={
            <Link to="/skills" className={buttonPrimary}>
              <Plus className="h-4 w-4" /> Nova skill
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionCard title="Progresso por skill" link={{ to: "/skills", label: "Ver skills" }}>
              <ul className="space-y-4">
                {skillsProgress.map((skill, i) => (
                  <li key={`${skill.name}-${i}`}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="truncate text-zinc-700 dark:text-zinc-300">{skill.name}</span>
                      <span className="ml-4 font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                        {skill.value}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-1.5 rounded-full bg-emerald-600" style={{ width: `${skill.value}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Próximas metas" link={{ to: "/goals", label: "Ver metas" }}>
              {data.goals.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhuma meta cadastrada.</p>
              ) : (
                <ul className="-my-2 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.goals.map((goal) => (
                    <li key={goal.id_goal} className="flex items-center justify-between gap-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {goal.deadline ? `Prazo ${formatDate(goal.deadline)}` : "Sem prazo"}
                        </p>
                      </div>
                      <GoalStatus goal={goal} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Registros recentes">
              {data.progressList.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Nenhum progresso registrado. Registre pelo card da skill na página de Skills.
                </p>
              ) : (
                <ul className="-my-2 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.progressList.map((progress) => (
                    <li key={progress.id_progress} className="flex items-center justify-between gap-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {skillNames.get(progress.skill_id) ?? "Skill"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {progress.date ? formatDate(progress.date) : "Sem data"}
                        </p>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                        {progress.percentage}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
