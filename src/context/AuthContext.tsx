import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  type User, 
  getIdToken 
} from 'firebase/auth';
import { auth, googleProvider } from '../api/firebase';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscripción al estado de auth de Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // ✅ Sincronizar usuario con la BD de Prisma
    try {
      const token = await getIdToken(result.user);
      
      await api.post('/users/register', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Usuario Google sincronizado con BD:', result.user.email);
    } catch (error) {
      console.error('Error sincronizando usuario Google con BD:', error);
    }
  };

  // ✅ NUEVO: Login con email y contraseña
  const loginWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Sincronizar con BD de Prisma
    try {
      const token = await getIdToken(userCredential.user);
      
      await api.post('/users/register', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Usuario sincronizado con BD:', userCredential.user.email);
    } catch (error) {
      console.error('Error sincronizando usuario con BD:', error);
    }
  };

  const logout = () => signOut(auth);

  const getToken = async () => {
    if (!user) return null;
    return await getIdToken(user);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Actualizamos el perfil en Firebase para que el token lleve el nombre
    await updateProfile(userCredential.user, { displayName: name });
    
    // Forzamos una actualización del estado local
    setUser({ ...userCredential.user, displayName: name });

    // ✅ NUEVO: Sincronizar usuario con la BD de Prisma
    try {
      // Obtenemos el token del usuario recién creado
      const token = await getIdToken(userCredential.user);
      
      // Llamamos al endpoint de registro para crear el usuario en Prisma
      // El FirebaseAuthGuard validará el token y creará el usuario
      await api.post('/users/register', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Usuario sincronizado con BD:', userCredential.user.email);
    } catch (error) {
      console.error('Error sincronizando usuario con la BD:', error);
      // No lanzamos error al usuario, ya que se registró en Firebase exitosamente
      // La próxima vez que haga una petición protegida se sincronizará
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout, getToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};