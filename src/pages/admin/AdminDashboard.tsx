import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, CheckCircle2, Clock, Target, TrendingUp, Users } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { AdminDashboard as AdminDashboardData } from "../../types/interfaces";
import {
  dropLeadingEmptyMonths,
  foldCategories,
  formatMonthLong,
  formatMonthShort,
  formatWeekLong,
  formatWeekShort,
  percentOf,
} from "../../utils/adminDashboard";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { SKILL_LEVEL_LABELS } from "../../utils/skillLevel";
import ChartCard from "../../components/admin/dashboard/ChartCard";
import ColumnChart from "../../components/admin/dashboard/ColumnChart";
import RankedBars from "../../components/admin/dashboard/RankedBars";
import SegmentedBar from "../../components/admin/dashboard/SegmentedBar";
import TrendChart from "../../components/admin/dashboard/TrendChart";
import Alert from "../../components/ui/Alert";
import Avatar from "../../components/ui/Avatar";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import Spinner from "../../components/ui/Spinner";
import StatCard from "../../components/ui/StatCard";

const plural = (quantidade: number, umItem: string, varios: string) =>
  `${quantidade} ${quantidade === 1 ? umItem : varios}`;

const EmptyChart = ({ text }: { text: string }) => (
  <p className="flex h-60 items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">{text}</p>
);

const REGISTROS_SERIES = [
  { dataKey: "skills", name: "Skills criadas", color: "var(--chart-serie-1)" },
  { dataKey: "metas", name: "Metas criadas", color: "var(--chart-serie-2)" },
  { dataKey: "metasConcluidas", name: "Metas concluídas", color: "var(--chart-serie-3)" },
];

const NOVOS_USUARIOS_SERIES = [{ dataKey: "total", name: "Novos usuários", color: "var(--chart-serie-1)" }];

const NIVEL_CORES = ["var(--chart-nivel-1)", "var(--chart-nivel-2)", "var(--chart-nivel-3)", "var(--chart-nivel-4)"];

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getDashboard()
      .then(setData)
      .catch((err: unknown) => setError(getApiErrorMessage(err, "Não foi possível carregar o painel.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Painel" />
        <Alert message={{ type: "error", text: error || "Dados indisponíveis." }} />
      </div>
    );
  }

  const { indicadores } = data;
  const metasEmAndamento = indicadores.totalGoals - indicadores.completedGoals - indicadores.overdueGoals;

  const novosUsuarios = data.novosUsuariosPorMes.map((mes) => ({
    ...mes,
    rotulo: formatMonthShort(mes.periodo),
    rotuloCompleto: formatMonthLong(mes.periodo),
  }));
  const totalNovosUsuarios = novosUsuarios.reduce((sum, mes) => sum + mes.total, 0);

  const progressos = data.progressosPorSemana.map((semana) => ({
    ...semana,
    rotulo: formatWeekShort(semana.periodo),
    rotuloCompleto: formatWeekLong(semana.periodo),
  }));
  const totalProgressos = progressos.reduce((sum, semana) => sum + semana.total, 0);

  const registros = dropLeadingEmptyMonths(data.registrosPorMes).map((mes) => ({
    ...mes,
    rotulo: formatMonthShort(mes.periodo),
    rotuloCompleto: formatMonthLong(mes.periodo),
  }));

  const categorias = foldCategories(data.skillsPorCategoria);

  return (
    <div className="space-y-6">
      <PageHeader title="Painel" description="Como a plataforma está sendo usada." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Usuários"
          value={indicadores.totalUsuarios}
          hint={`${plural(indicadores.novosUsuarios30Dias, "novo", "novos")} em 30 dias`}
          icon={Users}
        />
        <StatCard
          label="Usuários ativos"
          value={indicadores.usuariosAtivos30Dias}
          hint={`${percentOf(indicadores.usuariosAtivos30Dias, indicadores.totalUsuarios)}% com progresso em 30 dias`}
          icon={Activity}
        />
        <StatCard
          label="Progresso médio"
          value={`${indicadores.progressoMedio}%`}
          hint={indicadores.totalSkills > 0 ? `Média de ${plural(indicadores.totalSkills, "skill", "skills")}` : "Nenhuma skill cadastrada"}
          icon={TrendingUp}
        />
        <StatCard
          label="Metas concluídas"
          value={`${percentOf(indicadores.completedGoals, indicadores.totalGoals)}%`}
          hint={indicadores.totalGoals > 0 ? `${indicadores.completedGoals} de ${plural(indicadores.totalGoals, "meta", "metas")}` : "Nenhuma meta cadastrada"}
          icon={Target}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Novos usuários"
          description={`${plural(totalNovosUsuarios, "conta criada", "contas criadas")} nos últimos 12 meses.`}
          table={{
            headers: ["Mês", "Novos usuários"],
            rows: novosUsuarios.map((mes) => [mes.rotuloCompleto, mes.total]),
          }}
        >
          {totalNovosUsuarios === 0 ? (
            <EmptyChart text="Nenhuma conta criada nos últimos 12 meses." />
          ) : (
            <ColumnChart data={novosUsuarios} series={NOVOS_USUARIOS_SERIES} />
          )}
        </ChartCard>

        <ChartCard
          title="Atividade"
          description={`${plural(totalProgressos, "registro de progresso", "registros de progresso")} nas últimas 12 semanas.`}
          table={{
            headers: ["Semana", "Registros"],
            rows: progressos.map((semana) => [semana.rotuloCompleto, semana.total]),
          }}
        >
          {totalProgressos === 0 ? (
            <EmptyChart text="Nenhum progresso registrado nas últimas 12 semanas." />
          ) : (
            <TrendChart data={progressos} name="Registros de progresso" />
          )}
        </ChartCard>

        <ChartCard
          title="Skills e metas criadas"
          description={
            data.skillsSemData + data.metasSemData > 0
              ? `Por mês. ${plural(data.skillsSemData, "skill", "skills")} e ${plural(data.metasSemData, "meta", "metas")} mais antigas não têm data e ficam de fora.`
              : "Por mês, nos últimos 12 meses."
          }
          table={{
            headers: ["Mês", "Skills", "Metas", "Concluídas"],
            rows: registros.map((mes) => [mes.rotuloCompleto, mes.skills, mes.metas, mes.metasConcluidas]),
          }}
        >
          {registros.length === 0 ? (
            <EmptyChart text="Ainda não há skills ou metas com data de criação." />
          ) : (
            <ColumnChart data={registros} series={REGISTROS_SERIES} height={320} />
          )}
        </ChartCard>

        <div className="space-y-6">
          <Section title="Situação das metas" description={`${plural(indicadores.totalGoals, "meta cadastrada", "metas cadastradas")}.`}>
            <SegmentedBar
              parts={[
                { label: "Concluídas", value: indicadores.completedGoals, color: "var(--chart-meta-concluida)", icon: CheckCircle2 },
                { label: "Em andamento", value: metasEmAndamento, color: "var(--chart-meta-andamento)", icon: Clock },
                { label: "Atrasadas", value: indicadores.overdueGoals, color: "var(--chart-meta-atrasada)", icon: AlertTriangle },
              ]}
            />
          </Section>

          <Section title="Skills por nível" description={`${plural(indicadores.totalSkills, "skill cadastrada", "skills cadastradas")}.`}>
            <SegmentedBar
              parts={data.skillsPorNivel.map((item, i) => ({
                label: SKILL_LEVEL_LABELS[item.nivel],
                value: item.total,
                color: NIVEL_CORES[i],
              }))}
            />
          </Section>
        </div>

        <Section title="Skills por categoria" description="Da categoria mais usada para a menos usada.">
          <RankedBars items={categorias.map((item) => ({ label: item.categoria, value: item.total }))} />
        </Section>

        <Section title="Usuários mais ativos" description="Mais registros de progresso nos últimos 30 dias.">
          {data.usuariosMaisAtivos.length === 0 ? (
            <EmptyChart text="Ninguém registrou progresso nos últimos 30 dias." />
          ) : (
            <ul className="-my-2 divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.usuariosMaisAtivos.map((usuario) => (
                <li key={usuario.id_usuario}>
                  <Link to={`/admin/usuarios/${usuario.id_usuario}`} className="group flex items-center gap-3 py-2.5">
                    <Avatar name={usuario.nome} color={usuario.cor_avatar} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                      {usuario.nome}
                    </span>
                    <span className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                      {plural(usuario.registros, "registro", "registros")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
