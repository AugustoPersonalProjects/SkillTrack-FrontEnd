import { useState, useEffect } from "react";
import { Plus, Search, Filter, TrendingUp, Edit, Trash2, Award } from "lucide-react";
import { skillService } from "../services/skillService";
import { type Skill, type SkillRequest, type Category, SkillLevel } from "../types/skill";
import { useAuth } from "../contexts/AuthContext";

export default function Skills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<SkillRequest>({
    name: "",
    description: "",
    categoryId: 0,
    level: SkillLevel.BEGINNER,
    userId: user?.id_usuario || 1 // Default para desenvolvimento
  });

  useEffect(() => {
    loadSkills();
    loadCategories();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");
      const skillsData = await skillService.getSkills();
      setSkills(skillsData);
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      setError("Erro ao carregar skills. Verifique se o servidor está rodando.");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await skillService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("O nome da skill é obrigatório");
      return;
    }

    if (!formData.categoryId) {
      setError("Selecione uma categoria");
      return;
    }

    try {
      if (editingSkill) {
        await skillService.updateSkill(editingSkill.id_skill, formData);
        setError("Skill atualizada com sucesso!");
      } else {
        await skillService.createSkill(formData);
        setError("Skill criada com sucesso!");
      }

      resetForm();
      await loadSkills();
    } catch (error: any) {
      console.error("Erro ao salvar skill:", error);
      setError(error.response?.data?.message || "Erro ao salvar skill");
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || "",
      categoryId: skill.category_id,
      level: skill.level,
      userId: user?.id_usuario || 1
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta skill?")) return;

    try {
      await skillService.deleteSkill(id);
      setError("Skill excluída com sucesso!");
      await loadSkills();
    } catch (error: any) {
      console.error("Erro ao excluir skill:", error);
      setError(error.response?.data?.message || "Erro ao excluir skill");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: 0,
      level: SkillLevel.BEGINNER,
      userId: user?.id_usuario || 1
    });
    setEditingSkill(null);
    setShowForm(false);
    setError("");
  };

  const getLevelColor = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER: return "bg-yellow-100 text-yellow-800";
      case SkillLevel.INTERMEDIATE: return "bg-blue-100 text-blue-800";
      case SkillLevel.ADVANCED: return "bg-green-100 text-green-800";
      case SkillLevel.EXPERT: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER: return "Iniciante";
      case SkillLevel.INTERMEDIATE: return "Intermediário";
      case SkillLevel.ADVANCED: return "Avançado";
      case SkillLevel.EXPERT: return "Especialista";
      default: return level;
    }
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Skills 🛠️</h2>
          <p className="text-gray-600">Gerencie suas habilidades e acompanhe o progresso</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Skill
        </button>
      </div>

      {/* Mensagem de erro/sucesso */}
      {error && (
        <div className={`p-4 rounded-xl ${
          error.includes("sucesso") 
            ? "bg-green-50 border border-green-200 text-green-700" 
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar skills..."
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

      {/* Skill Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {editingSkill ? "Editar Skill" : "Nova Skill"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Skill *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Ex: Spring Boot, React, Docker..."
                  required
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Descreva esta habilidade..."
                  rows={2}
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  required
                >
                  <option value={0}>Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id_category} value={category.id_category}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nível */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as SkillLevel })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  required
                >
                  {Object.values(SkillLevel).map(level => (
                    <option key={level} value={level}>
                      {getLevelText(level)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {editingSkill ? "Atualizar" : "Criar"} Skill
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

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => (
          <div key={skill.id_skill} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {skill.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {categories.find(cat => cat.id_category === skill.category_id)?.name || "Sem categoria"}
                </p>
                {skill.description && (
                  <p className="text-gray-500 text-sm mt-1">{skill.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                {getLevelText(skill.level)}
              </span>
            </div>

            {/* Progress Stats */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm font-bold text-gray-900">
                  {skill.progress_history && skill.progress_history.length > 0 
                    ? `${skill.progress_history[skill.progress_history.length - 1]?.percentage || 0}%`
                    : "0%"
                  }
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
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>
                  {skill.progress_history?.length || 0} atualizações
                </span>
              </div>
              <span>
                {skill.goals?.length || 0} metas
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button 
                onClick={() => handleEdit(skill)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button 
                onClick={() => handleDelete(skill.id_skill)}
                className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm ? "Nenhuma skill encontrada" : "Nenhuma skill cadastrada"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? "Tente ajustar os termos da pesquisa" 
              : "Comece adicionando suas primeiras habilidades"
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Adicionar Primeira Skill
            </button>
          )}
        </div>
      )}
    </div>
  );
}