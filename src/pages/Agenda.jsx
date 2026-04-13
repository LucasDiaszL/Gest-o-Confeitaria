import { useState } from "react";
import { CalendarioEntregas } from "../components/CalendarioEntregas";
import { Search, Plus } from "lucide-react";

export default function Agenda({ darkMode, produtos, recarregarVendas }) {
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [pesquisa, setPesquisa] = useState("");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 pb-20">
      
      {/* HEADER DINÂMICO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dashed border-slate-200 dark:border-white/10">
        <div>
          <h2 className={`text-5xl font-black italic tracking-tighter leading-tight transition-colors duration-500 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}>
            Agenda
          </h2>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 transition-colors duration-500 ${
            darkMode ? "text-indigo-300" : "text-slate-500"
          }`}>
            Cronograma de Produção
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
            <input 
              type="text"
              placeholder="Localizar entrega..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className={`pl-16 pr-8 py-5 rounded-full font-bold text-sm w-72 outline-none transition-all ${
                darkMode 
                  ? "bg-slate-900 border border-white/5 text-white focus:border-pink-500" 
                  : "bg-white border border-slate-200 text-slate-700 shadow-inner focus:border-pink-300"
              }`}
            />
          </div>

          <button 
            onClick={() => setMostrandoForm(true)}
            className="flex items-center gap-3 px-8 py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Nova Encomenda
          </button>
        </div>
      </header>

      {/* COMPONENTE DA AGENDA */}
      <section>
        <CalendarioEntregas darkMode={darkMode} />
      </section>

    </div>
  );
}