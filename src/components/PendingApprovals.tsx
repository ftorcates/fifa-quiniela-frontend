// components/PendingApprovals.tsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { UserCheck, Eye, Hash } from 'lucide-react';

export const PendingApprovals = ({ poolId, onSelect }: { poolId: string, onSelect: (ticket: any) => void }) => {
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        // Endpoint que traiga tickets filtrados por pool y estado PENDING
        const response = await api.get(`/tickets/admin/pending?poolId=${poolId}`);
        console.log("Pending Approvals", response.data);
        setPendingTickets(response.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchPending();
  }, [poolId]);

  if (loading) return <div className="p-10 text-center italic">Buscando solicitudes...</div>;

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <UserCheck className="text-amber-500" /> Pronósticos por Aprobar
      </h3>
      
      {pendingTickets.length === 0 ? (
        <div className="text-center py-10 text-slate-400">No hay solicitudes pendientes.</div>
      ) : (
        <div className="grid gap-4">
          {pendingTickets.map((ticket: any) => (
            <div key={ticket.id} className="bg-slate-50 p-5 rounded-2xl flex justify-between items-center border border-slate-100">
              <div className="flex items-center gap-6">
                <div>
                    <p className="font-bold text-slate-800">{ticket.participant.displayName}</p>
                    <p className="text-xs text-slate-500">{ticket.participant.email}</p>
                </div>
                {/* ID de la Predicción (Añadido) */}
                <div className="hidden md:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Hash size={14} className="text-slate-400" />
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                    {ticket.id.slice(0, 8)}
                    </span>
                </div>
              </div>
              <button 
                onClick={() => onSelect(ticket)}
                className="bg-[#8A1538] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
              >
                <Eye size={16} /> Revisar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};