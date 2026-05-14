import { Mail, ArrowRight, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useState } from 'react';
import { Register } from './Register';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';

export const Login = () => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const { show } = useModal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
      // El AuthContext detectará el cambio y el App.tsx hará la redirección
    } catch (error) {
      console.error("Error en login con Google:", error);
      show("No pudimos iniciar sesión con Google. Inténtalo de nuevo.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ✅ NUEVO: Manejo de login con email/password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      show('Por favor completa el email y contraseña', "error");
      return;
    }

    try {
      setIsLoggingIn(true);
      await loginWithEmail(email, password);
      // El AuthContext detectará el cambio y el App.tsx hará la redirección
    } catch (error: any) {
      console.error("Error en login con email:", error);
      
      // Mensajes más amigables basados en el error
      if (error.code === 'auth/invalid-login-credentials' || error.message?.includes('INVALID_LOGIN_CREDENTIALS')) {
        show('Email o contraseña incorrectos. Verifica y intenta de nuevo.', "error");
      } else if (error.code === 'auth/user-not-found') {
        show('Este email no está registrado. ¿Deseas registrarte?', "error");
      } else if (error.code === 'auth/wrong-password') {
        show('Contraseña incorrecta. Intenta de nuevo.', "error");
      } else {
        show(error.message || "No pudimos iniciar sesión. Intenta de nuevo.", "error");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Si el usuario elige registrarse, mostramos el componente Register
  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <Register onBack={() => setMode('login')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="bg-[#8A1538] p-10 text-center relative overflow-hidden">
          {/* Un toque de diseño: círculo decorativo */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          
          <h1 className="text-4xl font-black text-white italic tracking-tighter relative z-10">
            QUINIE-MUNDIAL
          </h1>
          <p className="text-red-100 text-[10px] mt-2 font-black uppercase tracking-widest relative z-10">
            Bienvenido de vuelta
          </p>
        </div>

        <div className="p-8 space-y-4">
          {/* Botón Google Funcional */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 text-sm"
            >
              {isLoggingIn ? <Loader2 className="animate-spin text-[#8A1538]" size={18} /> : <FcGoogle size={18} />}
              Google
            </button>
            <button disabled className="flex items-center justify-center gap-2 bg-black py-3 rounded-xl font-bold text-white hover:bg-slate-900 transition-all text-sm opacity-50 cursor-not-allowed" title="Próximamente">
              <FaApple size={18}/>
              Apple
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="h-[1px] bg-slate-100 flex-1"></div>
            <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em]">O usa tu correo</span>
            <div className="h-[1px] bg-slate-100 flex-1"></div>
          </div>

          {/* Formulario de Login Tradicional */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input 
                type="email" 
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#8A1538] outline-none transition-all text-sm disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <LogIn className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#8A1538] outline-none transition-all text-sm disabled:opacity-50"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#8A1538] text-white py-4 rounded-xl font-black shadow-xl shadow-red-100 hover:bg-red-900 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={16} /> : <>Entrar <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Selector de Modo: Registro */}
          <div className="pt-6 text-center">
            <button 
              onClick={() => setMode('register')}
              disabled={isLoggingIn}
              className="text-slate-400 text-xs font-bold hover:text-[#8A1538] transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              <UserPlus size={14} /> ¿No tienes cuenta? <span className="text-[#8A1538] underline">Regístrate gratis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};