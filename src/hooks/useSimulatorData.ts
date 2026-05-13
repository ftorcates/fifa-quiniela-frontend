import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface SimulatorData {
  matches: any[];
  allTickets: any[];
  loading: boolean;
  error: string | null;
}

export const useSimulatorData = (poolId: string): SimulatorData => {
  const { user } = useAuth();
  const [data, setData] = useState<SimulatorData>({
    matches: [],
    allTickets: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchSimulatorData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // 1. Traer partidos NO finalizados (para simular)
        const matchesResponse = await api.get(`/matches?poolId=${poolId}&isFinished=false`);
        const unfinishedMatches = matchesResponse.data || [];

        // 2. Traer TODOS los tickets aprobados de la quiniela (con info del participante)
        const ticketsResponse = await api.get(`/tickets/pool/${poolId}/all?status=APPROVED`);
        const allTickets = ticketsResponse.data || [];

        setData({
          matches: unfinishedMatches,
          allTickets: allTickets,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error cargando datos del simulador:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del simulador',
        }));
      }
    };

    if (poolId && user?.uid) {
      fetchSimulatorData();
    }
  }, [poolId, user?.uid]);

  return data;
};
