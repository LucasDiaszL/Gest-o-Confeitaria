import { 
  LayoutDashboard, 
  Package, 
  ChefHat, 
  BarChart3, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  MessageCircle
} from "lucide-react";

export function Sidebar({ abaAtiva, setAbaAtiva, collapsed, setCollapsed, darkMode, setDarkMode, insumos = [] }) {
  const menus = [
    { id: "vendas", label: "Vendas", icon: LayoutDashboard },
    { id: "produtos", label: "Produtos", icon: ChefHat },
    { id: "estoque", label: "Estoque", icon: Package },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  ];

  // 1. FILTRAR ITENS CRÍTICOS (Tratando dízimas aqui também)
  const itensCriticos = insumos.filter(i => 
    (Number(i.quantidade_atual) || 0) <= (Number(i.estoque_minimo) || 5)
  );

  // 2. FUNÇÃO PARA ENVIAR LISTA AO WHATSAPP
  const enviarListaWhatsApp = () => {
    if (itensCriticos.length === 0) return;
    const saudacao = "🍰 *DOCE CONTROLE - ALERTA DE ESTOQUE*%0A";
    const lista = itensCriticos.map(i => 
      `• *${i.nome.toUpperCase()}*: Restam apenas ${parseFloat(Number(i.quantidade_atual).toFixed(2))}${i.unidade_medida}`
    ).join('%0A');
    const msg = `${saudacao}%0AOlá! Preciso repor estes itens para não parar a produção:%0A%0A${lista}`;
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen transition-all duration-500 z-50 flex flex-col border-r ${
        darkMode ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-100 text-slate-800 shadow-xl"
      } ${collapsed ? "w-24" : "w-64"}`}
    >
      {/* LOGO ESTILIZADA */}
      <div className={`p-8 flex items-center min-h-[100px] transition-all ${collapsed ? "justify-center" : "gap-4"}`}>
        <div className="w-10 h-10 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30 flex-shrink-0 group">
          <ChefHat className="text-white group-hover:rotate-12 transition-transform" size={24} />
        </div>
        {!collapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-500">
            <h1 className="text-xs font-black uppercase tracking-[0.3em] leading-tight">Doce<br/><span className="text-pink-500">Controle</span></h1>
          </div>
        )}
      </div>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = abaAtiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`w-full flex items-center rounded-[1.5rem] transition-all duration-300 p-4 group ${
                collapsed ? "justify-center" : "px-6 gap-4"
              } ${
                isActive 
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25 scale-[1.02]" 
                  : darkMode ? "text-slate-500 hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-pink-50 hover:text-pink-500"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 3 : 2} className="transition-transform group-hover:scale-110" />
              {!collapsed && (
                <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ⚠️ ALERTA DE ESTOQUE (ESTILO PÍLULA) */}
      {itensCriticos.length > 0 && (
        <div className="px-4 mb-4">
          <button 
            onClick={enviarListaWhatsApp}
            className={`w-full flex items-center transition-all duration-300 rounded-[2rem] border overflow-hidden group ${
              collapsed ? "justify-center p-4" : "p-4 gap-4"
            } ${
              darkMode 
                ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" 
                : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
            }`}
          >
            <AlertTriangle size={20} className="animate-pulse flex-shrink-0" />
            {!collapsed && (
              <div className="text-left animate-in fade-in duration-500">
                <p className="text-[9px] font-black uppercase tracking-tighter">Reposição Urgente</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black">{itensCriticos.length} itens</span>
                  <MessageCircle size={10} className="opacity-50" />
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* FOOTER: CONTROLES */}
      <div className={`p-4 mt-auto border-t space-y-2 ${darkMode ? "border-white/5" : "border-slate-50"}`}>
        {/* DARK MODE TOGGLE */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center rounded-2xl p-4 transition-all ${
            collapsed ? "justify-center" : "px-6 gap-4"
          } ${darkMode ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-50"}`}
        >
          {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
          {!collapsed && <span className="text-[9px] font-black uppercase tracking-widest">Modo {darkMode ? 'Claro' : 'Escuro'}</span>}
        </button>

        {/* COLLAPSE TOGGLE */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center rounded-2xl p-4 transition-all ${
            collapsed ? "justify-center" : "px-6 gap-4"
          } ${darkMode ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-50"}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="text-[9px] font-black uppercase tracking-widest">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}