import { Edit3, RotateCcw, Trash2, TrendingUp, AlertCircle, Loader2, Users } from "lucide-react";
import { useSimulator } from "../hooks/useSimulator";

export const SimulatorView = ({ 
  matches, 
  allTickets,
  loading 
}: { 
  matches: any[],
  allTickets: any[],
  loading?: boolean
}) => {
    const { 
      updateFictionalResult, 
      simulatedRanking, 
      fictionalResults,
      resetMatch,
      resetAll,
      modifiedCount
    } = useSimulator(matches, allTickets);

    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#8A1538]" size={40} />
        </div>
      );
    }

    if (allTickets.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Sin cartones aprobados</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">
            Necesita haber cartones aprobados para usar el simulador.
          </p>
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Sin partidos pendientes</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">
            Todos los partidos han finalizado. No hay nada que simular.
          </p>
        </div>
      );
    }
  
    return (
      <div className="grid lg:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: Simulador de Partidos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
               <Edit3 size={20} className="text-blue-500" /> Simular Resultados
            </h3>
            {modifiedCount > 0 && (
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-bold text-sm"
              >
                <Trash2 size={16} /> Limpiar Todo
              </button>
            )}
          </div>

          {modifiedCount > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 font-bold text-sm">Resultados simulados: {modifiedCount}</p>
                <p className="text-blue-700 text-xs mt-1">Estos cambios solo son visibles para ti. El leaderboard se actualiza en tiempo real.</p>
              </div>
            </div>
          )}

          {/* Listado de partidos */}
          <div className="space-y-3">
            {matches.map(match => {
              const simResult = fictionalResults[match.id];
              const isModified = !!simResult;
              
              return (
                <div 
                  key={match.id} 
                  className={`bg-white p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isModified 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  {/* Equipo Local */}
                  <span className="text-sm font-bold w-1/4 text-right text-slate-700">
                    {match.homeTeam}
                  </span>

                  {/* Inputs de Marcador */}
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <input 
                      type="number" 
                      min="0"
                      max="9"
                      value={simResult?.home ?? ''}
                      placeholder={match.homeScore ?? '?'}
                      className="w-14 h-12 text-center bg-white border-2 border-slate-200 rounded-lg font-black text-lg focus:border-blue-400 focus:outline-none transition-all"
                      onChange={(e) => updateFictionalResult(
                        match.id, 
                        parseInt(e.target.value) || 0, 
                        simResult?.away || 0
                      )}
                    />
                    <span className="text-xs font-black text-slate-400 px-2">VS</span>
                    <input 
                      type="number" 
                      min="0"
                      max="9"
                      value={simResult?.away ?? ''}
                      placeholder={match.awayScore ?? '?'}
                      className="w-14 h-12 text-center bg-white border-2 border-slate-200 rounded-lg font-black text-lg focus:border-blue-400 focus:outline-none transition-all"
                      onChange={(e) => updateFictionalResult(
                        match.id, 
                        simResult?.home || 0,
                        parseInt(e.target.value) || 0
                      )}
                    />
                  </div>

                  {/* Equipo Visitante */}
                  <span className="text-sm font-bold w-1/4 text-left text-slate-700">
                    {match.awayTeam}
                  </span>

                  {/* Botón Reset */}
                  {isModified && (
                    <button
                      onClick={() => resetMatch(match.id)}
                      className="ml-4 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                      title="Limpiar este resultado"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
  
        {/* PANEL DERECHO: Leaderboard Simulado */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white h-fit sticky top-24 shadow-2xl overflow-y-auto">
          <h3 className="text-xl font-black italic mb-6 border-b border-white/10 pb-4 uppercase tracking-tighter flex items-center gap-2 sticky top-0 bg-gradient-to-br from-slate-900 to-slate-800 py-2">
            <TrendingUp size={20} /> Leaderboard {modifiedCount > 0 ? '(Simulado)' : ''}
          </h3>
          
          <div className="space-y-2">
            {simulatedRanking.map((row, index) => {
              const realPoints = row.realPoints ?? 0;
              const simPoints = row.simulatedPoints ?? 0;
              const hasDiff = simPoints !== realPoints;
              const isImproving = simPoints > realPoints;
              
              return (
                <div 
                  key={row.id} 
                  className={`rounded-2xl p-4 transition-all ${
                    hasDiff 
                      ? isImproving
                        ? 'bg-emerald-500/20 border border-emerald-500/40'
                        : 'bg-red-500/20 border border-red-500/40'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-black w-8 text-center ${
                        index === 0 ? 'text-amber-400' : 
                        index === 1 ? 'text-slate-300' : 
                        index === 2 ? 'text-amber-600' : 
                        'text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-white leading-tight">
                          {row.participant?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-slate-400">Ticket: {row.id.split('-')[0]}...</p>
                      </div>
                    </div>
                  </div>

                  {/* Puntos */}
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-black ${
                      isImproving ? 'text-emerald-400' : simPoints > realPoints ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {simPoints}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">pts</span>
                  </div>

                  {/* Mostrar diferencia si hay cambios */}
                  {hasDiff && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Real: {realPoints}</span>
                      {isImproving ? (
                        <span className="text-emerald-400 font-bold text-sm">▲ +{simPoints - realPoints}</span>
                      ) : (
                        <span className="text-red-400 font-bold text-sm">▼ {simPoints - realPoints}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer con info */}
          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-1">
            <Users size={14} /> {simulatedRanking.length} participantes
          </div>
        </div>
      </div>
    );
  };