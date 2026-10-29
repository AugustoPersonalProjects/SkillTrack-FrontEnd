import { useState, useEffect } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Target,
  Award,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { skillService } from "../services/skillService";
import { goalService } from "../services/goalService";
import { type Skill, type Goal, SkillLevel } from "../types/interfaces";
import { useNavigate } from "react-router-dom";
import { parseLocalDate } from "../utils/date";
import { getLatestProgress, getLatestPercentage } from "../utils/progress";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSkills: 0,
    activeGoals: 0,
    averageProgress: 0,
    completedGoals: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (user?.id_usuario) {
        const userSkills = await skillService.getUserSkills(user.id_usuario);
        const userGoals = await goalService.getUserGoals(user.id_usuario);

        setSkills(userSkills);
        setGoals(userGoals);

        const totalSkills = userSkills.length;
        const activeGoals = userGoals.filter((g) => !g.completed).length;
        const averageProgress = calculateAverageProgress(userSkills);
        const completedGoals = userGoals.filter((g) => g.completed).length;

        setStats({
          totalSkills,
          activeGoals,
          averageProgress,
          completedGoals,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageProgress = (skills: Skill[]): number => {
    if (skills.length === 0) return 0;

    const totalProgress = skills.reduce(
      (sum, skill) => sum + getLatestPercentage(skill),
      0
    );

    return Math.round(totalProgress / skills.length);
  };

  const getLevelText = (level: SkillLevel): string => {
    switch (level) {
      case SkillLevel.BEGINNER:
        return "Iniciante";
      case SkillLevel.INTERMEDIATE:
        return "Intermediário";
      case SkillLevel.ADVANCED:
        return "Avançado";
      case SkillLevel.EXPERT:
        return "Especialista";
      default:
        return level;
    }
  };

  type Activity = { action: string; time: string; type: "success" | "info" | "warning" };

  const getRecentActivities = (): Activity[] => {
    const activities: Activity[] = [];

    skills.forEach((skill) => {
      const latestProgress = getLatestProgress(skill);
      if (latestProgress) {
        activities.push({
          action: `Progresso em ${skill.name}: ${latestProgress.percentage}%`,
          time: latestProgress.date ? formatDaysAgo(latestProgress.date) : "",
          type: "success" as const,
        });
      }
    });

    goals.slice(0, 2).forEach((goal) => {
      activities.push({
        action: `Meta: ${goal.title}`,
        time: goal.completed
          ? "Concluída"
          : goal.deadline
          ? `Prazo: ${parseLocalDate(goal.deadline).toLocaleDateString("pt-BR")}`
          : "Sem prazo",
        type: goal.completed ? "success" : "info",
      });
    });

    if (activities.length === 0) {
      activities.push({
        action: "Bem-vindo ao SkillTrack! Cadastre sua primeira skill.",
        time: "Agora mesmo",
        type: "info" as const,
      });
    }

    return activities.slice(0, 4);
  };

  // As datas de progresso não têm horário, então a diferença é contada em dias
  const formatDaysAgo = (dateString: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffInDays = Math.round(
      (today.getTime() - parseLocalDate(dateString).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays <= 0) return "Hoje";
    if (diffInDays === 1) return "Ontem";
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    return `${Math.floor(diffInDays / 7)} semanas atrás`;
  };

  const statsData = [
    {
      title: "Total de Skills",
      value: stats.totalSkills.toString(),
      change: skills.length > 0 ? "Ver skills" : "Comece agora!",
      icon: <Award className="w-6 h-6" />,
      color: "bg-blue-500",
      trend: skills.length > 0 ? "up" : "neutral",
      onClick: () => navigate("/skills"),
    },
    {
      title: "Metas Ativas",
      value: stats.activeGoals.toString(),
      change: goals.length > 0 ? `${goals.length} no total` : "Defina metas!",
      icon: <Target className="w-6 h-6" />,
      color: "bg-green-500",
      trend: goals.length > 0 ? "up" : "neutral",
      onClick: () => navigate("/goals"),
    },
    {
      title: "Progresso Médio",
      value: `${stats.averageProgress}%`,
      change:
        stats.averageProgress > 0
          ? "Último registro de cada skill"
          : "Inicie seu progresso!",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-500",
      trend: stats.averageProgress > 0 ? "up" : "neutral",
      onClick: () => navigate("/skills"),
    },
    {
      title: "Metas Concluídas",
      value: stats.completedGoals.toString(),
      change:
        stats.completedGoals > 0 ? "Continue assim!" : "Conclua sua primeira meta!",
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "bg-orange-500",
      trend: stats.completedGoals > 0 ? "up" : "neutral",
      onClick: () => navigate("/goals"),
    },
  ];

  const quickActions = [
    {
      label: "Nova Skill",
      description: "Adicione uma nova habilidade",
      icon: <Award className="w-6 h-6" />,
      color: "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/skills"),
    },
    {
      label: "Nova Meta",
      description: "Defina um novo objetivo",
      icon: <Target className="w-6 h-6" />,
      color: "bg-green-50 border-green-200 text-green-900 hover:bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate("/goals"),
    },
    {
      label: "Ver Progresso",
      description: "Acompanhe sua evolução",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/skills"),
    },
    {
      label: "Minhas Skills",
      description: "Visualize todas as habilidades",
      icon: <Award className="w-6 h-6" />,
      color: "bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => navigate("/skills"),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Carregando...
        </h1>
        <p className="text-gray-600 text-lg">Preparando seu dashboard</p>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Bem-vindo de volta, {user?.nome || "Usuário"}! 🚀
        </h1>
        <p className="text-gray-600 text-lg">
          {skills.length > 0
            ? `Você está evoluindo em ${skills.length} habilidades`
            : "Comece sua jornada de aprendizado"}
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div
            key={i}
            onClick={stat.onClick}
            className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <span
                className={`text-sm ${
                  stat.trend === "up"
                    ? "text-green-500"
                    : stat.trend === "down"
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Atividades + Ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Atividades Recentes
            </h3>
            <button
              onClick={() => navigate("/skills")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {getRecentActivities().map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    a.type === "success"
                      ? "bg-green-500"
                      : a.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{a.action}</p>
                  <p className="text-sm text-gray-500">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className={`p-4 rounded-xl border transition-all duration-200 ${a.color}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${a.iconColor} bg-white/50`}>
                    {a.icon}
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
                <p className="font-semibold text-current mb-1">{a.label}</p>
                <p className="text-xs text-gray-600">{a.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills em destaque */}
      {skills.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Suas Skills em Destaque
            </h3>
            <button
              onClick={() => navigate("/skills")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skills.slice(0, 3).map((skill) => (
              <div
                key={skill.id_skill}
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      skill.level === SkillLevel.BEGINNER
                        ? "bg-yellow-100 text-yellow-800"
                        : skill.level === SkillLevel.INTERMEDIATE
                        ? "bg-blue-100 text-blue-800"
                        : skill.level === SkillLevel.ADVANCED
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {getLevelText(skill.level)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${getLatestPercentage(skill)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Progresso: {getLatestPercentage(skill)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
