import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useModal } from '../context/ModalContext';
import { Save, Calendar, X, ShieldCheck, Clock, CheckCircle, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Match {
  id: string;
  phase: string;
  round: number;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  group: string;
  // Nuevos campos del backend para la comparativa
  homeScore?: number;
  awayScore?: number;
  isFinished?: boolean;
}

interface PredictionFormProps {
    poolId: string;
    initialData?: any; 
    onCancel: () => void;
    readOnly?: boolean;
    isAdmin?: boolean;
}

type Phase = "Grupos" | "Octavos" | "Cuartos" | "Semi-Final" | "Tercer Lugar" | "Final";

export const PredictionForm = ({ poolId, initialData, onCancel, readOnly = false, isAdmin = false }: PredictionFormProps) => {
  const [activePhase, setActivePhase] = useState<Phase>("Grupos");
  const [activeRound, setActiveRound] = useState<number>(1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>(
    initialData?.predictions || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { show } = useModal();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        setMatches(response.data);
      } catch (error) {
        console.error("Error cargando partidos", error);
      }
    };
    fetchMatches();
  }, []);

  // Helper de UI: Calcula puntos por partido (Espejo de matches.service.ts)
  const getPointsForMatch = (match: Match) => {
    if (!match.isFinished || match.homeScore === null || match.awayScore === null) return null;
    
    const pred = predictions[match.id];
    if (!pred) return 0;

    const { home: pl, away: pv } = pred;
    const { homeScore: rl, awayScore: rv } = match;

    // Marcador Exacto (3 pts si no es empate, 2 pts si es empate exacto)
    if (pl === rl && pv === rv) {
      return pl === pv ? 2 : 3;
    }

    // Empate no exacto (1 pt)
    if (rl === rv && pl === pv) return 1;

    // Ganador
    const ganoLocal = rl! > rv! && pl > pv;
    const ganoVisita = rv! > rl! && pv > pl;

    if (ganoLocal || ganoVisita) {
      const difPronostico = Math.abs(pl - pv);
      const difReal = Math.abs(rl! - rv!);
      // Ganador + Diferencia (2 pts)
      if (difPronostico === difReal) return 2;
      // Solo Ganador (1 pt)
      return 1;
    }

    return 0;
  };

  const filteredMatches = matches.filter(match => {
    if (activePhase === "Grupos") {
      return match.phase === "Grupos" && match.round === activeRound;
    }
    return match.phase === activePhase;
  });

  const handleScoreChange = (matchId: string, team: 'home' | 'away', value: string) => {
    if (readOnly) return;
    const score = value === "" ? 0 : parseInt(value);
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: score
      }
    }));
  };

  const handleAction = async (newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/tickets/${initialData.id}/status`, { status: newStatus });
      show(`Ticket ${newStatus === 'APPROVED' ? 'aprobado' : 'rechazado'} con éxito`, "success");
      onCancel();
    } catch (error) {
      console.error("Error al actualizar estado", error);
      show("Error al actualizar el estado del ticket", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación proactiva: Buscar si falta algún partido en cualquier fase
    const incompleteMatch = matches.find(m => 
      !predictions[m.id] || 
      predictions[m.id].home === undefined || 
      predictions[m.id].away === undefined
    );

    if (incompleteMatch) {
      show(`Te faltan pronósticos por completar. Revisa la fase: ${incompleteMatch.phase}`, "error");
      setActivePhase(incompleteMatch.phase as Phase);
      if (incompleteMatch.phase === "Grupos") setActiveRound(incompleteMatch.round);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        poolId,
        participantId: user?.uid,
        predictions
      };

      if (initialData?.id) {
        await api.patch(`/tickets/${initialData.id}`, payload);
      } else {
        await api.post('/tickets', payload);
      }
      onCancel();
    } catch (error) {
      console.error("Error al guardar", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {readOnly ? (
                <>
                <ShieldCheck className="text-emerald-500" />
                Detalle de Cartón (Bloqueado)
                </>
            ) : (
                <>
                <Calendar className="text-[#8A1538]" /> 
                {initialData?.status === 'APPROVED' ? 'Editar Cartón' : 'Nuevo Pronóstico'}
                </>
            )}
        </h3>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={24} />
        </button>
      </div>

      {/* Tabs de Fases y Rondas */}
      <div className="space-y-6 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100">
          {["Grupos", "Octavos", "Cuartos", "Semi-Final", "Tercer Lugar", "Final"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePhase(p as Phase)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activePhase === p 
                ? 'bg-[#8A1538] text-white shadow-lg shadow-red-100 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {activePhase === "Grupos" && (
          <div className="flex justify-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 max-w-sm mx-auto">
            {[1, 2, 3].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRound(r)}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  activeRound === r 
                  ? 'bg-white text-[#8A1538] shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Ronda {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulario / Lista de Partidos */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredMatches.map((match) => {
            const pts = getPointsForMatch(match);
            
            return (
              <div key={match.id} className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-200 transition-colors relative">
                
                {/* Equipo Local */}
                <div className="flex-1 text-right font-black text-slate-700 uppercase tracking-tight text-sm">
                  {match.homeTeam}
                </div>

                {/* Zona Central: Pronósticos vs Resultados */}
                <div className="flex flex-col items-center px-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      disabled={readOnly}
                      value={predictions[match.id]?.home ?? ""}
                      className={`w-14 h-14 text-center border-2 rounded-xl outline-none font-black text-xl transition-all ${
                        readOnly ? 'bg-slate-50 border-slate-100 opacity-100' : 'bg-slate-50 border-slate-100 focus:border-[#8A1538]'
                      }`}
                      onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-slate-300 font-black text-xs">VS</span>
                      {match.isFinished && (
                        <div className="mt-1 bg-[#8A1538] text-white px-2 py-0.5 rounded text-[10px] font-bold animate-in fade-in zoom-in duration-300">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={predictions[match.id]?.away ?? ""}
                      className={`w-14 h-14 text-center border-2 rounded-xl outline-none font-black text-xl transition-all ${
                        readOnly ? 'bg-slate-50 border-slate-100 opacity-100' : 'bg-slate-50 border-slate-100 focus:border-[#8A1538]'
                      }`}
                      onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                    />
                  </div>
                  {readOnly && match.isFinished && (
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Resultado Real</span>
                  )}
                </div>

                {/* Equipo Visita */}
                <div className="flex-1 text-left font-black text-slate-700 uppercase tracking-tight text-sm">
                  {match.awayTeam}
                </div>

                {/* Badge de Puntos Obtenidos (Solo en ReadOnly + Finished) */}
                {readOnly && match.isFinished && (
                  <div className={`ml-4 flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl border-2 transition-all ${
                    pts! > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Trophy size={12} className={pts! > 0 ? 'text-emerald-500' : 'text-slate-300'} />
                    <span className="text-lg font-black leading-none">+{pts}</span>
                    <span className="text-[8px] font-black uppercase">pts</span>
                  </div>
                )}

                {/* Badge de Partido Pendiente (Solo en ReadOnly + No Finished) */}
                {readOnly && !match.isFinished && (
                  <div className="ml-4 flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-600 transition-all">
                    <Clock size={12} className="text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase leading-none">En</span>
                    <span className="text-[10px] font-black uppercase">Espera</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!readOnly && (
          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8A1538] hover:bg-red-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {initialData?.id ? 'Actualizar Pronóstico' : 'Enviar mi Jugada'}
            </button>
          </div>
        )}

        {readOnly && isAdmin && initialData?.status === 'PENDING' && (
          <div className="flex gap-4 pt-8 border-t border-slate-100 mt-8">
            <button
              type="button"
              onClick={() => handleAction('REJECTED')}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
            >
              <X size={20} /> Rechazar
            </button>
            <button
              type="button"
              onClick={() => handleAction('APPROVED')}
              className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} /> Aprobar
            </button>
          </div>
        )}

        {readOnly && !isAdmin && (
          <div className="pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all hover:bg-slate-900"
            >
              Cerrar Vista
            </button>
          </div>
        )}
      </form>
    </div>
  );
};