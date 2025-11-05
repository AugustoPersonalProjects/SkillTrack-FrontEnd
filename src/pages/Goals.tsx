import { useState, useEffect } from "react";
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Target,
  Search,
  Filter,
  Trash2,
} from "lucide-react";
import { goalService } from "../services/goalService";
import { skillService } from "../services/skillService";
import type { Goal, Skill } from "../types/interfaces";
import { useAuth } from "../contexts/AuthContext";

export default function Goals() {
  const { user, loadingUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    skillId: 0,
  });

  // Aguarda o contexto carregar antes de buscar metas
  useEffect(() => {
    if (!loadingUser && user) {
      loadGoals();
      loadSkills();
    }
  }, [user, loadingUser]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Carregando metas para usuário:", user?.id_usuario);

      let goalsData: Goal[] = [];

      if (user?.id_usuario) {
        try {
          goalsData = await goalService.getUserGoals(user.id_usuario);
          console.log("📊 Metas carregadas da API:", goalsData);
        } catch (userError) {
          console.warn("❌ Erro no endpoint de usuário, fallback:", userError);
          const allGoals = await goalService.getGoals();
          goalsData = Array.isArray(allGoals)
            ? allGoals.filter((goal) => goal.user_id === user.id_usuario)
            : [];
        }
      }

      if (!Array.isArray(goalsData)) {
        console.warn("⚠️ goalsData não é array, convertendo:", goalsData);
        goalsData = [];
      }

      setGoals(goalsData);
    } catch (error) {
      console.error("❌ Erro ao carregar metas:", error);
      setError("Erro ao carregar metas. Verifique o servidor.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const skillsData = await skillService.getSkills();
      setSkills(Array.isArray(skillsData) ? skillsData : []);
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      setSkills([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title.trim()) return setError("O título é obrigatório");
    if (!formData.skillId) return setError("Selecione uma skill");
    if (!formData.deadline) return setError("A data limite é obrigatória");

    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) return setError("A data deve ser futura");

    try {
      if (!user?.id_usuario) {
        setError("Usuário não autenticado. Faça login novamente.");
        return;
      }

      const goalData = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        skill_id: formData.skillId,
        user_id: user.id_usuario,
      };

      console.log("🎯 Criando meta:", goalData);

      await goalService.createGoal(goalData);
      setSuccess("Meta criada com sucesso!");
      resetForm();
      await loadGoals();
    } catch (error: any) {
      console.error("Erro ao criar meta:", error);
      setError(error.response?.data?.message || "Erro ao criar meta");
    }
  };

  const handleComplete = async (id: number) => {
  try {
    setError("");
    setSuccess("");
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id_goal === id ? { ...goal, completed: true } : goal
      )
    );
    const success = await goalService.completeGoal(id);
    if (success) {
      setSuccess("Meta marcada como concluída!");
      await loadGoals();
    } else {
      setError("Erro ao marcar meta como concluída.");
    }
  } catch (error: any) {
    console.error("Erro ao completar meta:", error);
    setError(error.response?.data?.message || "Erro ao completar meta");
    await loadGoals();
  }
};


  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    try {
      setError("");
      await goalService.deleteGoal(id);
      setSuccess("Meta excluída com sucesso!");
      await loadGoals();
    } catch (error: any) {
      console.error("Erro ao excluir meta:", error);
      setError(error.response?.data?.message || "Erro ao excluir meta");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      deadline: "",
      skillId: 0,
    });
    setShowForm(false);
    setError("");
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getSkillName = (skillId: number) => {
    const skill = skills.find((s) => s.id_skill === skillId);
    return skill ? skill.name : "Skill não encontrada";
  };

  const filteredGoals = Array.isArray(goals)
    ? goals.filter(
        (goal) =>
          goal?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Debug
  useEffect(() => {
    console.log("🔍 DEBUG - Estado atual:", { goals, skills, user, loading });
  }, [goals, skills, user, loading]);

  if (loadingUser || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Metas 🎯</h2>
          <p className="text-gray-600">Defina e acompanhe seus objetivos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
          {success}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar metas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
          <Filter className="w-5 h-5 text-gray-600" />
          <span>Filtrar</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredGoals.length}
              </p>
              <p className="text-gray-600">Total de Metas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredGoals.filter((g) => g.completed).length}
              </p>
              <p className="text-gray-600">Concluídas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredGoals.filter((g) => !g.completed).length}
              </p>
              <p className="text-gray-600">Em Andamento</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Criar Nova Meta
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Meta *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aprender Spring Boot, Dominar React..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  placeholder="Descreva sua meta em detalhes..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  rows={3}
                />
              </div>

              {/* Skill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Relacionada *
                </label>
                <select
                  value={formData.skillId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skillId: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  required
                >
                  <option value={0}>Selecione uma skill</option>
                  {skills.map((skill) => (
                    <option key={skill.id_skill} value={skill.id_skill}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prazo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Criar Meta
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const daysUntil = getDaysUntilDeadline(goal.deadline);
            const isOverdue = daysUntil < 0 && !goal.completed;

            return (
              <div
                key={goal.id_goal}
                className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${
                  goal.completed
                    ? "border-l-green-500 bg-green-50/50"
                    : isOverdue
                    ? "border-l-red-500 bg-red-50/50"
                    : "border-l-blue-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4
                        className={`text-xl font-semibold ${
                          goal.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {goal.title}
                      </h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {getSkillName(goal.skill_id)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{goal.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Prazo:{" "}
                          {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          isOverdue
                            ? "text-red-600 font-medium"
                            : daysUntil < 7
                            ? "text-orange-600"
                            : "text-gray-500"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>
                          {goal.completed
                            ? "Concluída"
                            : isOverdue
                            ? `Atrasada ${Math.abs(daysUntil)} dias`
                            : `${daysUntil} dias restantes`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!goal.completed && (
                      <button
                        onClick={() => handleComplete(goal.id_goal)}
                        className="p-3 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-200"
                        title="Marcar como concluída"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(goal.id_goal)}
                      className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-6 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm
                ? "Nenhuma meta encontrada"
                : "Nenhuma meta cadastrada"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Tente ajustar os termos da pesquisa"
                : "Comece definindo seus primeiros objetivos de aprendizado"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Criar Primeira Meta
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
