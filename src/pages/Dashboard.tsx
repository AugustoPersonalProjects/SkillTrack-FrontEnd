import { useState, useEffect } from "react";
import { TrendingUp, Users, Target, Award, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { skillService } from "../services/skillService";
import { goalService } from "../services/goalService";
import { type Skill, type Goal, SkillLevel } from "../types/skill";
import { useNavigate } from "react-router-dom";

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
    consecutiveDays: 0
  });

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user?.id) {
        // Carregar skills do usuário
        const userSkills = await skillService.getUserSkills(user.id);
        setSkills(userSkills);

        // Carregar metas do usuário
        // const userGoals = await goalService.getUserGoals(user.id);
        // setGoals(userGoals);

        // Calcular estatísticas
        const totalSkills = userSkills.length;
        const activeGoals = goals.filter(goal => !goal.completed).length;
        const averageProgress = calculateAverageProgress(userSkills);
        const consecutiveDays = calculateConsecutiveDays(userSkills);

        setStats({
          totalSkills,
          activeGoals,
          averageProgress,
          consecutiveDays
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
    
    const totalProgress = skills.reduce((sum, skill) => {
      const latestProgress = skill.progress_history && skill.progress_history.length > 0 
        ? skill.progress_history[skill.progress_history.length - 1]?.percentage 
        : 0;
      return sum + (latestProgress || 0);
    }, 0);
    
    return Math.round(totalProgress / skills.length);
  };

  const calculateConsecutiveDays = (skills: Skill[]): number => {
    // Simulação - em produção, você calcularia baseado nas datas de progresso
    return Math.min(skills.length * 2, 30); // Exemplo simplificado
  };

  const getLevelText = (level: SkillLevel): string => {
    switch (level) {
      case SkillLevel.BEGINNER: return "Iniciante";
      case SkillLevel.INTERMEDIATE: return "Intermediário";
      case SkillLevel.ADVANCED: return "Avançado";
      case SkillLevel.EXPERT: return "Especialista";
      default: return level;
    }
  };

  const getRecentActivities = () => {
    const activities = [];

    // Atividades baseadas nas skills
    skills.slice(0, 3).forEach(skill => {
      if (skill.progress_history && skill.progress_history.length > 0) {
        const latestProgress = skill.progress_history[skill.progress_history.length - 1];
        activities.push({
          action: `Progresso em ${skill.name}: ${latestProgress.percentage}%`,
          time: formatTimeAgo(latestProgress.date_progress),
          type: 'success' as const
        });
      }
    });

    // Atividades baseadas nas metas
    goals.slice(0, 2).forEach(goal => {
      activities.push({
        action: `Meta: ${goal.description}`,
        time: formatTimeAgo(goal.deadline),
        type: goal.completed ? 'success' : 'info'
      });
    });

    // Preencher com atividades padrão se necessário
    while (activities.length < 4) {
      activities.push({
        action: "Bem-vindo ao SkillTrack!",
        time: "Agora mesmo",
        type: 'info' as const
      });
    }

    return activities.slice(0, 4);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours} horas atrás`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} dias atrás`;
    return `${Math.floor(diffInHours / 168)} semanas atrás`;
  };

  const statsData = [
    {
      title: "Total de Skills",
      value: stats.totalSkills.toString(),
      change: skills.length > 0 ? "+" + Math.floor(skills.length / 2) + " este mês" : "Comece agora!",
      icon: <Award className="w-6 h-6" />,
      color: "bg-blue-500",
      trend: skills.length > 0 ? "up" : "neutral",
      onClick: () => navigate("/skills")
    },
    {
      title: "Metas Ativas",
      value: stats.activeGoals.toString(),
      change: goals.length > 0 ? "+" + Math.floor(goals.length / 3) + " esta semana" : "Defina metas!",
      icon: <Target className="w-6 h-6" />,
      color: "bg-green-500",
      trend: goals.length > 0 ? "up" : "neutral",
      onClick: () => navigate("/goals")
    },
    {
      title: "Progresso Médio",
      value: `${stats.averageProgress}%`,
      change: stats.averageProgress > 0 ? `+${Math.floor(stats.averageProgress / 10)}% este mês` : "Inicie seu progresso!",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-500",
      trend: stats.averageProgress > 0 ? "up" : "neutral",
      onClick: () => navigate("/skills")
    },
    {
      title: "Dias Consecutivos",
      value: stats.consecutiveDays.toString(),
      change: stats.consecutiveDays > 7 ? "Recorde pessoal!" : "Mantenha o ritmo!",
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-500",
      trend: stats.consecutiveDays > 0 ? "up" : "neutral",
      onClick: () => navigate("/skills")
    }
  ];

  const quickActions = [
    {
      label: "Nova Skill",
      description: "Adicione uma nova habilidade",
      icon: <Award className="w-6 h-6" />,
      color: "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/skills")
    },
    {
      label: "Nova Meta",
      description: "Defina um novo objetivo",
      icon: <Target className="w-6 h-6" />,
      color: "bg-green-50 border-green-200 text-green-900 hover:bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate("/goals")
    },
    {
      label: "Ver Progresso",
      description: "Acompanhe sua evolução",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/skills")
    },
    {
      label: "Minhas Skills",
      description: "Visualize todas as habilidades",
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => navigate("/skills")
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Carregando...
          </h1>
          <p className="text-gray-600 text-lg">Preparando seu dashboard</p>
        </div>
        <div className="flex justify-center">
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
          Bem-vindo de volta, {user?.name || 'Usuário'}! 🚀
        </h1>
        <p className="text-gray-600 text-lg">
          {skills.length > 0 
            ? `Você está evoluindo em ${skills.length} habilidades` 
            : "Comece sua jornada de aprendizado"
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                {stat.icon}
              </div>
              <span className={`text-sm ${
                stat.trend === 'up' ? 'text-green-500' : 
                stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Atividades Recentes</h3>
            <button 
              onClick={() => navigate("/skills")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {getRecentActivities().map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate("/skills")}
              >
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' : 
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`p-4 rounded-xl border transition-all duration-200 group text-left ${action.color}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${action.iconColor} bg-white/50`}>
                    {action.icon}
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-semibold text-current mb-1">{action.label}</p>
                <p className="text-xs text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Preview */}
      {skills.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Suas Skills em Destaque</h3>
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
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer border"
                onClick={() => navigate("/skills")}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    skill.level === SkillLevel.BEGINNER ? 'bg-yellow-100 text-yellow-800' :
                    skill.level === SkillLevel.INTERMEDIATE ? 'bg-blue-100 text-blue-800' :
                    skill.level === SkillLevel.ADVANCED ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {getLevelText(skill.level)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ 
                      width: `${skill.progress_history && skill.progress_history.length > 0 
                        ? skill.progress_history[skill.progress_history.length - 1]?.percentage || 0 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Progresso: {skill.progress_history && skill.progress_history.length > 0 
                    ? `${skill.progress_history[skill.progress_history.length - 1]?.percentage || 0}%`
                    : "0%"
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}