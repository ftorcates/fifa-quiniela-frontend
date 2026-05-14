import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

// Traduce errores de Firebase a mensajes amigables
const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error.code || error.message || '';
  
  if (errorCode.includes('auth/email-already-in-use')) {
    return 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.';
  }
  
  if (errorCode.includes('auth/weak-password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  
  if (errorCode.includes('auth/invalid-email')) {
    return 'El email no es válido. Verifica que esté bien escrito.';
  }
  
  if (errorCode.includes('auth/operation-not-allowed')) {
    return 'El registro de email/contraseña no está habilitado. Contacta al administrador.';
  }
  
  if (errorCode.includes('auth/network-request-failed')) {
    return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
  }
  
  return 'No pudimos registrarte. Intenta de nuevo.';
};

export const Register = ({ onBack }: { onBack: () => void }) => {
  const { registerWithEmail } = useAuth();
  const { show } = useModal();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWithEmail(formData.email, formData.password, formData.name);
      show("¡Registrado exitosamente! Bienvenido a Quinie-Mundial.", "success");
      // Al registrarse con éxito, el AuthContext cambia y App.tsx redirige solo
    } catch (error: any) {
      show(getFirebaseErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
      <div className="bg-[#8A1538] p-8 text-center text-white">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Únete a la Quiniela</h2>
        <p className="text-red-100 text-xs mt-1 uppercase tracking-widest font-bold">Crea tu cuenta oficial</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
            <input 
              required
              type="text" 
              placeholder="Ej: Freddy Torcates"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#8A1538] outline-none transition-all"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
            <input 
              required
              type="email" 
              placeholder="correo@ejemplo.com"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#8A1538] outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#8A1538] outline-none transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-[#8A1538] text-white py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-900 transition-all flex items-center justify-center gap-2 mt-6 uppercase text-sm tracking-widest disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Registrarme <ArrowRight size={18} /></>}
        </button>

        <button 
          type="button"
          onClick={onBack}
          className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors py-2"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </form>
    </div>
  );
};