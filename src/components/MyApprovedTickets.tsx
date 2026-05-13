import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ClipboardCheck, Eye, Search } from 'lucide-react';

interface Prediction {
  away: number;
  home: number;
}

interface Ranking {
  id: string;
  points: number;
  ticketId: string;
  poolId: string;
  updatedAt: string;
}

interface Pool {
  id: string;
  title: string;
  shortCode: string;
  price: number;
  reward: string;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
}

interface PredictionTicket {
  id: string;
  status: string;
  predictions: Record<string, Prediction>;
  participantId: string;
  poolId: string;
  createdAt: string;
  pool: Pool;
  rankings: Ranking[];
}

export const MyApprovedTickets = ({ poolId, onSelect }: { 
  poolId: string, 
  onSelect: (ticket: any) => void 
}) => {
  const [tickets, setTickets] = useState<PredictionTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedTickets = async () => {
      try {
        const response = await api.get(`/tickets?poolId=${poolId}&status=APPROVED`);
        setTickets(response.data);
      } catch (error) {
        console.error("Error al obtener cartones aprobados", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedTickets();
  }, [poolId]);

  if (loading) return <div className="p-10 text-center text-slate-500 italic">Cargando tus cartones oficiales...</div>;

  return (
    <div className="p-6">
      {tickets.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
              <ClipboardCheck className="text-emerald-500" size={20} /> Mis Cartones Oficiales
            </h3>
          </div>

          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-white border-l-4 border-emerald-500 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <ClipboardCheck className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-tight text-sm md:text-base">
                      Cartón #{ticket.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Validado el {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Visualización de Puntos Dinámica */}
                  <div className="text-right px-4 border-r border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Puntos</p>
                    <p className="text-2xl font-black text-[#8A1538] leading-none">
                        {ticket.rankings?.[0]?.points ?? 0}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => onSelect(ticket)} 
                    className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#8A1538] hover:text-white transition-all shadow-sm"
                  >
                    <Eye size={18} /> Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Sin cartones aprobados</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">
            Tus pronósticos aparecerán aquí una vez que el administrador los apruebe.
          </p>
        </div>
      )}
    </div>
  );
};