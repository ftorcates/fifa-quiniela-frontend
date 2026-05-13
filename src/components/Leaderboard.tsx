import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Trophy, Medal, User, Info } from 'lucide-react';

interface RankingEntry {
  id: string;
  points: number;
  ticketId: string;
  ticket: {
    participant: {
      name: string;
      avatar: string | null;
    };
  };
}

export const Leaderboard = ({ poolId }: { poolId: string }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get(`/pools/${poolId}/leaderboard`);
        setRankings(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [poolId]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Actualizando posiciones...</div>;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Encabezado de la Tabla - Ahora VISIBLE */}
      <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 px-6 py-4">
        <div className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Pos</div>
        <div className="col-span-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Participante / Ticket</div>
        <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Puntos</div>
      </div>

      {/* Cuerpo de la Tabla */}
      <div className="divide-y divide-slate-50">
        {rankings.length > 0 ? (
          rankings.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-12 items-center px-6 py-5 hover:bg-slate-50/50 transition-colors">
              
              {/* Posición con Iconos para Top 3 */}
              <div className="col-span-1 flex items-center">
                {index === 0 && <Medal className="text-yellow-500" size={24} />}
                {index === 1 && <Medal className="text-slate-400" size={24} />}
                {index === 2 && <Medal className="text-amber-600" size={24} />}
                {index > 2 && <span className="text-slate-400 font-bold ml-1">{index + 1}</span>}
              </div>

              {/* Info del Participante */}
              <div className="col-span-8 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                  {entry.ticket.participant.avatar ? (
                    <img src={entry.ticket.participant.avatar} alt="avatar" className="rounded-full" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800 leading-tight">
                    {entry.ticket.participant.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                    ID: {entry.ticketId.split('-')[0]}...
                  </p>
                </div>
              </div>

              {/* Puntaje Resaltado */}
              <div className="col-span-3 text-right">
                <span className={`text-2xl font-black ${index === 0 ? 'text-[#8A1538]' : 'text-slate-700'}`}>
                  {entry.points}
                </span>
                <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-tighter">Pts Totales</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <Info size={40} className="opacity-20" />
            <p>Aún no hay procesados en esta quiniela.</p>
          </div>
        )}
      </div>
    </div>
  );
};