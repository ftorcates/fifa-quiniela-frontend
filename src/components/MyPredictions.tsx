import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ClipboardList, Plus, Edit2, Clock, AlertCircle, Eye } from 'lucide-react';
import { DEADLINE_PHASE_1 } from '../constants/config';
import { useAuth } from '../context/AuthContext';

interface PredictionTicket {
  id: string;
  status: string;
  createdAt: string;
  predictions: Record<string, { home: number; away: number }>;
}

export const MyPredictions = ({ poolId, onNewPrediction, onEdit }: { 
  poolId: string, 
  onNewPrediction: () => void,
  onEdit: (ticket: PredictionTicket) => void 
}) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<PredictionTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Centralizamos la fecha límite
  const isEditable = new Date() < DEADLINE_PHASE_1;

  useEffect(() => {
    const fetchMyPredictions = async () => {
        if (!user) return;
      try {
        const response = await api.get(`/tickets?poolId=${poolId}&status=PENDING`);
        setPredictions(response.data);
      } catch (error) {
        console.error("Error al obtener pronósticos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPredictions();
  }, [poolId]);

  if (loading) return <div className="p-10 text-center text-slate-500 italic">Cargando tus jugadas...</div>;

  return (
    <div className="p-6">
      {predictions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Clock className="text-amber-500" size={20} /> Pronósticos Pendientes
            </h3>
            <button 
              onClick={onNewPrediction}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-all shadow-md"
            >
              <Plus size={18} /> Nuevo Envío
            </button>
          </div>

          <div className="grid gap-4">
            {predictions.map((ticket) => (
              <div key={ticket.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                    <ClipboardList />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Ticket #{ticket.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-400">
                      Enviado el {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Pendiente
                  </div>
                  
                  {/* Botón con estilo "Ver Detalle" / "Modificar" */}
                  <button 
                    onClick={() => onEdit(ticket)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      isEditable 
                      ? 'bg-slate-800 text-white hover:bg-black shadow-lg shadow-slate-100' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isEditable ? (
                      <>
                        <Edit2 size={18} />
                        <span>Modificar</span>
                      </>
                    ) : (
                      <>
                        <Eye size={18} />
                        <span>Ver Detalle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">¿Aún no has participado?</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-8 text-sm">
            Envía tus pronósticos para este torneo y compite por el gran premio.
          </p>
          <button 
            onClick={onNewPrediction}
            className="bg-[#8A1538] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
          >
            <Plus size={20} /> Enviar mi primer pronóstico
          </button>
        </div>
      )}
    </div>
  );
};