import { Menu, Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Augusto Lyra</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <img
              src="https://i.pravatar.cc/40?img=1"
              alt="User avatar"
              className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}