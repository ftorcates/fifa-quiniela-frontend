import { useState } from 'react';
import { useSimulatorData } from './hooks/useSimulatorData';
import { Leaderboard } from './components/Leaderboard';
import { PredictionForm } from './components/PredictionForm';
import { 
  LogOut, 
  Trophy, 
  PlusCircle, 
  Search, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Loader2, 
  User as UserIcon,
  Info,
  Edit3
} from 'lucide-react';
import { CreatePoolForm } from './components/CreatePoolForm';
import { MyPredictions } from './components/MyPredictions';
import { MyApprovedTickets } from './components/MyApprovedTickets';
import { DEADLINE_PHASE_1 } from './constants/config';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { api } from './api/client';
import { PendingApprovals } from './components/PendingApprovals';
import { SimulatorView } from './components/SimulatorView';

// Componente wrapper para el simulador
const SimulatorViewWithData = ({ poolId }: { poolId: string }) => {
  const { matches, allTickets, loading, error } = useSimulatorData(poolId);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <p className="text-red-700 text-sm font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-xl">
        <p className="text-blue-700 text-sm font-bold flex items-center gap-2">
          <Info size={18} /> Estás en Modo Simulación. Estos resultados no son reales ni afectan los puntos.
        </p>
      </div>
      <SimulatorView 
        matches={matches}
        allTickets={allTickets}
        loading={loading}
      />
    </div>
  );
};

function App() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<'lobby' | 'dashboard' | 'create'>('lobby');
  const [poolId, setPoolId] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'ranking' | 'predictions' | 'tickets' | 'approvals' | 'simulator'>('ranking');
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [currentPool, setCurrentPool] = useState<any>(null);

  const tabClass = (isActive: boolean) => 
    `flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
      isActive ? 'bg-[#8A1538] text-white shadow-md scale-105' : 'text-slate-500 hover:bg-slate-50'
    }`;

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await logout();
    }
  };

  const handleJoinPool = (id: string) => {
    setPoolId(id);
    setView('dashboard');
  };

  const handleFindPool = async (code: string) => {
    if (!code) return alert("Por favor ingresa un código");
  
    try {
      // Llamamos al endpoint que busca por shortCode (debes tenerlo en NestJS)
      const response = await api.get(`/pools/code/${code.toUpperCase()}`);
      const pool = response.data;
      setCurrentPool(pool);
      // Si la encuentra, seteamos el ID real para el Dashboard y cambiamos la vista
      setPoolId(pool.id);
      setView('dashboard');
    } catch (error) {
      console.error(error);
      alert("No encontramos ninguna quiniela con ese código. ¡Verifícalo!");
    }
  };

  // Determinamos si es el dueño
  const isOwner = currentPool?.ownerId === user?.uid;

  // 1. Pantalla de carga mientras Firebase verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#8A1538]" size={40} />
      </div>
    );
  }

  // 2. Si no hay usuario, mostramos la vista de Login
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* NAVBAR GLOBAL */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('lobby')}>
          <div className="bg-[#8A1538] p-2 rounded-lg text-white font-black italic">QM</div>
          <span className="font-bold text-slate-800 hidden md:block uppercase tracking-tighter">Quinie-Mundial</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{user.displayName}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-slate-100 shadow-sm" />
            ) : (
              <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                <UserIcon size={20} />
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-[#8A1538] font-bold text-sm transition-colors group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="hidden md:inline text-xs uppercase tracking-widest">Salir</span>
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1">
        {view === 'lobby' && (
          <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="text-center py-12">
              <h1 className="text-5xl font-black text-[#8A1538] mb-4 italic tracking-tighter">MIS QUINIELAS</h1>
              <p className="text-slate-500 text-lg">Selecciona una competencia activa o crea la tuya.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tarjeta: Unirse */}
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="bg-amber-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="text-amber-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Buscar una Quiniela</h3>
                <p className="text-slate-500 mb-6">Ingresa el código de la quiniela.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Código EJ: MUND-2026" 
                    className="flex-1 bg-slate-50 border-2 border-transparent p-4 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition-all font-mono"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleFindPool(joinCode);
                      }
                    }}
                  />
                  <button onClick={() => handleFindPool(joinCode)} className="bg-amber-500 text-white p-4 rounded-xl font-bold hover:bg-amber-600 transition-all">
                    Entrar
                  </button>
                </div>
              </div>

              {/* Tarjeta: Crear */}
              <div className="bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-900/20 text-white flex flex-col justify-between">
                <div>
                  <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                    <PlusCircle className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Crear nueva Quiniela</h3>
                  <p className="text-slate-300 mb-6">Administra tus propios premios y participantes.</p>
                </div>
                <button onClick={() => setView('create')} className="w-full bg-white text-slate-900 p-4 rounded-xl font-bold hover:bg-[#8A1538] hover:text-white transition-all">
                  Empezar Ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="p-6">
            <button onClick={() => setView('lobby')} className="mb-6 flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-all">
              <ArrowLeft size={20} /> Volver al Lobby
            </button>
            <CreatePoolForm
              onSuccess={(id) => handleJoinPool(id)} 
              onBack={() => setView('lobby')} 
            />
          </div>
        )}

        {view === 'dashboard' && (
          <main className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
            {/* Header del Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('lobby')} className="p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-sm text-slate-400 transition-all">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tight">Mundial 2026</h2>
                  <p className="text-slate-400 font-medium flex items-center gap-1">
                    <Trophy size={14} className="text-amber-500" /> Pozo Estimado: $450.000
                  </p>
                </div>
              </div>

              {/* Tabs Estilo Piloto */}
              <div className="bg-white p-1.5 rounded-2xl shadow-sm flex gap-1 border border-slate-100 overflow-x-auto">
                <button onClick={() => setActiveTab('ranking')} className={tabClass(activeTab === 'ranking')}>
                  <Trophy size={18} /> Ranking
                </button>
                <button onClick={() => setActiveTab('predictions')} className={tabClass(activeTab === 'predictions')}>
                  <Clock size={18} /> Mis Pronósticos
                </button>
                <button onClick={() => setActiveTab('tickets')} className={tabClass(activeTab === 'tickets')}>
                  <CheckCircle size={18} /> Mis Cartones
                </button>
                <button onClick={() => setActiveTab('simulator')} className={tabClass(activeTab === 'simulator')}>
                  <Edit3 size={18} /> Simular
                </button>
                {isOwner && (
                  <button onClick={() => setActiveTab('approvals')} className={tabClass(activeTab === 'approvals')}>
                    <PlusCircle size={18} className="text-amber-500" /> Aprobar Jugadas
                  </button>
                )}
              </div>
            </div>

            {/* Contenedor de Contenido Dinámico */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[500px] border border-slate-100">
              {activeTab === 'ranking' && <Leaderboard poolId={poolId} />}
              
              {activeTab === 'predictions' && (
                <>
                  {editingTicket ? (
                    <PredictionForm 
                      poolId={poolId} 
                      initialData={editingTicket} 
                      readOnly={new Date() >= DEADLINE_PHASE_1}
                      onCancel={() => setEditingTicket(null)} 
                    />
                  ) : (
                    <MyPredictions 
                      poolId={poolId} 
                      onNewPrediction={() => setEditingTicket({})} 
                      onEdit={(ticket) => setEditingTicket(ticket)} 
                    />
                  )}
                </>
              )}

              {activeTab === 'tickets' && (
                <>
                  {editingTicket ? (
                    <PredictionForm 
                      poolId={poolId} 
                      initialData={editingTicket} 
                      readOnly={new Date() >= DEADLINE_PHASE_1} 
                      onCancel={() => setEditingTicket(null)} 
                    />
                  ) : (
                    <MyApprovedTickets 
                      poolId={poolId} 
                      onSelect={(ticket) => setEditingTicket(ticket)} 
                    />
                  )}
                </>
              )}

              {activeTab === 'approvals' && (
                <>
                  {editingTicket ? (
                    <PredictionForm 
                      poolId={poolId} 
                      initialData={editingTicket} 
                      readOnly={true} // Siempre readOnly para el admin
                      isAdmin={true}  // <--- Aquí es donde inyectamos el valor
                      onCancel={() => setEditingTicket(null)} 
                    />
                  ) : (
                    <PendingApprovals 
                      poolId={poolId} 
                      onSelect={(ticket) => setEditingTicket(ticket)} 
                    />
                  )}
                </>
              )}

              {activeTab === 'simulator' && (
                <SimulatorViewWithData poolId={poolId} />
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;