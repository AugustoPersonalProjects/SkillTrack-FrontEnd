import { useState } from "react";
import { PlusCircle, CheckCircle2, Clock, Calendar, Target } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  deadline: string;
  progress: number;
  category: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: "Aprender Spring Boot",
      description: "Completar o módulo de APIs REST até o final do mês.",
      completed: false,
      deadline: "2024-02-15",
      progress: 65,
      category: "Backend"
    },
    {
      id: 2,
      title: "Concluir o Front-End",
      description: "Finalizar o layout com Tailwind e React.",
      completed: true,
      deadline: "2024-01-10",
      progress: 100,
      category: "Frontend"
    },
    {
      id: 3,
      title: "Dominar Docker",
      description: "Aprender containerização e orquestração.",
      completed: false,
      deadline: "2024-03-01",
      progress: 30,
      category: "DevOps"
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    deadline: "",
    category: ""
  });

  const [showForm, setShowForm] = useState(false);

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    const newItem: Goal = {
      id: goals.length + 1,
      title: newGoal.title,
      description: newGoal.description,
      completed: false,
      deadline: newGoal.deadline,
      progress: 0,
      category: newGoal.category || "Geral"
    };
    setGoals([...goals, newItem]);
    setNewGoal({ title: "", description: "", deadline: "", category: "" });
    setShowForm(false);
  };

  const toggleGoal = (id: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : 0 } : g
      )
    );
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Metas 🎯</h2>
          <p className="text-gray-600">Defina e acompanhe seus objetivos de aprendizado</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Nova Meta
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
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
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
                {goals.filter(g => g.completed).length}
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
                {goals.filter(g => !g.completed).length}
              </p>
              <p className="text-gray-600">Em Andamento</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Criar Nova Meta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Título da meta"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
            />
            <input
              type="text"
              placeholder="Categoria"
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
            />
            <input
              type="date"
              placeholder="Prazo"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
            />
            <input
              type="text"
              placeholder="Descrição"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none md:col-span-2"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={addGoal}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Adicionar Meta
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const daysUntil = getDaysUntilDeadline(goal.deadline);
          const isOverdue = daysUntil < 0 && !goal.completed;

          return (
            <div
              key={goal.id}
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
                        goal.completed ? "line-through text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {goal.title}
                    </h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {goal.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{goal.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      isOverdue ? 'text-red-600 font-medium' : 
                      daysUntil < 7 ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        {goal.completed ? 'Concluída' : 
                         isOverdue ? `Atrasada ${Math.abs(daysUntil)} dias` : 
                         `${daysUntil} dias restantes`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!goal.completed && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Progresso</span>
                        <span className="font-bold text-gray-900">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    goal.completed 
                      ? "text-green-600 hover:bg-green-100" 
                      : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma meta cadastrada</h3>
            <p className="text-gray-600 mb-6">Comece definindo seus primeiros objetivos de aprendizado</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Criar Primeira Meta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}