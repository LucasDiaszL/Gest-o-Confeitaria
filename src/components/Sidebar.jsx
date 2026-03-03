// components/Sidebar.jsx
export function Sidebar({ abaAtiva, setAbaAtiva, collapsed, setCollapsed, darkMode, setDarkMode }) {
  const menus = [
    { id: "vendas", label: "Vendas", icon: "💰" },
    { id: "produtos", label: "Produtos", icon: "🧁" },
    { id: "estoque", label: "Estoque", icon: "📦" },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50 flex flex-col border-r shadow-2xl ${
        darkMode 
          ? "bg-slate-900 border-slate-800 text-white" 
          : "bg-white border-pink-100 text-slate-800"
      } ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* LOGO */}
      <div className={`p-6 flex items-center border-b overflow-hidden min-h-[90px] ${
        darkMode ? "border-slate-800" : "border-pink-50"
      } ${collapsed ? "justify-center" : "justify-start gap-3"}`}>
        <div className={`p-2 rounded-xl flex-shrink-0 ${darkMode ? "bg-slate-800" : "bg-pink-100"}`}>
          <span className="text-2xl">🍰</span>
        </div>
        {!collapsed && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-sm font-black leading-none whitespace-nowrap">Doce Controle</h1>
          </div>
        )}
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 p-3 space-y-2 mt-4">
        {menus.map((item) => (
          <button
            key={item.id}
            onClick={() => setAbaAtiva(item.id)}
            className={`w-full flex items-center rounded-2xl transition-all p-4 ${
              collapsed ? "justify-center" : "justify-start px-5 gap-4"
            } ${
              abaAtiva === item.id 
                ? (darkMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "bg-slate-900 text-white shadow-lg") 
                : (darkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-500 hover:bg-pink-50")
            }`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="font-bold text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* ☀️ BOTÃO DARK/LIGHT MODE - ADICIONE ESTE BLOCO ABAIXO */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className={`p-6 flex items-center transition-all border-t ${
          darkMode 
            ? "border-slate-800 text-yellow-400 hover:bg-slate-800" 
            : "border-pink-50 text-slate-400 hover:text-pink-500"
        } ${collapsed ? "justify-center" : "justify-start px-8 gap-4"}`}
      >
        <span className="text-xl">{darkMode ? "☀️" : "🌙"}</span>
        {!collapsed && (
          <span className="text-[10px] font-black uppercase tracking-widest">
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </span>
        )}
      </button>

      {/* BOTÃO RECOLHER */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className={`p-6 border-t flex items-center transition-all ${
          darkMode ? "border-slate-800 text-slate-500 hover:text-white" : "border-pink-50 text-slate-400 hover:text-pink-500"
        } ${collapsed ? "justify-center" : "justify-start px-8 gap-4"}`}
      >
        <span className="text-xl">{collapsed ? "➡️" : "⬅️"}</span>
        {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Recolher</span>}
      </button>
    </aside>
  );
}