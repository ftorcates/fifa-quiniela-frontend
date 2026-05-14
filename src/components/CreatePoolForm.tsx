import React, { useState } from 'react';
import { api } from '../api/client';
import { useModal } from '../context/ModalContext';
import { Trophy, Hash, DollarSign, Gift, ArrowRight, CheckCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CreatePoolFormProps {
  onSuccess: (poolId: string) => void;
  onBack: () => void;
}

export const CreatePoolForm = ({ onSuccess, onBack }: CreatePoolFormProps) => {
    const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    shortCode: '',
    price: 0,
    reward: ''
  });
  const [loading, setLoading] = useState(false);
  const [createdPool, setCreatedPool] = useState<{id: string, shortCode: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { show } = useModal();
    setLoading(true);
    try {
        // Expandimos el formData para incluir el ownerId necesario
        const payload = {
            ...formData,
            ownerId: user?.uid
        };
      const response = await api.post('/pools', payload);
    setCreatedPool({
        id: response.data.id,
        shortCode: response.data.shortCode 
      });
      show("¡Quiniela creada exitosamente! Comparte el código con los participantes.", "success");
    } catch (error) {
      console.error("Error al crear la quiniela", error);
      show("Hubo un error. Revisa que el Código Corto no esté duplicado.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (createdPool) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl text-center border-t-8 border-emerald-500 animate-in zoom-in duration-300">
        <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">¡Quiniela Creada!</h2>
        <p className="text-slate-500 mb-6">Comparte este ID con tus amigos para que se inscriban:</p>
        
        <div className="bg-slate-100 p-4 rounded-2xl font-mono text-lg font-bold text-primary break-all mb-8 border-2 border-dashed border-slate-300">
          {createdPool.shortCode}
        </div>

        <button 
          onClick={() => onSuccess(createdPool.id)}
          className="w-full bg-[#8A1538] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-900 transition-all"
        >
          Ir al Dashboard de mi Quiniela
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-[#8A1538] p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-yellow-400" /> Configura tu Quiniela
        </h2>
        <p className="text-white/70 text-sm">Define las reglas y premios para tu grupo</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        {/* Título */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Edit3 size={16} className="text-primary" /> Nombre de la Quiniela
          </label>
          <input
            required
            type="text"
            placeholder="Ej: Mundial Oficina 2026"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-primary outline-none transition-all"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* Short Code */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Hash size={16} className="text-primary" /> Código de Acceso (Único)
          </label>
          <input
            required
            type="text"
            placeholder="Ej: OFI-2026"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-primary outline-none transition-all"
            onChange={(e) => setFormData({...formData, shortCode: e.target.value.toUpperCase()})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Precio */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-primary" /> Inscripción
            </label>
            <input
              required
              type="number"
              placeholder="0.00"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-primary outline-none transition-all"
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>

          {/* Premio */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Gift size={16} className="text-primary" /> Recompensa
            </label>
            <input
              required
              type="text"
              placeholder="Ej: 80% del pozo"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-primary outline-none transition-all"
              onChange={(e) => setFormData({...formData, reward: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Creando..." : <>Crear Quiniela <ArrowRight size={20} /></>}
          </button>
        </div>
      </form>
    </div>
  );
};