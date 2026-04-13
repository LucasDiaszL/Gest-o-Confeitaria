import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../services/supabaseClient";
import { Clock, Package, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarioEntregas({ darkMode }) {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [vendasDoDia, setVendasDoDia] = useState([]);

  const extrairDataSimples = (data) => {
    if (!data) return null;
    if (data instanceof Date) {
      const offset = data.getTimezoneOffset();
      const dataLocal = new Date(data.getTime() - (offset * 60 * 1000));
      return dataLocal.toISOString().split('T')[0];
    }
    return data.substring(0, 10);
  };

  useEffect(() => {
    async function buscarEventos() {
      const { data } = await supabase.from("vendas").select("*, produtos(nome)");
      if (data) setEventos(data);
    }
    buscarEventos();
  }, []);

  useEffect(() => {
    const selecionadaStr = extrairDataSimples(dataSelecionada);
    const filtradas = eventos.filter(v => extrairDataSimples(v.data_entrega || v.criado_em) === selecionadaStr);
    setVendasDoDia(filtradas);
  }, [dataSelecionada, eventos]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* CARD DO CALENDÁRIO */}
      <div className={`flex-1 p-10 rounded-[3.5rem] shadow-2xl border transition-all ${
        darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-50"
      }`}>
        <Calendar
          onChange={setDataSelecionada}
          value={dataSelecionada}
          locale="pt-BR"
          className={darkMode ? "dark-mode-calendar" : "light-mode-calendar"}
          prevLabel={<ChevronLeft className="text-pink-500" />}
          nextLabel={<ChevronRight className="text-pink-500" />}
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const dStr = extrairDataSimples(date);
              const tem = eventos.some(v => extrairDataSimples(v.data_entrega || v.criado_em) === dStr);
              if (tem) return <div className="h-2 w-2 bg-pink-500 rounded-full mx-auto mt-1 animate-pulse shadow-lg shadow-pink-500/50"></div>;
            }
          }}
        />
      </div>

      {/* COLUNA DE DETALHES (Estilo Cards de Insumo) */}
      <div className="w-full lg:w-96 space-y-6">
        {/* MINI CARD TOPO */}
        <div className={`p-8 rounded-[2.5rem] shadow-xl border flex items-center justify-between ${
          darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-50"
        }`}>
          <div>
            <p className="text-[10px] font-black uppercase text-pink-500 tracking-[0.3em] mb-1">Hoje</p>
            <h3 className="text-3xl font-black italic tracking-tighter leading-tight">
              {dataSelecionada.getDate()} de {dataSelecionada.toLocaleDateString('pt-BR', { month: 'long' })}
            </h3>
          </div>
          <div className="p-4 bg-pink-50 rounded-2xl text-pink-500"><CalendarDays size={24} /></div>
        </div>

        {/* LISTA DE ENCOMENDAS */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
          {vendasDoDia.length > 0 ? (
            vendasDoDia.map(v => (
              <div key={v.id} className={`p-8 rounded-[3rem] shadow-lg border-2 transition-all hover:scale-[1.02] ${
                darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl">🧁</div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Produto</span>
                    <h4 className="font-black text-lg uppercase italic text-pink-500">{v.produtos?.nome}</h4>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Qtd</span>
                    <span className="font-black text-xl">{v.quantidade}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Tipo</span>
                    <span className="text-[10px] font-black uppercase text-pink-500">{v.data_entrega ? "Encomenda" : "Venda"}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 rounded-[3rem]">
              <p className="text-[10px] font-black uppercase tracking-widest">Sem compromissos</p>
            </div>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .react-calendar { border: none !important; width: 100% !important; background: transparent !important; }
        .react-calendar__tile { padding: 1.5rem 0.5rem !important; border-radius: 1.5rem !important; font-weight: 800 !important; font-size: 0.8rem !important; }
        .react-calendar__tile--active { background: #ec4899 !important; color: white !important; box-shadow: 0 10px 15px -3px rgba(236,72,153,0.3) !important; }
        .react-calendar__navigation button { font-weight: 900 !important; text-transform: uppercase !important; font-size: 0.7rem !important; color: #ec4899 !important; }
      `}</style>
    </div>
  );
}